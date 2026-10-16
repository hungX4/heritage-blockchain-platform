import { AppDataSource } from "../config/database.js";
import { HeritageVersion } from "../models/heritage-version.model.js";
import { Heritage } from "../models/heritage.model.js";
import { sha256 } from "../utils/hash.until.js";
import { buildHeritageSnapshot } from "../utils/heritage-snapshot.util.js";
import { BlockchainService } from "./blockchain.service.js";

export class HeritageIntegrityService {
  static async verify(heritageId: string) {
    const versionRepo = AppDataSource.getRepository(HeritageVersion);

    //get version
    const version = await versionRepo
      .createQueryBuilder("version")
      .where("version.heritageId = :heritageId", {
        heritageId,
      })
      .andWhere("version.blockchainTxHash IS NOT NULL")
      .orderBy("version.version", "DESC")
      .getOne();

    if (!version) {
      throw new Error("HERITAGE VERSION NOT FOUND");
    }

    const currentDataHash = sha256(version.canonicalData);

    const databaseValid = currentDataHash.toLowerCase() === version.dataHash.toLowerCase();

    const blockchainVersion = await BlockchainService.getVersion(
      heritageId,
      version.version
    )

    const blockchainDataHash = blockchainVersion.dataHash.replace(/^0x/, "");

    const blockchainValid = version.dataHash.toLowerCase() === blockchainDataHash.toLowerCase();

    const integrityValid = databaseValid && blockchainValid;

    return {
      heritageId,

      version: version.version,

      integrityValid,

      currentDataHash,

      databaseDataHash: version.dataHash,

      blockchainDataHash,

      databaseValid,

      blockchainValid,

      blockchainTxHash: version.blockchainTxHash,

      verifiedAt: new Date(),
    };
  }
}
