import { Router } from 'express';
import { VerificationController } from '../controllers/verification.controller.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { validateDto } from '../middleware/validate.middleware.js';
import { SubmitVoteDto } from '../types/dto/verification.dto.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { UserRole } from '../types/enums/rbac.js';

const verificationRoute = Router();

// Tất cả các route thẩm định đều yêu cầu đăng nhập
verificationRoute.use(AuthMiddleware.authenticate);

// 1. Chuyên gia xem danh sách phân công của chính mình
verificationRoute.get(
  '/my-assignments',
  VerificationController.getMyAssignments
);

// 2. Xem tiến độ & phiếu đánh giá của một di sản
verificationRoute.get(
  '/heritage/:heritageId',
  requireRole([UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN]),
  VerificationController.getHeritageVerifications
);

// 3. Chuyên gia bỏ phiếu (APPROVED hoặc REJECTED)
verificationRoute.post(
  '/:id/vote',
  validateDto(SubmitVoteDto),
  requireRole([UserRole.INDEPENDENT_EXPERT, UserRole.ORG_EXPERT]),
  VerificationController.submitVote
);

// 4. Admin kích hoạt lại gán 5 chuyên gia tự động
verificationRoute.post(
  '/heritage/:heritageId/auto-assign',
  requireRole([UserRole.SYSTEM_ADMIN]),
  VerificationController.triggerAutoAssign
);

export default verificationRoute;
