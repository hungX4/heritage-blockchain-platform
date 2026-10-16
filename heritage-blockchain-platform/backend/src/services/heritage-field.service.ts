import { AppDataSource } from '../config/database.js';
import { HeritageField } from '../models/heritage-fields.model.js';
import { Like } from 'typeorm';

export class HeritageFieldService {
  private static fieldRepo = AppDataSource.getRepository(HeritageField);

  // Tìm kiếm & Phân trang Lĩnh vực
  static async getAll(query: { search?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // ✂️ Trim khoảng trắng của từ khóa tìm kiếm
    const keyword = query.search?.trim();

    const whereCondition = keyword
      ? [
        { name: Like(`%${keyword}%`) },
        { code: Like(`%${keyword}%`) },
      ]
      : {};

    const [data, total] = await this.fieldRepo.findAndCount({
      where: whereCondition,
      relations: ['specializationMappings', 'specializationMappings.specialization'],
      order: { code: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async create(code: string, name: string) {
    // ✂️ Trim & Viết hoa code, Trim name
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    const existing = await this.fieldRepo.findOne({ where: { code: cleanCode } });
    if (existing) throw new Error('Mã lĩnh vực đã tồn tại');

    const field = this.fieldRepo.create({ code: cleanCode, name: cleanName });
    return await this.fieldRepo.save(field);
  }

  static async update(id: string, name: string) {
    const cleanName = name.trim();
    await this.fieldRepo.update(id, { name: cleanName });
    return await this.fieldRepo.findOneBy({ id });
  }

  static async delete(id: string) {
    return await this.fieldRepo.delete(id);
  }
}
