import { z } from 'zod';
import { HeritageVersion } from '../api/heritage-version.api';

export enum HeritageStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED'
}
export type Heritage = {
  id: string;
  heritageCode: string;
  name: string;
  description: string;
  fieldId: string;
  field?: {
    id: string;
    name: string;
  };
  versions?: HeritageVersion[];
  location?: LocationItem[];
  source: string;
  sourceOrganization: string;
  sourceDocumentNumber?: string;
  sourceUrl?: string;
  sourceDocumentCid?: string;
  recognizedAt?: string;
  status: HeritageStatus;
  createdBy?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
  media: HeritageMediaItem[]
};

export interface LocationItem {
  province: string;
  district?: string;
  ward?: string;
}

export type HeritageIntegrityResult = {
  heritageId: string;
  version: number;
  integrityValid: boolean;
  currentDataHash: string;
  databaseDataHash: string;
  blockchainDataHash: string;
  databaseValid: boolean;
  blockchainValid: boolean;
  blockchainTxHash?: string;
  verifiedAt: string;
};

export const heritageMediaItemSchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO', 'AUDIO'], {
    error: 'Loại phương tiện không hợp lệ',
  }),
  url: z.string().min(1, 'URL phương tiện không được để trống'),
  cid: z.string().optional(),
  caption: z.string().optional(),
  order: z.number().optional(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  fileSize: z.number().optional(),
  thumbnailUrl: z.string().optional(),
});
export type HeritageMediaItem = z.infer<typeof heritageMediaItemSchema>;

export const locationItemSchema = z.object({
  province: z.string().min(1, 'Tỉnh/Thành phố không được để trống'),
  district: z.string().optional(),
  ward: z.string().optional(),
});

export const heritagePayloadSchema = z.object({
  heritageCode: z.string()
    .min(3, 'Mã hồ sơ phải có ít nhất 3 ký tự')
    .max(20, 'Mã hồ sơ tối đa 20 ký tự')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Mã hồ sơ không được chứa khoảng trắng và ký tự đặc biệt'),

  name: z.string()
    .min(5, 'Tên di sản quá ngắn (tối thiểu 5 ký tự)'),

  description: z.string()
    .min(20, 'Mô tả quá ngắn, cần cung cấp đủ thông tin chi tiết'),

  category: z.string()
    .min(1, 'Vui lòng nhập loại hình di sản'),

  location: z.array(locationItemSchema)
    .min(1, 'Vui lòng thêm ít nhất 1 địa điểm di sản'),

  source: z.string()
    .min(1, 'Vui lòng nhập nguồn dữ liệu'),

  sourceOrganization: z.string()
    .min(1, 'Vui lòng nhập tổ chức nguồn'),

  // Các trường thông tin pháp lý & IPFS CID
  sourceDocumentNumber: z.string().optional(),
  sourceUrl: z.string().optional(),
  sourceDocumentCid: z.string()
    .optional()
    .refine(
      (val) => !val || /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z0-9]{50,})$/.test(val),
      { message: 'Mã IPFS CID không đúng định dạng chuẩn (phải bắt đầu bằng Qm... hoặc bafy...)' }
    ),
  recognizedAt: z.string().optional(),
  media: z.array(heritageMediaItemSchema).optional().default([]),
});

export type HeritagePayload = z.infer<typeof heritagePayloadSchema>;

export type ApiResponse<T> = {
  success: boolean;
  status: number;
  message: string;
  data: T;
};

export interface LegalDocUploadResponse {
  url: string;
  cid: string;
  fileName: string;
}

export interface PaginatedHeritageVersionResponse {
  items: HeritageVersionItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}



export type HeritageVersionItem = {
  id: string;
  heritageId: string;
  version: number;
  canonicalData: CanonicalData;
  media?: HeritageVersionMedia[];    // Relation từ Backend
  mediaList?: HeritageVersionMedia[]; // Mảng Media chuẩn hóa từ Service
  dataHash?: string;
  blockchainTxHash?: string;
  createdAt?: string;
};

export type HeritageVersionMedia = {
  id?: string;
  type: string;
  url: string;
  thumbnailUrl?: string; // Link Cloudinary thumbnail
  caption?: string;
  cid?: string;
  order?: number;
  fileSize?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CanonicalData = {
  schemaVersion: number;
  field: {
    code: string;
    name: string;
  };
  heritage: {
    heritageCode: string;
    name: string;
    description: string;
    location?: LocationItem[] | null;
    source: string;
    sourceOrganization: string;
    sourceDocumentNumber?: string | null;
    sourceUrl?: string | null;
    sourceDocumentCid?: string | null;
    recognizedAt?: string | null;
  };
  media: HeritageVersionMedia[];
};


