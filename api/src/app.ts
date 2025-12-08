import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler.js';
import { env } from './config/env.js';

// Import routes
import authRoutes from './modules/auth/index.js';
import ordenesRoutes from './modules/ordenes/index.js';
import usuariosRoutes from './modules/usuarios/index.js';
import planeacionRoutes from './modules/planeacion/index.js';
import kitsRoutes from './modules/kits/index.js';
import ejecucionRoutes from './modules/ejecucion/index.js';
import evidenciasRoutes from './modules/evidencias/index.js';
import dashboardRoutes from './modules/dashboard/index.js';
import reportesRoutes from './modules/reportes/index.js';

const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Passport Config
import passport from 'passport';
import { configureGoogleStrategy } from './modules/auth/strategies/google.strategy.js';

app.use(passport.initialize());
configureGoogleStrategy();

// Servir archivos estáticos de uploads
const uploadsDir = env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/planeacion', planeacionRoutes);
app.use('/api/kits', kitsRoutes);
app.use('/api/ejecucion', ejecucionRoutes);
app.use('/api/evidencias', evidenciasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reportes', reportesRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
