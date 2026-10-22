import { AppDataSource } from "../config/database.js";
import { HeritageVersionMedia } from "../models/heritage-version-media.model.js";
import { HeritageVersion } from "../models/heritage-version.model.js";
import { Heritage } from "../models/heritage.model.js";
import { HeritageStatus } from "../types/enums/heritage.enum.js";
import { HeritageSnapshot } from "../types/interface/heritage-snapshot.type.js";
import { sha256 } from "../utils/hash.until.js";
import { BlockchainService } from "./blockchain.service.js";

export interface GetVersionFilter {
  search?: string,
  location?: string,
  page?: number;
  limit?: number;
}

export class HeritageVersionService {
  private static versionRepo = AppDataSource.getRepository(HeritageVersion);
  private static IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs';
  static async publish(
    heritageId: string,
    adminId: string
  ): Promise<HeritageVersion> {
    const savedVersion = await AppDataSource.transaction(async (manager) => {
      const heritageRepo = manager.getRepository(Heritage);
      const versionRepo = manager.getRepository(HeritageVersion);
      const versionMediaRepo = manager.getRepository(HeritageVersionMedia);

      const heritage = await heritageRepo
        .createQueryBuilder('heritage')
        .leftJoinAndSelect('heritage.field', 'field')
        .leftJoinAndSelect('heritage.media', 'media')
        .where('heritage.id = :heritageId', { heritageId })
        .setLock('pessimistic_write')
        .getOne();

      if (!heritage) {
        throw new Error('Không tìm thấy Heritage');
      }

      if (heritage.status !== HeritageStatus.VERIFIED) {
        throw new Error('Chỉ Heritage đã được VERIFIED mới được Publish');
      }

      if (!heritage.sourceDocumentCid) {
        throw new Error('Heritage chưa có SourceDocumentId');
      }

      //get next version
      const latestVersion = await versionRepo
        .createQueryBuilder('version')
        .select('MAX(version.version)', 'max')
        .where('version.heritageId = :heritageId', { heritageId })
        .getRawOne<{ max: number | null }>();

      const nextVersion = (latestVersion?.max ?? 0) + 1;

      const media = [...(heritage.media ?? [])]
        .sort((a, b) => {
          if (a.order !== b.order) {
            return a.order - b.order;
          }

          return a.id.localeCompare(b.id);
        });

      const snapshot: HeritageSnapshot = {
        schemaVersion: 1,

        heritage: {
          heritageCode: heritage.heritageCode,
          name: heritage.name,
          description: heritage.description,
          location: heritage.location,

          source: heritage.source,
          sourceOrganization: heritage.sourceOrganization,

          sourceDocumentNumber:
            heritage.sourceDocumentNumber ?? null,

          sourceUrl: heritage.sourceUrl ?? null,

          sourceDocumentCid:
            heritage.sourceDocumentCid ?? null,

          recognizedAt: heritage.recognizedAt
            ? heritage.recognizedAt.toISOString()
            : null,
        },

        field: {
          code: heritage.field.code,
          name: heritage.field.name,
        },

        media: media.map(item => ({
          type: item.type,
          cid: item.cid,
          caption: item.caption as string | null,
          order: item.order
        }))
      }

      //hash snapshot
      const dataHash = sha256(snapshot);

      //create heritage version
      const version = versionRepo.create({
        heritageId: heritage.id,
        version: nextVersion,
        canonicalData: snapshot,
        dataHash,
        createdBy: adminId
      })

      const saved = await versionRepo.save(version);

      //copy media ---> version Media
      if (media.length > 0) {
        const versionMediaEntities = media.map((item) => {
          return versionMediaRepo.create({
            versionId: saved.id!,
            type: item.type,
            url: item.url,
            cid: item.cid,
            caption: item.caption,
            order: item.order,
            fileName: item.fileName,
            mimeType: item.mimeType,
            fileSize: item.fileSize,
            thumbnailUrl: item.thumbnailUrl
          });
        });

        await versionMediaRepo.save(versionMediaEntities);
      }

      return versionRepo.findOneOrFail({
        where: {
          id: saved.id,
        },
        relations: [
          'heritage',
          'heritage.field',
          'media'
        ],
      });
    })

    const blockchainResult = await BlockchainService.publishVersion(
      savedVersion.heritageId,
      savedVersion.version,
      savedVersion.dataHash
    );

    // PHASE 3: UPDATE DATABASE SAU KHI BLOCKCHAIN SUCCESS
    // =========================================================

    const versionRepo = AppDataSource.getRepository(HeritageVersion);

    const heritageRepo = AppDataSource.getRepository(Heritage);

    // ---------------------------------------------------------
    // 12. Lưu transaction hash
    // ---------------------------------------------------------

    savedVersion.blockchainTxHash = blockchainResult.txHash;

    await versionRepo.save(savedVersion);

    // ---------------------------------------------------------
    // 13. Đổi Heritage -> PUBLISHED
    // ---------------------------------------------------------

    await heritageRepo.update(
      savedVersion.heritageId,
      {
        status: HeritageStatus.PUBLISHED,
      }
    );

    // ---------------------------------------------------------
    // 14. Return version cuối cùng
    // ---------------------------------------------------------

    return versionRepo.findOneOrFail({
      where: {
        id: savedVersion.id,
      },
      relations: [
        "heritage",
        "heritage.field",
        "media"
      ],
    });
  }

