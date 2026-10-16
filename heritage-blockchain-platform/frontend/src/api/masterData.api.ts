import axiosClient from './axiosClient';

export interface Specialization {
  id: string;
  code: string;
  name: string;
}

export interface HeritageField {
  id: string;
  code: string;
  name: string;
  specializationMappings?: {
    id: string;
    specialization: Specialization;
  }[];
}

export const masterDataApi = {
  // Heritage Fields
  getHeritageFields: (search?: string) =>
    axiosClient.get<{ success: boolean; data: HeritageField[] }>('/heritage-fields', { params: { search } }),

  createHeritageField: (data: { code: string; name: string }) =>
    axiosClient.post<{ success: boolean; data: HeritageField }>('/heritage-fields', data),

  deleteHeritageField: (id: string) =>
    axiosClient.delete(`/heritage-fields/${id}`),

  // Specializations
  getSpecializations: (search?: string) =>
    axiosClient.get<{ success: boolean; data: Specialization[] }>('/specializations', { params: { search } }),

  createSpecialization: (data: { code: string; name: string }) =>
    axiosClient.post<{ success: boolean; data: Specialization }>('/specializations', data),

  deleteSpecialization: (id: string) =>
    axiosClient.delete(`/specializations/${id}`),

  // Mapping chiều 1
  syncFieldSpecializations: (fieldId: string, specializationIds: string[]) =>
    axiosClient.put(`/heritage-field-specializations/${fieldId}`, { specializationIds }),

  // Chiều 2: Từ Chuyên môn -> Gán danh sách Loại hình di sản
  syncSpecializationFields: (specId: string, heritageFieldIds: string[]) =>
    axiosClient.put(`/heritage-field-specializations/specialization-heritage-fields/${specId}`, { heritageFieldIds }),
};
