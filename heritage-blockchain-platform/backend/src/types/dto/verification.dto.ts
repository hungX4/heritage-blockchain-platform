import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VerificationStatus } from '../enums/verification.enum.js';

export class SubmitVoteDto {
  @IsEnum(VerificationStatus, { message: 'Trạng thái biểu quyết phải là APPROVED hoặc REJECTED' })
  @IsNotEmpty({ message: 'Trạng thái biểu quyết không được để trống' })
  status!: VerificationStatus.APPROVED | VerificationStatus.REJECTED | VerificationStatus.ABSTAINED;

  @IsOptional()
  @IsString()
  notes?: string;
}
