// src/types/dto/create-heritage.dto.ts
import { IsNotEmpty, IsString, IsOptional, MaxLength, IsEnum, IsArray, ValidateNested, IsDateString, IsNumber } from 'class-validator';
import { HeritageStatus } from '../enums/heritage.enum.js';
import { Type } from 'class-transformer';
import { MediaType } from '../enums/media.enum.js';

export class LocationItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Tỉnh/Thành phố không được để trống' })
  province!: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  ward?: string;
}

export class CreateHeritageMediaDto {
  @IsEnum(MediaType, { message: 'Loại phương tiện không hợp lệ' })
  @IsNotEmpty({ message: 'Loại phương tiện không được để trống' })
  type!: MediaType;

  @IsString()
  @IsNotEmpty({ message: 'URL không được để trống' })
  url!: string;

  @IsString()
  @IsNotEmpty({ message: 'Không tìm thấy CID' })
  cid!: string;

  @IsString()
  @IsOptional()
  caption?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}

export class CreateHeritageDto {
  @IsString()
  @IsNotEmpty({ message: 'Mã hồ sơ không được để trống' })
  heritageCode!: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên di sản không được để trống' })
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty({ message: 'Thể loại không được để trống' })
  category!: string; // nhận từ client

  @IsArray({ message: 'Danh sách địa điểm phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => LocationItemDto)
  @IsNotEmpty({ message: 'Địa điểm không được để trống' })
  location!: LocationItemDto[];

  @IsString()
  @IsNotEmpty()
  source!: string;

  @IsString()
  sourceOrganization!: string;

  @IsString()
  @IsOptional()
  sourceDocumentNumber?: string;

  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @IsString()
  @IsOptional()
  sourceDocumentCid?: string;

  @IsDateString({}, { message: 'Ngày ghi danh phải đúng định dạng YYYY-MM-DD' })
  @IsOptional()
  recognizedAt?: string;

  // 🟢 Mảng danh sách media đính kèm
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateHeritageMediaDto)
  media?: CreateHeritageMediaDto[];
}

export class UpdateStatusDto {
  @IsEnum(HeritageStatus, { message: 'Trạng thái không hợp lệ' })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  status!: HeritageStatus;
}
