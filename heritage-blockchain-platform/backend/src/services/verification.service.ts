import { AppDataSource } from '../config/database.js';
import { Heritage } from '../models/heritage.model.js';
import { Expert } from '../models/expert.model.js';
import { Verification } from '../models/verification.model.js';
import { HeritageStatus } from '../types/enums/heritage.enum.js';
import { VerificationStatus } from '../types/enums/verification.enum.js';

export class VerificationService {
  private static heritageRepo = AppDataSource.getRepository(Heritage);
  private static expertRepo = AppDataSource.getRepository(Expert);
  private static verificationRepo = AppDataSource.getRepository(Verification);

  /**
   * =======================================================
   * BƯỚC 4: THUẬT TOÁN MATCHING & TỰ ĐỘNG GÁN 5 CHUYÊN GIA
   * =======================================================
   * Được gọi ngay khi hồ sơ chuyển sang trạng thái SUBMITTED
   */
  static async autoAssignExperts(
    heritageId: string,
    requiredExperts: number,
  ) {
    if (requiredExperts < 1) {
      throw new Error('INVALID_EXPERT_COUNT');
    }
    const heritage = await this.heritageRepo.findOne({
      where: { id: heritageId },
    });

    if (!heritage) {
      throw new Error('HERITAGE_NOT_FOUND');
    }

    // Không cho giao lại nếu Heritage đang được thẩm định
    if (heritage.status === HeritageStatus.UNDER_REVIEW) {
      throw new Error('HERITAGE_ALREADY_UNDER_REVIEW');
    }

    // 1. Tìm expert đúng chuyên môn
    const matchedExperts = await this.expertRepo
      .createQueryBuilder('expert')
      .innerJoin(
        'expert.specializationMappings',
        'specMapping',
      )
      .innerJoin(
        'specMapping.specialization',
        'spec',
      )
      .innerJoin(
        'spec.fieldMappings',
        'fieldMapping',
      )
      .where(
        'fieldMapping.fieldId = :fieldId',
        {
          fieldId: heritage.fieldId,
        },
      )
      .distinct(true)
      .orderBy('RAND()')
      .limit(requiredExperts)
      .getMany();

    // 2. Không đủ expert phù hợp thì KHÔNG giao task
    if (matchedExperts.length < requiredExperts) {
      throw new Error(
        `NOT_ENOUGH_MATCHED_EXPERTS: Required ${requiredExperts}, found ${matchedExperts.length}`,
      );
    }

    // 3. Tạo verification task
    const verifications = matchedExperts.map(
      expert =>
        this.verificationRepo.create({
          heritageId: heritage.id,
          expertId: expert.id,
          status: VerificationStatus.PENDING,
        }),
    );

    await this.verificationRepo.save(verifications);

    // 4. Update Heritage
    heritage.status = HeritageStatus.UNDER_REVIEW;

    await this.heritageRepo.save(heritage);

    return {
      message: `Đã phân công thành công ${matchedExperts.length} chuyên gia thẩm định`,
      totalExperts: matchedExperts.length,
      expertIds: matchedExperts.map(
        expert => expert.id,
      ),
    };
  }

