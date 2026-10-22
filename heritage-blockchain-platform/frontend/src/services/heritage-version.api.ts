import { api } from './api';
import type { ApiResponse, HeritageVersion } from '../types/heritage';

export const heritageVersionApi = {
  listByHeritage: (heritageId: string) =>
    api.get<ApiResponse<HeritageVersion[]>>(`/heritage-versions/heritage/${heritageId}`),
  latestByHeritage: (heritageId: string) =>
    api.get<ApiResponse<HeritageVersion | null>>(`/heritage-versions/heritage/${heritageId}/latest`),
  createForHeritage: (heritageId: string) =>
    api.post<ApiResponse<HeritageVersion>>(`/heritage-versions/heritage/${heritageId}`)
};
