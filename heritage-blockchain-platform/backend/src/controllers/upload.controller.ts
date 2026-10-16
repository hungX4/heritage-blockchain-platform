import { Request, Response } from 'express';
import { UploadService } from '../services/upload.service.js';
import { errorHandler, successHandler } from '../utils/responseHandler.js';

export class UploadController {
  static async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'Không tìm thấy file' });
        return;
      }

      // Đẩy buffer xuống Service xử lý
      const fileUrl = await UploadService.uploadDocument(req.file.buffer);

      res.status(200).json(
        successHandler(200, 'Upload file thành công', { fileUrl })
      );
    } catch (error: any) {
      res.status(500).json(
        errorHandler(500, error.message || 'Lỗi server khi upload file')
      );
    }
  }
  //hybrid media
  static async uploadMultipleDocuments(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: 'Không tìm thấy files' });
        return;
      }

      const fileUrls = await UploadService.uploadMultipleDocuments(files);

      res.status(200).json(
        successHandler(200, 'Upload tài liệu thành công', fileUrls)
      );
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async uploadMedia(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json(
          errorHandler(400, 'Không tìm thấy file, vui lòng đính kèm file')
        );
      }

      const { type, caption } = req.body;
      const result = await UploadService.uploadHybrid(req.file);

      const responseData = {
        ...result,
        type: type || 'IMAGE',
        caption: caption || '',
      };

      return res.status(200).json(
        successHandler(200, 'Upload file thành công.', responseData)
      );
    } catch (error: any) {
      console.error('Upload Heritage Media Error:', error);
      return res.status(500).json(
        errorHandler(500, error.message || 'Lỗi server khi upload file.')
      );
    }
  }

  static async uploadLegalDocument(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json(errorHandler(400, 'Không tìm thấy file tải lên'));
      }

      const result = await UploadService.uploadLegalDocumentToIPFS(req.file);

      return res.status(200).json(
        successHandler(200, 'Upload văn bản pháp lý thành công', result)
      );
    } catch (error) {
      return res.status(500).json(
        errorHandler(500, error instanceof Error ? error.message : 'Lỗi upload file')
      );
    }
  }
}
