import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { UserRole } from '../types/enums/rbac.js';

export class UserController {
  /**
   * GET /api/users
   * Query params: ?page=1&limit=10&search=nguyen&role=USER
   */
  static async getUsers(req: Request, res: Response) {
    try {
      const { page, limit, search, role } = req.query;

      const result = await UserService.getAllUsers({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        role: role as UserRole,
      });

      return res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi hệ thống khi lấy danh sách người dùng',
      });
    }
  }

  /**
   * GET /api/users/:id
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id as string);

      return res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      const isNotFound = error.message === 'USER_NOT_FOUND';
      return res.status(isNotFound ? 404 : 400).json({
        success: false,
        message: isNotFound ? 'Không tìm thấy người dùng' : error.message,
      });
    }
  }
}
