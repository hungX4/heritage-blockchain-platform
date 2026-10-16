import { Request, Response } from 'express';
import { SpecializationService } from '../services/specialization.service.js';

export class SpecializationController {
  // Lấy danh sách chuyên môn (Có hỗ trợ tìm kiếm ?search=... & phân trang ?page=1&limit=10)
  static async getAll(req: Request, res: Response) {
    try {
      const result = await SpecializationService.getAll(req.query);
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Không thể lấy danh sách chuyên môn',
      });
    }
  }

  // Tạo mới Chuyên môn
  static async create(req: Request, res: Response) {
    try {
      const { code, name } = req.body;

      if (!code || !name) {
        return res.status(400).json({
          success: false,
          message: 'Mã (code) và tên (name) chuyên môn là bắt buộc',
        });
      }

      const data = await SpecializationService.create(code, name);
      return res.status(201).json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Không thể tạo chuyên môn',
      });
    }
  }

  // Cập nhật tên Chuyên môn
  static async update(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Tên chuyên môn không được để trống',
        });
      }

      const data = await SpecializationService.update(id, name);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Không thể cập nhật chuyên môn',
      });
    }
  }

  // Xóa Chuyên môn
  static async delete(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      await SpecializationService.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Đã xóa chuyên môn thành công',
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Không thể xóa chuyên môn',
      });
    }
  }
}
