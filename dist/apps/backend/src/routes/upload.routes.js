import { Router } from 'express';
import { upload } from '';
import { authenticate } from '';
import { requireMinRole } from '';
import { uploadRateLimiter } from '';
import { auditLogger } from '';
import { sanitizeParams } from '';
import { asyncHandler } from '';
import * as uploadController from '';
const router = Router();
router.post('/single', authenticate, requireMinRole('technician'), uploadRateLimiter({ windowMs: 10 * 60 * 1000, max: 5, maxSize: 10 * 1024 * 1024 }), upload.single('file'), auditLogger('CREATE', 'UploadSingle'), asyncHandler(uploadController.uploadSingle));
router.post('/multiple', authenticate, requireMinRole('technician'), uploadRateLimiter({ windowMs: 10 * 60 * 1000, max: 10, maxSize: 50 * 1024 * 1024 }), upload.array('files', 10), auditLogger('CREATE', 'UploadMultiple'), asyncHandler(uploadController.uploadMultiple));
router.post('/cctv-photos', authenticate, requireMinRole('technician'), uploadRateLimiter({ windowMs: 15 * 60 * 1000, max: 3, maxSize: 60 * 1024 * 1024 }), upload.array('photos', 30), auditLogger('CREATE', 'CctvEvidenceUpload'), asyncHandler(uploadController.uploadCctvPhotos));
router.delete('/:filename', authenticate, sanitizeParams('filename'), requireMinRole('admin'), auditLogger('DELETE', 'UploadFile'), asyncHandler(uploadController.deleteFile));
export default router;
//# sourceMappingURL=upload.routes.js.map