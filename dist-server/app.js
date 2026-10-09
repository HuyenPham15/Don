import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/apiRouter';
export const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Simple logger middleware
app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        console.log(`[API ${req.method}] ${req.url}`);
    }
    next();
});
// Mount /api routes
app.use('/api', apiRouter);
// Fallback 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint không tồn tại: ${req.method} ${req.baseUrl}${req.url}`,
    });
});
