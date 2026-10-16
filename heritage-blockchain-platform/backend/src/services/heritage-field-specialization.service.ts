import { AppDataSource } from '../config/database.js';
import { HeritageFieldSpecialization } from '../models/heritage-field-specialization.model.js';
import { HeritageField } from '../models/heritage-fields.model.js';

export class HeritageFieldSpecializationService {
  private static fieldSpecRepo = AppDataSource.getRepository(HeritageFieldSpecialization);
  private static fieldRepo = AppDataSource.getRepository(HeritageField);

  // Lấy danh sách Chuyên môn đã gán cho 1 Lĩnh vực
  static async getSpecializationsByField(fieldId: string) {
    return await this.fieldSpecRepo.find({
      where: { fieldId },
      relations: ['specialization'],
    });
  }

  // Đồng bộ Ma trận: Gán mảng Chuyên môn vào Lĩnh vực
  static async syncMapping(fieldId: string, specializationIds: string[]) {
    const field = await this.fieldRepo.findOneBy({ id: fieldId });
    if (!field) throw new Error('Lĩnh vực di sản không tồn tại');

    // Xóa toàn bộ liên kết cũ
    await this.fieldSpecRepo.delete({ fieldId });

    if (!specializationIds || specializationIds.length === 0) {
      return { success: true, message: 'Đã xóa tất cả liên kết' };
    }

    // Tạo liên kết mới
    const mappings = specializationIds.map((specId) =>
      this.fieldSpecRepo.create({ fieldId, specializationId: specId })
    );

    await this.fieldSpecRepo.save(mappings);
    return { success: true, count: mappings.length };
  }

  // CHIỀU 2: Đồng bộ Loại hình di sản cho 1 Chuyên môn (VIẾT THÊM HÀM NÀY)
  static async syncSpecializationFields(specId: string, heritageFieldIds: string[]) {
    // 1. Xóa các liên kết cũ của Specialization này
    await this.fieldSpecRepo.delete({ specializationId: specId });

    // 2. Thêm danh sách liên kết mới
    if (heritageFieldIds && heritageFieldIds.length > 0) {
      const newMappings = heritageFieldIds.map((fieldId) =>
        this.fieldSpecRepo.create({
          specializationId: specId,
          fieldId,
        })
      );
      await this.fieldSpecRepo.save(newMappings);
    }
    return true;
  }
}
