import { NextFunction, Request, Response } from "express";
import { HeritageIntegrityService } from "../services/heritage-integrity.service.js";
import { successHandler } from "../utils/responseHandler.js";

export class HeritageIntegrityController {
  static async verify(
    req: Request<{ heritageId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { heritageId } = req.params;

      const result = await HeritageIntegrityService.verify(heritageId);

      return res.status(200).json(
        successHandler(200, "DATA INTEGRITY VERIFIED - NO SIGNS OF TAMPERING", result)
      )
    } catch (error) {
      next(error);
    }
  }
}
