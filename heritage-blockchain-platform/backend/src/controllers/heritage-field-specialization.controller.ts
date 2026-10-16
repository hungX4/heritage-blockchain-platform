import { NextFunction, Request, Response } from 'express';
import { HeritageFieldSpecializationService } from '../services/heritage-field-specialization.service.js';

export class HeritageFieldSpecializationController {
  static async getByField(req: Request<{ fieldId: string }>, res: Response) {
    try {
      const { fieldId } = req.params;
      const data = await HeritageFieldSpecializationService.getSpecializationsByField(fieldId);
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async syncMapping(req: Request<{ fieldId: string }>, res: Response) {
    try {
      const { fieldId } = req.params;
      const { specializationIds } = req.body;
      const result = await HeritageFieldSpecializationService.syncMapping(fieldId, specializationIds);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  // Chiều 2: Cập nhật danh sách Loại hình Di sản cho 1 Chuyên môn
  static async syncSpecializationFields(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { specId } = req.params;
      const { heritageFieldIds } = req.body;

      await HeritageFieldSpecializationService.syncSpecializationFields(specId as string, heritageFieldIds);

      res.status(200).json({
        success: true,
        message: 'Cập nhật danh sách loại hình di sản thành công',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi cập nhật loại hình di sản',
      });
    }
  }
}
