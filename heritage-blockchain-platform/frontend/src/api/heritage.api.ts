import axiosClient from './axiosClient';
import { ApiResponse, Heritage, HeritageStatus } from '../types/heritage';

export const heritageApi = {
  // GET /api/heritages
  getAll: async (params?: { status?: HeritageStatus; search?: string }): Promise<ApiResponse<Heritage[]>> => {
    const response = await axiosClient.get('/heritages', { params });
    return response.data;
  },

  // GET /api/heritages/:id
  getById: async (id: string): Promise<ApiResponse<Heritage>> => {
    const response = await axiosClient.get(`/heritages/${id}`);
    return response.data;
  },

  // POST /api/heritages
  create: async (data: Partial<Heritage>): Promise<ApiResponse<Heritage>> => {
    const response = await axiosClient.post('/heritages', data);
    return response.data;
  },

  // PUT /api/heritages/:id
  update: async (id: string, data: Partial<Heritage>): Promise<ApiResponse<Heritage>> => {
    const response = await axiosClient.put(`/heritages/${id}`, data);
    return response.data;
  },

  // PATCH /api/heritages/:id/submit
  submit: async (id: string): Promise<ApiResponse<Heritage>> => {
    const response = await axiosClient.patch(`/heritages/${id}/submit`);
    return response.data;
  },

  // DELETE /api/heritages/:id
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosClient.delete(`/heritages/${id}`);
    return response.data;
  },
};
