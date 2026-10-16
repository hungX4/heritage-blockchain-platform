import axiosClient from './axiosClient';
import { ApiResponse, HeritageIntegrityResult } from '../types/heritage';

export const integrityApi = {
  // GET /api/heritages/:heritageId/integrity
  verifyIntegrity: async (heritageId: string): Promise<ApiResponse<HeritageIntegrityResult>> => {
    const response = await axiosClient.get(`/integrity/${heritageId}/integrity`);
    return response.data;
  },
};
