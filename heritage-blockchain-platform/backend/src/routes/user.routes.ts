import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

const userRoute = Router();

// Yêu cầu xác thực Token trước khi lấy thông tin người dùng
userRoute.use(AuthMiddleware.authenticate);

// 1. Lấy danh sách (Phân trang + Search)
userRoute.get('/', UserController.getUsers);

// 2. Lấy chi tiết 1 User
userRoute.get('/:id', UserController.getUserById);

export default userRoute;
