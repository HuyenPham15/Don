import { Router } from 'express';
import { aiController } from '../controllers/aiController';
const router = Router();
router.post('/analyze', aiController.analyzeDon);
router.post('/chat', aiController.chatAssistant);
export default router;
