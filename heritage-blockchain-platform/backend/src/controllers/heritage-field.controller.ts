import { Request, Response } from 'express';
import { HeritageFieldService } from '../services/heritage-field.service.js';

export class HeritageFieldController {
  static async getAll(req: Request, res: Response) {
    try {
      const result = await HeritageFieldService.getAll(req.query);
      return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { code, name } = req.body;
      const data = await HeritageFieldService.create(code, name);
      return res.status(201).json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async update(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const data = await HeritageFieldService.update(id, name);
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async delete(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      await HeritageFieldService.delete(id);
      return res.status(200).json({ success: true, message: 'Đã xóa lĩnh vực' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
