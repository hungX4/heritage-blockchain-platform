import { IsArray, IsNotEmpty, IsUUID } from "class-validator";

export class AdminAssignExpertDto {
  @IsNotEmpty({ message: "Thiếu user id" })
  @IsUUID('4', { message: "User id không đúng định dạng UUID" })
  targetUserId: string;

  @IsArray({ message: "Danh sách chuyên môn phải là 1 mảng" })
  @IsNotEmpty({ message: "Vui lòng chọn ít nhất một chuyên môn" })
  @IsUUID('4', { each: true, message: "ID chuyên môn không đúng định dạng UUID" })
  specializationIds: string[];
}
