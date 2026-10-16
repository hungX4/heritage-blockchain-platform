// src/types/dto/create-organization.dto.ts
import { IsString, IsNotEmpty, Matches, IsArray, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { RequestStatus } from '../enums/organization.enum.js';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  // Bổ sung description vào đây
  @IsString()
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @MinLength(10, { message: 'Mô tả tổ chức quá ngắn (tối thiểu 10 ký tự)' })
  @MaxLength(1000, { message: 'Mô tả không được vượt quá 1000 ký tự' })
  description!: string;

  @IsString()
  @IsNotEmpty({ message: 'Email không được để trống' })
  // Regex: Chỉ chấp nhận tên miền .gov.vn, .edu.vn, hoặc .org.vn
  @Matches(/^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.)?(gov\.vn|edu\.vn|org\.vn)$/, {
    message: 'Chỉ chấp nhận email thuộc cơ quan nhà nước hoặc tổ chức giáo dục (.gov.vn, .edu.vn, .org.vn)'
  })
  contactEmail!: string;

  @IsArray()
  @IsNotEmpty({ message: 'Bắt buộc phải tải lên minh chứng pháp lý' })
  legalDocumentUrls!: string[];
}


export class UpdateOrgStatusDto {
  @IsEnum(RequestStatus, { message: 'Trạng thái phải là APPROVED hoặc REJECTED' })
  status!: RequestStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string; // Lý do từ chối (nếu có)
}
