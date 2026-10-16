import { Request, Response } from 'express';
import { ExpertService } from '../services/expert.service.js';
import { AdminAssignExpertDto } from '../types/dto/expert.dto.js';

export class ExpertController {
  /**
   * POST /api/experts/admin/assign
   * Admin gán hoặc cập nhật Chuyên gia
   */
  static async adminAssignExpert(req: Request, res: Response) {
    try {
      const performerRole = (req as any).user.roles;
      const dto = req.body as AdminAssignExpertDto;

      const data = await ExpertService.assignOrUpdateExpertByAdmin({
        performerRole,
        dto,
      });

      return res.json({
        success: true,
        message: 'Đã bổ nhiệm / Cập nhật chức danh Chuyên gia thành công',
        data,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/experts/admin/revoke/:targetUserId
   * Admin cắt chức / thu hồi quyền Chuyên gia
   */
  static async adminRevokeExpert(req: Request, res: Response) {
    try {
      const { targetUserId } = req.params;

      const result = await ExpertService.revokeExpertStatus(targetUserId as string);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  /**
   * GET /api/experts/user/:userId
   */
  static async getExpertByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin userId',
        });
      }

      const expert = await ExpertService.getExpertByUserId(userId as string);

      if (!expert) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng này chưa có hồ sơ Chuyên gia',
        });
      }

      return res.json({
        success: true,
        data: expert,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi hệ thống khi lấy thông tin chuyên gia',
      });
    }
  }
}

