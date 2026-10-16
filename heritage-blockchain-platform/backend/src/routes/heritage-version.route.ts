// heritage-version.route.ts

import { Router } from 'express';
import { HeritageVersionController } from '../controllers/heritage-version.controller.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { UserRole } from '../types/enums/rbac.js';
// import auth middleware của project bạn
// import role middleware nếu bạn có

const router = Router();

router.post(
  '/:heritageId/publish',
  AuthMiddleware.authenticate,
  requireRole([UserRole.ORG_ADMIN]),
  HeritageVersionController.publish
);

router.get(
  '/',
  AuthMiddleware.authenticate,
  HeritageVersionController.getVersions
);

// GET /api/heritage-versions/:id
router.get(
  '/:id',
  AuthMiddleware.authenticate,
  HeritageVersionController.getVersionById
);

export default router;
