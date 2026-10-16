import { Request, Response } from 'express';
import { OrganizationService } from '../services/organization.service.js';

export class OrganizationController {
  //organization/request
  static async requestCreation(req: Request, res: Response) {
    try {
      const userId = req.user!.sub; // Giả sử bạn đã có middleware authenticate gán req.user

      if (!userId) {
        res.status(401).json({ message: 'UNAUTHORIZED' });
        return;
      }

      const dto = req.body;

      const result = await OrganizationService.createOrganizationRequest(userId, dto);

      return res.status(201).json({
        success: true,
        message: 'Gửi yêu cầu tạo tổ chức thành công. Vui lòng chờ System Admin phê duyệt.',
        data: result
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi gửi yêu cầu'
      });
    }
  }

  //organization/pending
  static async getPendingRequests(req: Request, res: Response) {
    try {
      const data = await OrganizationService.getPendingOrganizations();
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  //organization/status
  static async updateStatus(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const dto = req.body;

      const result = await OrganizationService.updateOrganizationStatus(id, dto);

      return res.status(200).json({
        success: true,
        message: `Đã ${dto.status === 'APPROVED' ? 'phê duyệt' : 'từ chối'} tổ chức thành công`,
        data: result
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // 2. Mọi User: Lấy danh sách tổ chức ĐÃ ĐƯỢC DUYỆT (Trang OrganizationListPage)
  static async getApprovedList(req: Request, res: Response) {
    try {
      const data = await OrganizationService.getApprovedOrganizations();
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 3. Mọi User: Lấy chi tiết 1 tổ chức theo ID (Trang OrganizationDetailPage)
  static async getDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await OrganizationService.getOrganizationById(id as string);
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message || 'Không tìm thấy tổ chức' });
    }
  }

  //organization/:id/join (gửi yêu cầu gia nhập tổ chức)
  static async requestJoin(req: Request<{ id: string }>, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) throw new Error('UNAUTHORIZED');

      const organizationId = req.params.id;
      const result = await OrganizationService.createJoinRequest(userId, organizationId);

      return res.status(201).json({
        success: true,
        message: 'Gửi yêu cầu gia nhập tổ chức thành công',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Gửi yêu cầu gia nhập thất bại',
      });
    }
  }

  //organization/:orgId Xem danh sách xin gia nhập của Tổ chức
  static async getPendingJoinRequests(req: Request<{ orgId: string }>, res: Response) {
    try {
      const { orgId } = req.params;
      const data = await OrganizationService.getPendingJoinRequests(orgId);
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // organization/join-requests/:requestId  Org Admin / System Admin Phê duyệt hoặc Từ chối đơn
  static async handleJoinRequest(req: Request<{ requestId: string }>, res: Response) {
    try {
      const { requestId } = req.params;
      const { action } = req.body; // 'APPROVE' | 'REJECT'
      const reviewerId = req.user?.id;

      if (!['APPROVE', 'REJECT'].includes(action)) {
        throw new Error('Hành động không hợp lệ (chỉ chấp nhận APPROVE hoặc REJECT)');
      }

      const result = await OrganizationService.processJoinRequest(requestId, action, reviewerId!);
      return res.status(200).json({
        success: true,
        message: `Đã ${action === 'APPROVE' ? 'phê duyệt' : 'từ chối'} thành công`,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // organization/members/:userId   Kick thành viên ra khỏi Tổ chức
  static async kickMember(req: Request<{ userId: string }>, res: Response) {
    try {
      const { userId } = req.params;
      const adminId = req.user?.sub;
      await OrganizationService.removeUserFromOrganization(userId, adminId!);
      return res.status(200).json({
        success: true,
        message: 'Đã xóa thành viên ra khỏi tổ chức thành công',
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // organization/join-requests/:requestId User rút lại đơn gia nhập
  static async cancelJoinRequest(req: Request<{ requestId: string }>, res: Response) {
    try {
      const userId = req.user?.sub;
      const { requestId } = req.params;

      if (!userId) throw new Error('UNAUTHORIZED');

      await OrganizationService.cancelJoinRequest(userId, requestId);

      return res.status(200).json({
        success: true,
        message: 'Rút lại yêu cầu gia nhập thành công',
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Không thể rút lại yêu cầu',
      });
    }
  }

  //lay danh sach thanh vien cua to chuc
  static async getMembers(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const members = await OrganizationService.getMembersByOrgId(id);

      return res.status(200).json({
        success: true,
        data: members,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Không thể lấy danh sách thành viên',
      });
    }
  }
}
