import { AppDataSource } from '../config/database.js';
import { Heritage, HeritageStatus } from '../models/heritage.model.js';
import { HeritageVersion } from '../models/heritage-version.model.js';
import { HashService, type CanonicalHeritageData } from './hash.service.js';

export class HeritageVersionService {
  private static readonly hashService = new HashService();

  private static get heritageRepository() {
    return AppDataSource.getRepository(Heritage);
  }

  private static get heritageVersionRepository() {
    return AppDataSource.getRepository(HeritageVersion);
  }

  static async getVersionsByHeritageId(heritageId: string) {
    await this.ensureHeritageExists(heritageId);

    return this.heritageVersionRepository.find({
      where: {
        heritageId
      },
      order: {
        version: 'DESC'
      }
    });
  }

  static async getLatestVersionByHeritageId(heritageId: string) {
    await this.ensureHeritageExists(heritageId);

    return this.heritageVersionRepository.findOne({
      where: {
        heritageId
      },
      order: {
        version: 'DESC'
      }
    });
  }

  static async createVersionForHeritage(heritageId: string, createdBy?: string) {
    const heritage = await this.heritageRepository.findOneBy({ id: heritageId });

    if (!heritage) {
      throw new Error('HERITAGE_NOT_FOUND');
    }

    if (heritage.status !== HeritageStatus.VERIFIED && heritage.status !== HeritageStatus.PUBLISHED) {
      throw new Error('HERITAGE_MUST_BE_VERIFIED');
    }

    const latestVersion = await this.getLatestVersionByHeritageId(heritageId);
    const nextVersion = latestVersion ? latestVersion.version + 1 : 1;
    const canonicalData = this.buildCanonicalData(heritage, nextVersion);
    const dataHash = this.hashService.createSha256Hash(canonicalData);

    const heritageVersion = this.heritageVersionRepository.create({
      heritageId,
      version: nextVersion,
      canonicalData: this.hashService.canonicalizeHeritageData(canonicalData),
      dataHash,
      createdBy
    });

    return this.heritageVersionRepository.save(heritageVersion);
  }

  private static async ensureHeritageExists(heritageId: string) {
    const heritage = await this.heritageRepository.findOneBy({ id: heritageId });

    if (!heritage) {
      throw new Error('HERITAGE_NOT_FOUND');
    }

    return heritage;
  }

  private static buildCanonicalData(heritage: Heritage, version: number): CanonicalHeritageData {
    return {
      heritageCode: heritage.heritageCode,
      name: heritage.name,
      description: heritage.description,
      category: heritage.category,
      source: heritage.source,
      sourceOrganization: heritage.sourceOrganization,
      sourceReference: heritage.sourceReference,
      version
    };
  }
}
