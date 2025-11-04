/**
 * Upload Routes (TypeScript - November 2025)
 * @description Rutas modulares para gestión de uploads en CERMONT ATG. Soporte para single/multiple files, CCTV evidence photos (array max 30,
 * types: jpg/png max 5MB). Integrado con Multer (disk/cloud), auth global (technician+ para upload, admin para delete), rateLimit (5/10min
 * por user, 50MB total). Middleware: auth, file validation (size/type/virus scan via controller), audit on upload/delete, sanitize filename,
 * unlink on error. Swagger: Full docs con examples (multipart/form-data). Performance: Async fs, stream processing, no cache (dynamic).
 * Secure: Auth required, role checks, filename sanitize (no path traversal), temp dir cleanup, storage path /uploads/{userId}/{timestamp}.
 * Missing: Cloud integration (S3 via multer-s3), bulk delete, signed URLs for download, thumbnail gen (sharp). Usage: /upload/single
 * (post formData file), /multiple (array files), /cctv-photos (photos + orderId/reportId), /:filename (delete). Integrates: Evidence model
 * (save paths to Evidence/Order/CctvReport), logger. No direct DB on upload (controller saves paths). Para ATG: Evidence photos tied a CCTV
 * reports/orders, audit for compliance (file access logs). Future: Watermark (company logo), OCR extract text.
 * Pruebas: Jest supertest (POST /single 201 with mock multer, file metadata, POST /cctv-photos 201 link Evidence, DELETE /file 200 unlink,
 * 403 non-admin, 413 large file, 400 invalid type/mimetype, audit called on upload/delete). Types: No bodies (formData handled by Multer),
 * Params: { filename: string }, Queries: { unlinkEvidence?: boolean }, Fields: { file?: MulterFile, files?: MulterFile[], orderId?: string, etc. }.
 * Schemas: Joi/Zod for orderId ObjectId, descriptions array length. Fixes: upload.fields si mixed data/files, but here pure files + form fields.
 * Assumes: Multer config: diskStorage dest /tmp/uploads, filename: (req, file, cb) => cb(null, `${req.user._id}_${Date.now()}_${sanitize(file.originalname)}`).
 * Controllers: async uploadSingle(req: Request & { file?: MulterFile }, res: Response). Deps: express ^4+, multer ^1+, @types/multer.
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { upload, uploadFields } from '../utils/asyncHandler'; // Fields for mixed (files + data)
import { authenticate } from '../middleware/auth';
import { requireMinRole } from '../middleware/rbac'; // For granular RBAC
import { uploadRateLimiter } from '../utils/asyncHandler';
import { auditLogger } from '../utils/asyncHandler'; // For upload/delete
import { sanitizeParams } from '../utils/asyncHandler'; // For filename
import { asyncHandler } from '../utils/asyncHandler'; // For async routes
import { successResponse, errorResponse } from '../utils/response'; // Consistent responses
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger'; // Logging
import * as uploadController from '../utils/asyncHandler';

// Interfaces for type safety (Multer adds file/files to req)
interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

interface SingleUploadRequest extends MulterRequest {
  body: {
    description?: string;
  };
}

interface MultipleUploadRequest extends MulterRequest {
  body: {
    category?: 'evidence' | 'document' | 'photo';
  };
}

interface CctvPhotosRequest extends MulterRequest {
  body: {
    orderId: string;
    reportId?: string;
    descriptions?: string[];
  };
}

interface DeleteParams {
  filename: string;
}

interface DeleteQuery {
  unlinkEvidence?: boolean;
}

const router: Router = Router();

// ============================================================================
// UPLOAD ROUTES (Authenticated, rate limited)
// ============================================================================

/**
 * @route   POST /api/v1/upload/single
 * @desc    Single upload (multer single, audit, rate limit)
 * @access  Private (technician+)
 */
router.post<{}, {}, {}, {}, SingleUploadRequest>(
  '/single',
  authenticate,
  requireMinRole('technician'), // Technician+ for evidence
  uploadRateLimiter({ windowMs: 10 * 60 * 1000, max: 5, maxSize: 10 * 1024 * 1024 }), // 5 files/10MB per 10min
  upload.single('file'),
  auditLogger('CREATE', 'UploadSingle'),
  asyncHandler(uploadController.uploadSingle)
);

/**
 * @route   POST /api/v1/upload/multiple
 * @desc    Multiple upload (multer array max 10, audit)
 * @access  Private (technician+)
 */
router.post<{}, {}, {}, {}, MultipleUploadRequest>(
  '/multiple',
  authenticate,
  requireMinRole('technician'),
  uploadRateLimiter({ windowMs: 10 * 60 * 1000, max: 10, maxSize: 50 * 1024 * 1024 }), // 10 files/50MB per 10min
  upload.array('files', 10),
  auditLogger('CREATE', 'UploadMultiple'),
  asyncHandler(uploadController.uploadMultiple)
);

/**
 * @route   POST /api/v1/upload/cctv-photos
 * @desc    CCTV photos (multer array max 30, validate orderId/reportId, link Evidence, audit)
 * @access  Private (technician+)
 */
router.post<{}, {}, {}, {}, CctvPhotosRequest>(
  '/cctv-photos',
  authenticate,
  requireMinRole('technician'),
  uploadRateLimiter({ windowMs: 15 * 60 * 1000, max: 3, maxSize: 60 * 1024 * 1024 }), // 3 uploads/60MB per 15min (CCTV heavy)
  upload.array('photos', 30),
  auditLogger('CREATE', 'CctvEvidenceUpload'), // Specific audit
  asyncHandler(uploadController.uploadCctvPhotos)
);

// ============================================================================
// DELETE ROUTES (Admin only, audited)
// ============================================================================

/**
 * @route   DELETE /api/v1/upload/:filename
 * @desc    Delete file (sanitize filename, audit, optional unlink Evidence)
 * @access  Private (admin or owner)
 */
router.delete<DeleteParams, {}, {}, DeleteQuery>(
  '/:filename',
  authenticate,
  sanitizeParams('filename'), // Sanitize, validate pattern (no ../)
  requireMinRole('admin'), // Controller check for owner fallback
  auditLogger('DELETE', 'UploadFile'),
  asyncHandler(uploadController.deleteFile)
);

export default router;