  static async getLatestVersion(filters: GetVersionFilter) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, filters.limit || 12);
    const skip = (page - 1) * limit;

    // 1. Subquery lấy MAX(version) cho từng heritageId
    const latestVersionSubQuery = this.versionRepo
      .createQueryBuilder('sub')
      .select('sub.heritageId', 'sub_heritageId')
      .addSelect('MAX(sub.version)', 'max_version')
      .groupBy('sub.heritageId');

    // 2. Query chính INNER JOIN Subquery + Relation Heritage & Media
    const query = this.versionRepo
      .createQueryBuilder('version')
      .innerJoin(
        `(${latestVersionSubQuery.getQuery()})`,
        'latest',
        'version.heritageId = latest.sub_heritageId AND version.version = latest.max_version'
      )
      .setParameters(latestVersionSubQuery.getParameters())
      .leftJoinAndSelect('version.heritage', 'heritage')
      .leftJoinAndSelect('heritage.field', 'field')
      .leftJoinAndSelect('version.media', 'media');

    // 3. Điều kiện lọc Search (Tên hoặc Mã di sản) trực tiếp bằng SQL
    if (filters.search) {
      const keyword = `%${filters.search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(heritage.name) LIKE :search OR LOWER(heritage.heritageCode) LIKE :search)',
        { search: keyword }
      );
    }

    // 4. Điều kiện lọc Location (Tỉnh / Huyện / Xã) trực tiếp bằng SQL
    if (filters.location) {
      const locKeyword = `%${filters.location.trim().toLowerCase()}%`;
      // Tìm kiếm text trên cột location (dù lưu dạng JSONB hay TEXT)
      query.andWhere(
        'LOWER(CAST(heritage.location AS TEXT)) LIKE :location',
        { location: locKeyword }
      );
    }

    // 5. Thêm Sắp xếp, Skip, Take (Limit/Offset) ở cấp độ Database
    query
      .orderBy('version.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    // 6. Thực thi Query: Lấy danh sách bản ghi trang hiện tại & Tổng số bản ghi thỏa điều kiện
    const [versions, total] = await query.getManyAndCount();

    // 7. Parse và chuẩn hóa dữ liệu Media cho 12 bản ghi của trang hiện tại
    const items = versions.map((v) => {
      if (v.media && v.media.length > 0) {
        v.media.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }

      const canonical =
        typeof v.canonicalData === 'string'
          ? JSON.parse(v.canonicalData)
          : v.canonicalData;

      const mediaList =
        v.media && v.media.length > 0
          ? v.media.map((m) => ({
            id: m.id,
            type: m.type,
            url: m.url,
            thumbnailUrl: m.thumbnailUrl || m.url,
            caption: m.caption,
            cid: m.cid,
            order: m.order,
            fileSize: m.fileSize,
          }))
          : (canonical?.media || []).map((m: any) => {
            const fallbackUrl = m.url || (m.cid ? `${this.IPFS_GATEWAY}/${m.cid}` : '');
            return {
              type: m.type,
              url: fallbackUrl,
              thumbnailUrl: m.thumbnailUrl || fallbackUrl,
              caption: m.caption,
              cid: m.cid,
              order: m.order,
            };
          });

      return {
        ...v,
        canonicalData: canonical,
        mediaList,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // Lấy chi tiết phiên bản theo ID (kèm relation version.media)
  static async getVersionById(versionId: string) {
    const version = await this.versionRepo
      .createQueryBuilder('version')
      .leftJoinAndSelect('version.media', 'media')
      .where('version.heritageId = :versionId', { versionId })
      .addOrderBy('media.order', 'ASC')
      .getOne();

    if (!version) return null;

    // Parse Canonical Data nếu đang ở dạng chuỗi JSON
    const canonical = typeof version.canonicalData === 'string'
      ? JSON.parse(version.canonicalData)
      : version.canonicalData;

    // Xử lý ưu tiên danh sách Media từ relation version.media (Cloudinary)
    const mediaList = (version.media && version.media.length > 0)
      ? version.media.map((m) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        thumbnailUrl: m.thumbnailUrl || m.url, // Ưu tiên thumbnailUrl Cloudinary
        caption: m.caption,
        cid: m.cid,
        order: m.order,
        fileSize: m.fileSize,
      }))
      : (canonical?.media || []).map((m: any) => {
        const fallbackUrl = m.url || (m.cid ? `${this.IPFS_GATEWAY}/${m.cid}` : '');
        return {
          type: m.type,
          url: fallbackUrl,
          thumbnailUrl: m.thumbnailUrl || fallbackUrl,
          caption: m.caption,
          cid: m.cid,
          order: m.order,
        };
      });

    return {
      ...version,
      canonicalData: canonical,
      mediaList,
    };
  }
}
