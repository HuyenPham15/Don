import { app } from './app';
const PORT = parseInt(process.env.BACKEND_PORT || '3001', 10);
app.listen(PORT, () => {
    console.log(`🚀 [Backend API] Server is running at http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
