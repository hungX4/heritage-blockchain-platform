import { api } from './api';

export interface BlockchainRecord {
  id: string;
  heritageId: string;
  dataHash: string;
  version: number;
  verifier: string;
  transactionHash?: string;
  blockNumber?: number;
  createdAt: string;
  heritage?: { name: string; heritageCode: string };
}

export const blockchainApi = {
  records: () => api.get<{ success: boolean; data: BlockchainRecord[]; message?: string }>('/blockchain-records')
};

