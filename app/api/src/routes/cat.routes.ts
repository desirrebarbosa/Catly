import { Router } from 'express';
import * as catController from '../controllers/cat.controller';

const router = Router();

router.get('/', catController.getCats);
router.post('/', catController.createCat);
router.get('/:id', catController.getCatById);
router.put('/:id', catController.updateCat);
router.delete('/:id', catController.deleteCat);


router.get('/:catId/health', catController.getHealthEvents);
router.post('/:catId/health', catController.addHealthEvent);

export const catRouter = router;