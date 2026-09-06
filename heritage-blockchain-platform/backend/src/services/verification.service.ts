import { AppDataSource } from '../config/database.js';
import { Heritage, HeritageStatus } from '../models/heritage.model.js';
import { Verification, VerificationStatus } from '../models/verification.model.js';
import { HeritageVersionService } from './heritage-version.service.js';

export type VerificationInput = {
  reviewerId?: string;
  notes?: string;
};

export class VerificationService {
  private static get heritageRepository() {
    return AppDataSource.getRepository(Heritage);
  }

  private static get verificationRepository() {
    return AppDataSource.getRepository(Verification);
  }

  static async getAllVerifications() {
    return this.verificationRepository.find({
      relations: {
        heritage: true,
        reviewer: true
      },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  static async getVerificationById(id: string) {
    return this.verificationRepository.findOne({
      where: {
        id
      },
      relations: {
        heritage: true,
        reviewer: true
      }
    });
  }

  static async getVerificationsByHeritageId(heritageId: string) {
    const heritage = await this.heritageRepository.findOneBy({ id: heritageId });

    if (!heritage) {
      throw new Error('HERITAGE_NOT_FOUND');
    }

    return this.verificationRepository.find({
      where: {
        heritageId
      },
      relations: {
        reviewer: true
      },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  static async startReview(heritageId: string, input: VerificationInput) {
    const heritage = await this.heritageRepository.findOneBy({ id: heritageId });

    if (!heritage) {
      throw new Error('HERITAGE_NOT_FOUND');
    }

    if (heritage.status !== HeritageStatus.SUBMITTED) {
      throw new Error('HERITAGE_MUST_BE_SUBMITTED');
    }

    heritage.status = HeritageStatus.UNDER_REVIEW;
    await this.heritageRepository.save(heritage);

    const verification = this.verificationRepository.create({
      heritageId,
      reviewerId: input.reviewerId,
      status: VerificationStatus.PENDING,
      notes: input.notes?.trim()
    });

    return this.verificationRepository.save(verification);
  }

  static async approveHeritage(heritageId: string, input: VerificationInput) {
    const heritage = await this.heritageRepository.findOneBy({ id: heritageId });

    if (!heritage) {
      throw new Error('HERITAGE_NOT_FOUND');
    }

    if (heritage.status !== HeritageStatus.UNDER_REVIEW) {
      throw new Error('HERITAGE_MUST_BE_UNDER_REVIEW');
    }

    const verification = this.verificationRepository.create({
      heritageId,
      reviewerId: input.reviewerId,
      status: VerificationStatus.APPROVED,
      notes: input.notes?.trim()
    });

    heritage.status = HeritageStatus.VERIFIED;

    const savedVerification = await this.verificationRepository.save(verification);
    await this.heritageRepository.save(heritage);
    await HeritageVersionService.createVersionForHeritage(heritageId, input.reviewerId);

    return savedVerification;
  }

  static async rejectHeritage(heritageId: string, input: VerificationInput) {
    const heritage = await this.heritageRepository.findOneBy({ id: heritageId });

    if (!heritage) {
      throw new Error('HERITAGE_NOT_FOUND');
    }

    if (heritage.status !== HeritageStatus.UNDER_REVIEW) {
      throw new Error('HERITAGE_MUST_BE_UNDER_REVIEW');
    }

    const verification = this.verificationRepository.create({
      heritageId,
      reviewerId: input.reviewerId,
      status: VerificationStatus.REJECTED,
      notes: input.notes?.trim()
    });

    heritage.status = HeritageStatus.REJECTED;

    await this.verificationRepository.save(verification);
    await this.heritageRepository.save(heritage);

    return verification;
  }
}
