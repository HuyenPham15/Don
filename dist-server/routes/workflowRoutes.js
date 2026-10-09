import { Router } from 'express';
import { workflowController } from '../controllers/workflowController';
const router = Router();
router.get('/', workflowController.getWorkflows);
router.get('/departments', workflowController.getDepartments);
export default router;
