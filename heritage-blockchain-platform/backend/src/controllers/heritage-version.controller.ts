import { Request, Response, NextFunction } from 'express';
import { HeritageVersionService } from '../services/heritage-version.service.js';
import { errorHandler, successHandler } from '../utils/responseHandler.js';

export class HeritageVersionController {
  static async publish(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { heritageId } = req.params;

      const adminId = req.user?.sub;

      const version = await HeritageVersionService.publish(
        heritageId as string,
        adminId as string
      );

      return res.status(201).json({
        message: 'Publish Heritage thành công',
        data: version,
      });
    } catch (error) {
      next(error);
    }
  }
  // api/version/
  static async getVersions(req: Request, res: Response) {
    try {
      const search = req.query.search ? String(req.query.search) : undefined;
      const location = req.query.location ? String(req.query.location) : undefined;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 12;

      const versions = await HeritageVersionService.getLatestVersion({ search, location, page, limit });

      return res.status(200).json(
        successHandler(200, 'Lấy danh sách phiên bản di sản thành công', versions)
      );
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phiên bản di sản:', error);
      return res.status(500).json(errorHandler(500, 'Lỗi hệ thống khi lấy danh sách phiên bản'));
    }
  }

  // GET /api/versions/:id
  static async getVersionById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const version = await HeritageVersionService.getVersionById(id);
      if (!version) {
        return res.status(404).json(errorHandler(404, 'Không tìm thấy phiên bản di sản'));
      }

      return res.status(200).json(
        successHandler(200, 'Lấy chi tiết phiên bản di sản thành công', version)
      );
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết phiên bản di sản:', error);
      return res.status(500).json(errorHandler(500, 'Lỗi hệ thống khi lấy chi tiết phiên bản'));
    }
  }
}
