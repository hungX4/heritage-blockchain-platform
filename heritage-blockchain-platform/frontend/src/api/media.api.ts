
import { HeritageMediaItem, LegalDocUploadResponse } from "../types/heritage";
import axiosClient from "./axiosClient";

export const mediaApi = {
  upload: async (file: File, type?: string, caption?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (type) formData.append('type', type);
    if (caption) formData.append('caption', caption);

    const response = await axiosClient.post<{ data: HeritageMediaItem }>(
      '/upload/heritage-media',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  uploadLegalDocument: async (file: File) => {
    // 🟢 1. Tạo đối tượng FormData
    const formData = new FormData();
    formData.append('file', file); // 'file' phải trùng khớp với uploadLegalPdf.single('file') ở Backend

    // 🟢 2. Truyền trực tiếp formData vào body của Axios
    const response = await axiosClient.post<{ data: LegalDocUploadResponse }>(
      '/upload/legal-document',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data', // Đảm bảo Axios ghi đè Content-Type mặc định
        },
      }
    );
    return response.data;
  },
};
