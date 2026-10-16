import { Router } from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { SpecializationController } from '../controllers/specialization.controller.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { UserRole } from '../types/enums/rbac.js';

const router = Router();

// Xem danh sách & Tìm kiếm Chuyên môn (Tất cả User đã đăng nhập)
router.get('/', AuthMiddleware.authenticate, SpecializationController.getAll);

// Thao tác CRUD Quản lý Chuyên môn (Chỉ SYSTEM_ADMIN)
router.post('/', AuthMiddleware.authenticate, requireRole([UserRole.SYSTEM_ADMIN]), SpecializationController.create);
router.put('/:id', AuthMiddleware.authenticate, requireRole([UserRole.SYSTEM_ADMIN]), SpecializationController.update);
router.delete('/:id', AuthMiddleware.authenticate, requireRole([UserRole.SYSTEM_ADMIN]), SpecializationController.delete);

export default router;
