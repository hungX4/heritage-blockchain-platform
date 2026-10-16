import { Request, Response } from 'express';
import { HeritageService } from '../services/heritage.service.js';
import { successHandler, errorHandler } from '../utils/responseHandler.js';
import { HeritageStatus } from '../types/enums/heritage.enum.js';

export class HeritageController {

  static async getAllHeritages(request: Request, response: Response) {
    try {
      const status = request.query.status
        ? HeritageController.parseQueryStatus(String(request.query.status))
        : undefined;
      const search = request.query.search ? String(request.query.search) : undefined;
      const heritages = await HeritageService.getAllHeritages({ status, search });

      return response.status(200).json(successHandler(200, 'Lấy danh sách di sản thành công', heritages));
    } catch (error) {
      return HeritageController.handleError(error, response, 'Lỗi khi lấy danh sách di sản');
    }
  }

  static async getHeritageById(request: Request, response: Response) {
    const heritageId = String(request.params.id);

    try {
      const heritage = await HeritageService.getHeritageById(heritageId);

      if (!heritage) {
        return response.status(404).json(errorHandler(404, 'Di sản không tồn tại'));
      }

      return response.status(200).json(successHandler(200, 'Lấy thông tin di sản thành công', heritage));
    } catch (error) {
      return HeritageController.handleError(error, response, 'Lỗi khi lấy thông tin di sản');
    }
  }

  static async createHeritage(request: Request, response: Response) {
    try {
      const heritageData = request.body;

      const newHeritage =
        await HeritageService.createHeritage(heritageData);

      return response.status(201).json(successHandler(201, 'Tạo di sản thành công', newHeritage));
    } catch (error) {
      console.error('Lỗi khi tạo di sản:', error);

      return HeritageController.handleError(error, response, 'Lỗi khi tạo di sản');
    }
  }

  static async updateHeritage(request: Request, response: Response) {
    const heritageId = String(request.params.id);

    try {
      const heritageData = request.body;

      const updatedHeritage =
        await HeritageService.updateHeritage(
          heritageId,
          heritageData
        );

      return response.status(200).json(successHandler(200, 'Cập nhật di sản thành công', updatedHeritage));
    } catch (error) {
      console.error('Lỗi khi cập nhật di sản:', error);

      return HeritageController.handleError(error, response, 'Lỗi khi cập nhật di sản');
    }
  }

  // static async submitHeritage(request: Request, response: Response) {
  //   const heritageId = String(request.params.id);

  //   try {
  //     const submittedHeritage = await HeritageService.submitHeritage(heritageId);

  //     return response.status(200).json(successHandler(200, 'Gửi hồ sơ di sản để kiểm duyệt thành công', submittedHeritage));
  //   } catch (error) {
  //     console.error('Lỗi khi gửi hồ sơ di sản:', error);

  //     return HeritageController.handleError(error, response, 'Lỗi khi gửi hồ sơ di sản');
  //   }
  // }

  static async updateHeritageStatus(request: Request, response: Response) {
    const heritageId = String(request.params.id);

    try {
      const updatedHeritage = await HeritageService.updateHeritageStatus(heritageId, request.body);
      return response.status(200).json(successHandler(200, 'Cập nhật trạng thái di sản thành công', updatedHeritage));
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái di sản:', error);

      return HeritageController.handleError(error, response, 'Lỗi khi cập nhật trạng thái di sản');
    }
  }

  static async deleteHeritage(request: Request, response: Response) {
    const heritageId = String(request.params.id);

    try {
      await HeritageService.deleteHeritage(heritageId);

      return response.status(200).json(successHandler(200, 'Xóa di sản thành công'));
    } catch (error) {
      console.error('Lỗi khi xóa di sản:', error);

      return HeritageController.handleError(error, response, 'Lỗi khi xóa di sản');
    }
  }

  private static parseQueryStatus(status: string) {
    if (!Object.values(HeritageStatus).includes(status as HeritageStatus)) {
      throw new Error('INVALID_HERITAGE_STATUS');
    }

    return status as HeritageStatus;
  }

  private static handleError(error: unknown, response: Response, fallbackMessage: string) {
    if (error instanceof Error) {
      if (error.message.startsWith('MISSING_REQUIRED_FIELDS')) {
        return response.status(400).json(errorHandler(400, 'Thiếu thông tin bắt buộc của hồ sơ di sản'));
      }

      if (error.message === 'HERITAGE_CODE_EXISTS') {
        return response.status(409).json(errorHandler(409, 'Mã hồ sơ di sản đã tồn tại'));
      }

      if (error.message === 'HERITAGE_NOT_FOUND') {
        return response.status(404).json(errorHandler(404, 'Di sản không tồn tại'));
      }

      if (error.message === 'INVALID_HERITAGE_STATUS') {
        return response.status(400).json(errorHandler(400, 'Trạng thái hồ sơ di sản không hợp lệ'));
      }

      if (error.message === 'HERITAGE_CANNOT_BE_SUBMITTED') {
        return response.status(409).json(errorHandler(409, 'Chỉ có hồ sơ DRAFT hoặc REJECTED mới có thể gửi kiểm duyệt'));
      }
    }

    return response.status(500).json(errorHandler(500, fallbackMessage));
  }
}
