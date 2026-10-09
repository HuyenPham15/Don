import { Router } from 'express';
import { signingController } from '../controllers/signingController';

const router = Router();

router.get('/', signingController.getSigningDocuments);
router.get('/:id', signingController.getSigningDocumentById);
router.post('/:id/sign', signingController.signDocument);

export default router;
