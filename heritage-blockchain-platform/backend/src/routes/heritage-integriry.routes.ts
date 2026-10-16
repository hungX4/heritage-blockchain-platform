import { Router } from "express";
import { HeritageIntegrityController } from "../controllers/heritage-integrity.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

AuthMiddleware.authenticate;

router.get(
  '/:heritageId/integrity',
  HeritageIntegrityController.verify
)

export default router;
