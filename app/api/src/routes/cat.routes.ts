import { Router } from 'express';
import * as catController from '../controllers/cat.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply middleware to all routes
router.use(authenticate);

router.get('/', catController.getCats);
router.post('/', catController.createCat);
router.get('/:id', catController.getCatById);
router.put('/:id', catController.updateCat);
router.delete('/:id', catController.deleteCat);

router.get('/:catId/health', catController.getHealthEvents);
router.post('/:catId/health', catController.addHealthEvent);

export const catRouter = router;