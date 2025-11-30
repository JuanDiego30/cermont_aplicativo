/**
 * Weather Routes
 * Endpoints para obtener información climática
 *
 * @file backend/src/infra/http/routes/weather.routes.ts
 */

import { Router } from 'express';
import { weatherController } from '../controllers/WeatherController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';

// ============================================================================
// Router Setup
// ============================================================================

const router = Router();

// Middleware global de autenticación
router.use(authenticate);

// ============================================================================
// Routes
// ============================================================================

/**
 * Obtener clima actual por coordenadas
 * @route   GET /api/weather/current
 * @param   {string} lat - Latitud
 * @param   {string} lon - Longitud
 * @access  Private
 */
router.get('/current', weatherController.getCurrent);

/**
 * Obtener pronóstico de 5 días por coordenadas
 * @route   GET /api/weather/forecast
 * @param   {string} lat - Latitud
 * @param   {string} lon - Longitud
 * @access  Private
 */
router.get('/forecast', weatherController.getForecast);

export default router;

