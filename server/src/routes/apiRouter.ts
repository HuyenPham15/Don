import { Router } from 'express';
import authRoutes from './authRoutes';
import donRoutes from './donRoutes';
import workRoutes from './workRoutes';
import signingRoutes from './signingRoutes';
import workflowRoutes from './workflowRoutes';
import aiRoutes from './aiRoutes';

export const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/don', donRoutes);
apiRouter.use('/work-items', workRoutes);
apiRouter.use('/signing', signingRoutes);
apiRouter.use('/workflows', workflowRoutes);
apiRouter.use('/ai', aiRoutes);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Don WebApp Backend API',
    timestamp: new Date().toISOString(),
  });
});
