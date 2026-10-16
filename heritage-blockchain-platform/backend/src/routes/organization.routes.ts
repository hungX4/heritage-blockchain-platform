import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller.js';
import { CreateOrganizationDto, UpdateOrgStatusDto } from '../types/dto/organization.dto.js';
import { validateDto } from '../middleware/validate.middleware.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { UserRole } from '../types/enums/rbac.js';

const organizationRoute = Router();

organizationRoute.get(
  '/',
  AuthMiddleware.authenticate,
  OrganizationController.getApprovedList
);



// Endpoint: POST /organizations/request
organizationRoute.post(
  '/request',
  AuthMiddleware.authenticate, // Bắt buộc user phải đăng nhập
  validateDto(CreateOrganizationDto), // Chặn rác, kiểm tra email .gov.vn, .edu.vn
  OrganizationController.requestCreation
);

organizationRoute.get(
  '/pending',
  AuthMiddleware.authenticate,
  //requireRole(UserRole.SYSTEM_ADMIN),
  OrganizationController.getPendingRequests
);

// SYSTEM ADMIN: Phê duyệt hoặc Từ chối tổ chức theo ID
organizationRoute.patch(
  '/:id/status',
  AuthMiddleware.authenticate,
  //requireRole(UserRole.SYSTEM_ADMIN),
  validateDto(UpdateOrgStatusDto),
  OrganizationController.updateStatus
);

// Lấy danh sách các đơn xin gia nhập tổ chức
organizationRoute.get(
  '/:orgId/join-requests',
  AuthMiddleware.authenticate,
  OrganizationController.getPendingJoinRequests
);

// Phê duyệt hoặc Từ chối đơn gia nhập
organizationRoute.patch(
  '/join-requests/:requestId',
  AuthMiddleware.authenticate,
  OrganizationController.handleJoinRequest
);

// Kick thành viên khỏi tổ chức
organizationRoute.delete(
  '/members/:userId',
  AuthMiddleware.authenticate,
  OrganizationController.kickMember
);

//lấy danh sách thành viên tổ chức (dùng optionalAuth để ai cũng xem được)
organizationRoute.get('/:id/members', AuthMiddleware.authenticate, OrganizationController.getMembers);

// User tự rút lại đơn
organizationRoute.delete('/join-requests/:requestId', AuthMiddleware.authenticate, OrganizationController.cancelJoinRequest);

organizationRoute.post(
  '/:id/join',
  AuthMiddleware.authenticate,
  OrganizationController.requestJoin
);

organizationRoute.get(
  '/:id',
  AuthMiddleware.authenticate,
  OrganizationController.getDetail
);
export default organizationRoute;
