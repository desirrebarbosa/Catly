
import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', inventoryController.getInventoryItems);
router.post('/', inventoryController.createInventoryItem);
router.put('/:id', inventoryController.updateInventoryItem);
router.delete('/:id', inventoryController.deleteInventoryItem);

export const inventoryRouter = router;