  /**
   * =======================================================
   * BƯỚC 5: LOGIC BÌNH CHỌN & XỬ LÝ QUY TẮC 3/5
   * =======================================================
   * Được gọi khi Chuyên gia gửi đánh giá (APPROVED hoặc REJECTED)
   */
  static async submitVote(params: {
    verificationId: string;
    expertId: string;
    status:
    | VerificationStatus.APPROVED
    | VerificationStatus.REJECTED
    | VerificationStatus.ABSTAINED;
    notes?: string;
  }) {
    const {
      verificationId,
      expertId,
      status,
      notes,
    } = params;

    return AppDataSource.transaction(
      async transactionalEntityManager => {

        const verificationRepo =
          transactionalEntityManager.getRepository(
            Verification,
          );

        const heritageRepo =
          transactionalEntityManager.getRepository(
            Heritage,
          );

        // ================================
        // 1. Tìm verification
        // ================================

        const verification =
          await verificationRepo.findOne({
            where: {
              id: verificationId,
              expertId,
            },
          });

        if (!verification) {
          throw new Error(
            'VERIFICATION_NOT_FOUND_OR_UNAUTHORIZED',
          );
        }

        // ================================
        // 2. Check expert đã vote chưa
        // ================================

        if (
          verification.status !==
          VerificationStatus.PENDING
        ) {
          throw new Error(
            'VOTE_ALREADY_SUBMITTED',
          );
        }

        // ================================
        // 3. Lock Heritage
        // ================================

        const heritage =
          await heritageRepo
            .createQueryBuilder(
              'heritage',
            )
            .setLock(
              'pessimistic_write',
            )
            .where(
              'heritage.id = :heritageId',
              {
                heritageId:
                  verification.heritageId,
              },
            )
            .getOne();

        if (!heritage) {
          throw new Error(
            'HERITAGE_NOT_FOUND',
          );
        }

        // ================================
        // 4. Check Heritage đã finalize
        // ================================

        if (heritage.status === HeritageStatus.VERIFIED || heritage.status === HeritageStatus.REJECTED
        ) {
          throw new Error('HERITAGE_ALREADY_FINALIZED');
        }

        // ================================
        // 5. Save vote
        // ================================

        verification.status = status;
        verification.notes = notes;

        await verificationRepo.save(
          verification,
        );

        // ================================
        // 6. Lấy toàn bộ vote
        // ================================

        const allVotes = await verificationRepo.find({
          where: {
            heritageId: verification.heritageId,
          },
        });

        // ================================
        // 7. Đếm số lượng
        // ================================

        const totalAssigned = allVotes.length;

        const approvedCount = allVotes.filter(vote => vote.status === VerificationStatus.APPROVED).length;

        const rejectedCount =
          allVotes.filter(
            vote =>
              vote.status ===
              VerificationStatus.REJECTED,
          ).length;

        const abstainedCount =
          allVotes.filter(
            vote =>
              vote.status ===
              VerificationStatus.ABSTAINED,
          ).length;

        const completedCount = approvedCount + rejectedCount + abstainedCount;

        // ================================
        // 8. Chưa đủ expert hoàn thành
        // ================================

        if (
          completedCount < totalAssigned
        ) {
          return {
            currentApproved: approvedCount,
            currentRejected: rejectedCount,
            currentAbstained: abstainedCount,
            totalAssigned,
            completedCount,
            heritageStatus: heritage.status,
            isFinalized: false,
          };
        }

        // ================================
        // 9. Tất cả expert đã vote
        // ================================

        let finalResult:
          | HeritageStatus.VERIFIED
          | HeritageStatus.REJECTED;

        // Có ABSTAINED
        if (abstainedCount > 0) {

          // APPROVED nhiều hơn REJECTED
          if (approvedCount > rejectedCount) {
            finalResult = HeritageStatus.VERIFIED;
          } else {
            finalResult = HeritageStatus.REJECTED;
          }

        } else {

          // Không có ABSTAINED
          // Cần đồng thuận mạnh hơn
          if (approvedCount > rejectedCount + 1) {
            finalResult = HeritageStatus.VERIFIED;
          } else {
            finalResult = HeritageStatus.REJECTED;
          }
        }

        // ================================
        // 10. Update Heritage
        // ================================

        heritage.status = finalResult;

        await heritageRepo.save(heritage);

        return {
          currentApproved: approvedCount,
          currentRejected: rejectedCount,
          currentAbstained: abstainedCount,
          totalAssigned,
          completedCount,
          heritageStatus: heritage.status,
          isFinalized: true,
        };
      },
    );
  }

  /**
   * Lấy danh sách nhiệm vụ thẩm định của Chuyên gia
   */
  static async getAssignmentsByExpert(expertId: string) {
    return this.verificationRepo.find({
      where: { expertId },
      relations: ['heritage'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy danh sách phiếu thẩm định theo Mã di sản
   */
  static async getVerificationsByHeritage(heritageId: string) {
    return this.verificationRepo.find({
      where: { heritageId },
      relations: ['expert'],
      order: { createdAt: 'ASC' },
    });
  }
}
