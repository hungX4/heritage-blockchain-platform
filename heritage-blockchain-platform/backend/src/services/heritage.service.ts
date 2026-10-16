import { AppDataSource } from '../config/database.js';
import { HeritageMedia } from '../models/heritage-media.model.js';
import { Heritage } from '../models/heritage.model.js';
import { CreateHeritageDto, UpdateStatusDto } from '../types/dto/heritage.dto.js';
import { HeritageStatus } from '../types/enums/heritage.enum.js';
import { VerificationService } from './verification.service.js';


export class HeritageService {
  private static get heritageRepository() {
    return AppDataSource.getRepository(Heritage);
  }

  static async getAllHeritages(filters: { status?: HeritageStatus; search?: string }) {
    const query = this.heritageRepository
      .createQueryBuilder('heritage')
      .orderBy('heritage.createdAt', 'DESC')
      .leftJoinAndSelect('heritage.versions', 'versions')
      .addOrderBy('versions.version', 'DESC');

    if (filters.status) {
      query.andWhere('heritage.status = :status', { status: filters.status });
    }

    if (filters.search) {
      query.andWhere('(heritage.name LIKE :search OR heritage.heritageCode LIKE :search)', {
        search: `%${filters.search}%`
      });
    }

    return query.getMany();
  }

  static async getRecentHeritages(limit = 5) {
    return this.heritageRepository.find({
      take: limit,
      order: {
        createdAt: 'DESC'
      }
    });
  }

  static async getHeritageById(id: string) {
    return this.heritageRepository.findOneBy({
      id,
    });
  }

  static async createHeritage(heritageData: CreateHeritageDto) {
    const duplicate = await this.heritageRepository.findOneBy({
      heritageCode: heritageData.heritageCode.trim()
    });

    if (duplicate) {
      throw new Error('HERITAGE_CODE_EXISTS');
    }

    return AppDataSource.transaction(async (transactionalEntityManager) => {
      // 1. Tạo bản ghi Heritage
      const newHeritage = transactionalEntityManager.create(Heritage, {
        heritageCode: heritageData.heritageCode.trim(),
        name: heritageData.name.trim(),
        description: heritageData.description.trim(),
        fieldId: heritageData.category.trim(),
        location: heritageData.location,
        source: heritageData.source.trim(),
        sourceOrganization: heritageData.sourceOrganization.trim(),
        sourceDocumentNumber: heritageData.sourceDocumentNumber?.trim(),
        sourceUrl: heritageData.sourceUrl?.trim(),
        sourceDocumentCid: heritageData.sourceDocumentCid?.trim(),
        recognizedAt: heritageData.recognizedAt ? new Date(heritageData.recognizedAt) : undefined,
        status: HeritageStatus.DRAFT,
      });

      const savedHeritage = await transactionalEntityManager.save(Heritage, newHeritage);

      // 2. Nếu có danh sách media đi kèm -> Tạo các bản ghi HeritageMedia
      if (heritageData.media && heritageData.media.length > 0) {
        const mediaEntities = heritageData.media.map((item, index) =>
          transactionalEntityManager.create(HeritageMedia, {
            heritageId: savedHeritage.id,
            type: item.type,
            url: item.url,
            cid: item.cid || '',
            caption: item.caption,
            order: item.order ?? index,
            fileName: item.fileName,
            mimeType: item.mimeType,
            fileSize: item.fileSize,
            thumbnailUrl: item.thumbnailUrl,
          })
        );

        await transactionalEntityManager.save(HeritageMedia, mediaEntities);
      }

      // 3. Trả về Heritage hoàn chỉnh kèm danh sách media
      return transactionalEntityManager.findOne(Heritage, {
        where: { id: savedHeritage.id },
        relations: ['media'],
      });
    });
  }

  static async updateHeritage(id: string, heritageData: CreateHeritageDto) {
    const heritage =
      await this.heritageRepository.findOneBy({ id });

    if (!heritage) {
      throw new Error('Heritage not found');
    }

    if (heritageData.heritageCode && heritageData.heritageCode.trim() !== heritage.heritageCode) {
      const duplicate = await this.heritageRepository.findOneBy({
        heritageCode: heritageData.heritageCode.trim()
      });

      if (duplicate) {
        throw new Error('HERITAGE_CODE_EXISTS');
      }
    }

    heritage.heritageCode = heritageData.heritageCode?.trim() ?? heritage.heritageCode;
    heritage.name = heritageData.name?.trim() ?? heritage.name;
    heritage.description = heritageData.description?.trim() ?? heritage.description;
    heritage.fieldId = heritageData.category?.trim() ?? heritage.fieldId;
    heritage.location = heritageData.location ?? heritage.location;
    heritage.source = heritageData.source?.trim() ?? heritage.source;
    heritage.sourceOrganization = heritageData.sourceOrganization?.trim() ?? heritage.sourceOrganization;
    heritage.sourceDocumentNumber = heritageData.sourceDocumentNumber?.trim() ?? heritage.sourceDocumentNumber;
    heritage.sourceUrl = heritageData.sourceUrl?.trim() ?? heritage.sourceUrl;
    heritage.sourceDocumentCid = heritageData.sourceDocumentCid?.trim() ?? heritage.sourceDocumentCid;
    heritage.recognizedAt = heritageData.recognizedAt ? new Date(heritageData.recognizedAt) : heritage.recognizedAt;

    return this.heritageRepository.save(heritage);
  }

  static async submitHeritage(id: string) {
    const heritage = await this.heritageRepository.findOneBy({ id });

    if (!heritage) {
      throw new Error('HERITAGE_NOT_FOUND');
    }

    if (heritage.status !== HeritageStatus.DRAFT && heritage.status !== HeritageStatus.REJECTED) {
      throw new Error('HERITAGE_CANNOT_BE_SUBMITTED');
    }

    heritage.status = HeritageStatus.SUBMITTED;
    await this.heritageRepository.save(heritage);

    return heritage;
  }

  static async updateHeritageStatus(id: string, status: UpdateStatusDto) {
    const heritage = await this.heritageRepository.findOneBy({ id });

    if (!heritage) {
      throw new Error('HERITAGE_NOT_FOUND');
    }
    console.log(status.status)
    heritage.status = status.status;
    return this.heritageRepository.save(heritage);
  }

  static async deleteHeritage(id: string) {
    const heritage = await this.heritageRepository.findOneBy({ id });

    if (!heritage) {
      throw new Error('HERITAGE_NOT_FOUND');
    }

    return this.heritageRepository.remove(heritage);
  }
}
