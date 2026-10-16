import { z } from 'zod';

export const organizationSchema = z.object({
  name: z.string().min(1, 'Tên tổ chức không được để trống'),
  description: z
    .string()
    .min(10, 'Mô tả tổ chức quá ngắn (tối thiểu 10 ký tự)')
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự'),
  contactEmail: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Định dạng email không hợp lệ')
    .regex(
      /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.)?(gov\.vn|edu\.vn|org\.vn)$/,
      'Chỉ chấp nhận email thuộc cơ quan nhà nước (.gov.vn, .edu.vn, .org.vn)'
    ),
  legalDocuments: z
    .custom<File[]>()
    .refine((files) => files && files.length >= 1, 'Bắt buộc phải tải lên ít nhất 1 tài liệu')
    .refine((files) => files && files.length <= 3, 'Chỉ được tải lên tối đa 3 ảnh/tài liệu')
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;


