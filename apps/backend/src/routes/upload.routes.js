/**
 * Upload Routes
 * @description Rutas para subida de archivos con Multer
 */

import express from 'express';
import { upload } from '../config/multer.js';
import { authenticate } from '../middleware/auth.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';
import * as uploadController from '../controllers/upload.controller.js';

const router = express.Router();

/**
 * @route   POST /api/v1/upload/single
 * @desc    Subir un archivo
 * @access  Private
 */
router.post(
  '/single',
  authenticate,
  upload.single('file'),
  uploadController.uploadSingle
);

/**
 * @route   POST /api/v1/upload/multiple
 * @desc    Subir múltiples archivos
 * @access  Private
 */
router.post(
  '/multiple',
  authenticate,
  upload.array('files', 10), // Máximo 10 archivos
  uploadController.uploadMultiple
);

/**
 * @route   POST /api/v1/upload/cctv-photos
 * @desc    Subir fotos de CCTV (evidencias)
 * @access  Private
 */
router.post(
  '/cctv-photos',
  uploadRateLimiter,
  authenticate,
  upload.array('photos', 30), // Máximo 30 fotos
  uploadController.uploadMultiple
);

/**
 * @route   DELETE /api/v1/upload/:filename
 * @desc    Eliminar un archivo
 * @access  Private
 */
router.delete(
  '/:filename',
  authenticate,
  uploadController.deleteFile
);

export default router;
