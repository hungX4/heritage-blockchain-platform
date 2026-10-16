import { AppDataSource } from '../config/database.js';
import { Specialization } from '../models/specialization.model.js';
import { Like } from 'typeorm';

export class SpecializationService {
  private static specRepo = AppDataSource.getRepository(Specialization);

  static async getAll(query: { search?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // ✂️ Trim từ khóa
    const keyword = query.search?.trim();

    const whereCondition = keyword
      ? [
        { name: Like(`%${keyword}%`) },
        { code: Like(`%${keyword}%`) },
      ]
      : {};

    const [data, total] = await this.specRepo.findAndCount({
      where: whereCondition,
      order: { code: 'ASC' },
      relations: ['fieldMappings', 'fieldMappings.field'],
      skip,
      take: limit,
    });

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async create(code: string, name: string) {
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    const existing = await this.specRepo.findOne({ where: { code: cleanCode } });
    if (existing) throw new Error('Mã chuyên môn đã tồn tại');

    const spec = this.specRepo.create({ code: cleanCode, name: cleanName });
    return await this.specRepo.save(spec);
  }

  static async update(id: string, name: string) {
    const cleanName = name.trim();
    await this.specRepo.update(id, { name: cleanName });
    return await this.specRepo.findOneBy({ id });
  }

  static async delete(id: string) {
    return await this.specRepo.delete(id);
  }
}
