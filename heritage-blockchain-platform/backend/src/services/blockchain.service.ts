import {
  Contract,
  JsonRpcProvider,
  Wallet,
  ZeroAddress,
  zeroPadValue,
  getBytes,
} from 'ethers';

import HeritageRegistryArtifact from '../blockchain/abi/HeritageRegistry.abi.json' with { type: 'json' };

export class BlockchainService {
  private static provider: JsonRpcProvider;
  private static wallet: Wallet;
  private static contract: Contract;

  private static initialize() {
    if (this.contract) {
      return;
    }

    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    const contractAddress =
      process.env.HERITAGE_REGISTRY_ADDRESS;

    if (!rpcUrl) {
      throw new Error(
        'BLOCKCHAIN_RPC_URL chưa được cấu hình'
      );
    }

    if (!privateKey) {
      throw new Error(
        'BLOCKCHAIN_PRIVATE_KEY chưa được cấu hình'
      );
    }

    if (!contractAddress) {
      throw new Error(
        'HERITAGE_REGISTRY_ADDRESS chưa được cấu hình'
      );
    }

    if (contractAddress === ZeroAddress) {
      throw new Error(
        'HERITAGE_REGISTRY_ADDRESS không hợp lệ'
      );
    }

    this.provider = new JsonRpcProvider(rpcUrl);

    this.wallet = new Wallet(
      privateKey,
      this.provider
    );

    this.contract = new Contract(
      contractAddress,
      HeritageRegistryArtifact,
      this.wallet
    );
  }

  private static uuidToBytes32(uuid: string): string {
    const hex = uuid.replace(/-/g, '');

    if (!/^[0-9a-fA-F]{32}$/.test(hex)) {
      throw new Error('UUID không hợp lệ');
    }

    return zeroPadValue(`0x${hex}`, 32);
  }

  private static hashToBytes32(hash: string): string {
    const cleanHash = hash.replace(/^0x/, '');

    if (!/^[0-9a-fA-F]{64}$/.test(cleanHash)) {
      throw new Error(
        'dataHash phải là SHA-256 gồm 64 ký tự hex'
      );
    }

    return `0x${cleanHash}`;
  }

  static async publishVersion(
    heritageId: string,
    version: number,
    dataHash: string
  ) {
    this.initialize();

    const heritageIdBytes32 = this.uuidToBytes32(heritageId);

    const dataHashBytes32 = this.hashToBytes32(dataHash);

    const tx = await this.contract.publishVersion(
      heritageIdBytes32,
      version,
      dataHashBytes32
    );

    const receipt = await tx.wait();

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
    };
  }

  static async getVersion(
    heritageId: string,
    version: number
  ) {
    this.initialize();

    const heritageIdBytes32 =
      this.uuidToBytes32(heritageId);

    const [dataHash, timestamp] =
      await this.contract.getVersion(
        heritageIdBytes32,
        version
      );

    return {
      dataHash,
      timestamp: Number(timestamp),
    };
  }
}
