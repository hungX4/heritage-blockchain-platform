import { Router } from 'express';
import { HeritageVersionController } from '../controllers/heritage-version.controller.js';

export const heritageVersionRouter = Router();

heritageVersionRouter.get('/heritage/:heritageId', HeritageVersionController.getVersionsByHeritageId);
heritageVersionRouter.get('/heritage/:heritageId/latest', HeritageVersionController.getLatestVersionByHeritageId);
heritageVersionRouter.post('/heritage/:heritageId', HeritageVersionController.createVersionForHeritage);
