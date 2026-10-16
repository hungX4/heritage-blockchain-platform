import { Router } from 'express';
import { HeritageFieldSpecializationController } from '../controllers/heritage-field-specialization.controller.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { UserRole } from '../types/enums/rbac.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Lấy danh sách Chuyên môn đã gán cho 1 Lĩnh vực cụ thể
router.get('/:fieldId', AuthMiddleware.authenticate, HeritageFieldSpecializationController.getByField);

//  chiều 1: Đồng bộ / Cấu hình ma trận liên kết giữa Lĩnh vực và Chuyên môn (Chỉ SYSTEM_ADMIN)
router.put('/:fieldId',
  AuthMiddleware.authenticate,
  requireRole([UserRole.SYSTEM_ADMIN]),
  HeritageFieldSpecializationController.syncMapping
);

// Chiều 2: PUT /specialization-heritage-fields/:specId
router.put(
  '/specialization-heritage-fields/:specId',
  AuthMiddleware.authenticate,
  requireRole([UserRole.SYSTEM_ADMIN]),
  HeritageFieldSpecializationController.syncSpecializationFields
);
export default router;
