import { Request, Response } from 'express';
import { HeritageVersionService } from '../services/heritage-version.service.js';
import { errorHandler, successHandler } from '../utils/responseHandler.js';

export class HeritageVersionController {
  static async getVersionsByHeritageId(request: Request, response: Response) {
    try {
      const versions = await HeritageVersionService.getVersionsByHeritageId(String(request.params.heritageId));

      return response.status(200).json(successHandler(200, 'Lấy lịch sử phiên bản di sản thành công', versions));
    } catch (error) {
      return HeritageVersionController.handleError(error, response, 'Lỗi khi lấy lịch sử phiên bản di sản');
    }
  }

  static async getLatestVersionByHeritageId(request: Request, response: Response) {
    try {
      const version = await HeritageVersionService.getLatestVersionByHeritageId(String(request.params.heritageId));

      return response.status(200).json(successHandler(200, 'Lấy phiên bản mới nhất thành công', version));
    } catch (error) {
      return HeritageVersionController.handleError(error, response, 'Lỗi khi lấy phiên bản mới nhất');
    }
  }

  static async createVersionForHeritage(request: Request, response: Response) {
    try {
      const version = await HeritageVersionService.createVersionForHeritage(
        String(request.params.heritageId),
        request.body.createdBy
      );

      return response.status(201).json(successHandler(201, 'Tạo phiên bản và dataHash thành công', version));
    } catch (error) {
      return HeritageVersionController.handleError(error, response, 'Lỗi khi tạo phiên bản di sản');
    }
  }

  private static handleError(error: unknown, response: Response, fallbackMessage: string) {
    if (error instanceof Error) {
      if (error.message === 'HERITAGE_NOT_FOUND') {
        return response.status(404).json(errorHandler(404, 'Hồ sơ di sản không tồn tại'));
      }

      if (error.message === 'HERITAGE_MUST_BE_VERIFIED') {
        return response.status(409).json(errorHandler(409, 'Chỉ hồ sơ VERIFIED hoặc PUBLISHED mới được tạo version/hash'));
      }
    }

    return response.status(500).json(errorHandler(500, fallbackMessage));
  }
}
