import { Router } from 'express';
import { ExpertController } from '../controllers/expert.controller.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { validateDto } from '../middleware/validate.middleware.js';
import { AdminAssignExpertDto } from '../types/dto/expert.dto.js';
import { UserRole } from '../types/enums/rbac.js';

const expertRoute = Router();

expertRoute.use(AuthMiddleware.authenticate);

// 🟢 1. SYSTEM_ADMIN hoặc ORG_ADMIN Bổ nhiệm / Cập nhật Chuyên gia
expertRoute.post(
  '/admin/assign',
  requireRole([UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN]),
  validateDto(AdminAssignExpertDto),
  ExpertController.adminAssignExpert
);

// 🟢 2. SYSTEM_ADMIN hoặc ORG_ADMIN Thu hồi / Cắt chức Chuyên gia (Role quay về USER)
expertRoute.delete(
  '/admin/revoke/:targetUserId',
  requireRole([UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN]),
  ExpertController.adminRevokeExpert
);


expertRoute.get(
  '/user/:userId',
  requireRole([UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN]),
  ExpertController.getExpertByUserId
);
export default expertRoute;
