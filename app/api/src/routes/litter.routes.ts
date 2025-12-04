
import { Router } from 'express';
import * as litterController from '../controllers/litter.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/:catId', litterController.getLitters);
router.post('/:catId', litterController.createLitter);
router.delete('/:id', litterController.deleteLitter);

export const litterRouter = router;
