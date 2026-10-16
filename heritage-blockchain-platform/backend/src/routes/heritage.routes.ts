import { Router } from 'express';
import { HeritageController } from '../controllers/heritage.controller.js';
import { validateDto } from '../middleware/validate.middleware.js';
import { CreateHeritageDto, UpdateStatusDto } from '../types/dto/heritage.dto.js';

export const heritageRouter = Router();

heritageRouter.get('/', HeritageController.getAllHeritages);

heritageRouter.get('/:id', HeritageController.getHeritageById);

heritageRouter.post('/', validateDto(CreateHeritageDto), HeritageController.createHeritage);

heritageRouter.put('/:id', HeritageController.updateHeritage);

heritageRouter.patch('/:id/submit', HeritageController.submitHeritage);

heritageRouter.patch('/:id/status', validateDto(UpdateStatusDto), HeritageController.updateHeritageStatus);

heritageRouter.delete('/:id', HeritageController.deleteHeritage);
