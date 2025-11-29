/**
 * Rutas de Clima
 *
 * @file backend/src/infra/http/routes/weather.routes.ts
 */

import { Router } from 'express';
import { weatherController } from '../controllers/WeatherController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';

const router = Router();

// Middleware global de autenticación
router.use(authenticate);

/**
 * @route   GET /api/weather/current
 * @desc    Obtener clima actual por coordenadas
 * @query   lat - Latitud
 * @query   lon - Longitud
 * @access  Private
 */
router.get('/current', weatherController.getCurrent);

/**
 * @route   GET /api/weather/forecast
 * @desc    Obtener pronóstico de 5 días por coordenadas
 * @query   lat - Latitud
 * @query   lon - Longitud
 * @access  Private
 */
router.get('/forecast', weatherController.getForecast);

export default router;

