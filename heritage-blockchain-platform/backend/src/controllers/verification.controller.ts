import { Request, Response } from 'express';
import { VerificationService } from '../services/verification.service.js';
import { ExpertService } from '../services/expert.service.js';

export class VerificationController {
  /**
   * 1. Chuyên gia lấy danh sách hồ sơ được phân công thẩm định
   * GET /api/verifications/my-assignments
   */
  static async getMyAssignments(req: Request, res: Response) {
    try {
      // 1. Lấy userId từ Token
      const userId = (req as any).user?.sub;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn chưa đăng nhập hoặc Token không hợp lệ',
        });
      }

      // 2. Tìm hồ sơ Expert tương ứng với userId này
      // (Sử dụng ExpertService đã viết ở các bước trước)
      const expert = await ExpertService.getExpertByUserId(userId);

      if (!expert) {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản của bạn không gắn liền với hồ sơ Chuyên gia',
        });
      }

      // 3. Truy vấn lấy nhiệm vụ bằng expert.id (chứ không phải userId)
      const assignments = await VerificationService.getAssignmentsByExpert(expert.id);

      return res.json({
        success: true,
        data: assignments,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi hệ thống khi lấy danh sách phân công',
      });
    }
  }

  /**
   * 2. Xem tiến độ thẩm định của một Hồ sơ di sản
   * GET /api/verifications/heritage/:heritageId
   */
  static async getHeritageVerifications(req: Request, res: Response) {
    try {
      const { heritageId } = req.params;
      const data = await VerificationService.getVerificationsByHeritage(heritageId as string);

      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Không thể lấy thông tin thẩm định',
      });
    }
  }

  /**
   * 3. Chuyên gia gửi phiếu đánh giá (Bỏ phiếu 3/5)
   * POST /api/verifications/:id/vote
   */
  static async submitVote(req: Request, res: Response) {
    try {
      const { verificationId } = req.params;
      const userId = req.user?.sub as string;
      const expert = await ExpertService.getExpertByUserId(userId as string);
      const { status, notes } = req.body;
      if (!expert) {
        return res.status(403).json({
          success: false,
          message: 'Chỉ chuyên gia mới có quyền thực hiện thao tác này',
        });
      }

      const result = await VerificationService.submitVote({
        verificationId: verificationId as string,
        expertId: expert?.id as string,
        status,
        notes,
      });

      return res.json({
        success: true,
        message: 'Đã gửi phiếu đánh giá thành công',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Gửi đánh giá thất bại',
      });
    }
  }

  /**
   * 4. Admin kích hoạt Auto Matching
   * POST /api/verifications/heritage/:heritageId/auto-assign
   */
  static async triggerAutoAssign(req: Request, res: Response) {
    try {
      const { requiredExperts } = req.body;
      const { heritageId } = req.params;
      const result = await VerificationService.autoAssignExperts(heritageId as string, requiredExperts);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Phân công chuyên gia thất bại',
      });
    }
  }
}
