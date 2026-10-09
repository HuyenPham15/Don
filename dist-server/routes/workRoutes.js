import { Router } from 'express';
import { workController } from '../controllers/workController';
const router = Router();
router.get('/', workController.getWorkItems);
router.get('/:id', workController.getWorkItemById);
router.post('/', workController.createWorkItem);
router.put('/:id', workController.updateWorkItem);
export default router;
