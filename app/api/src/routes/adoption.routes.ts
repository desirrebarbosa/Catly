
import { Router } from 'express';
import * as adoptionController from '../controllers/adoption.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Note: catId is passed in the body or parent route usually, but here we use specific params
router.get('/:catId', adoptionController.getAdoptions);
router.post('/:catId', adoptionController.createAdoption);
router.put('/:id', adoptionController.updateAdoption);
router.delete('/:id', adoptionController.deleteAdoption);

export const adoptionRouter = router;
