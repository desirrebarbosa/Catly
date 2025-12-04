import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', contactController.getContacts);
router.post('/', contactController.createContact);
router.delete('/:id', contactController.deleteContact);

export const contactRouter = router;
