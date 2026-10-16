import { Router } from 'express';
import { HeritageFieldController } from '../controllers/heritage-field.controller.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { UserRole } from '../types/enums/rbac.js';

const router = Router();

// Xem danh sách & Tìm kiếm (Tất cả User đã đăng nhập)
router.get('/', AuthMiddleware.authenticate, HeritageFieldController.getAll);

// Thao tác CRUD Quản lý Lĩnh vực (Chỉ SYSTEM_ADMIN)
router.post('/', AuthMiddleware.authenticate, requireRole([UserRole.SYSTEM_ADMIN]), HeritageFieldController.create);
router.put('/:id', AuthMiddleware.authenticate, requireRole([UserRole.SYSTEM_ADMIN]), HeritageFieldController.update);
router.delete('/:id', AuthMiddleware.authenticate, requireRole([UserRole.SYSTEM_ADMIN]), HeritageFieldController.delete);

export default router;
