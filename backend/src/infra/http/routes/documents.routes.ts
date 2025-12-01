/**
 * Documents Routes
 * Handles document generation and conversion
 */

import { Router, type Request } from 'express';
import multer, { type FileFilterCallback } from 'multer';
import { DocumentsController } from '../controllers/DocumentsController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        // Accept only Excel files
        const allowedMimes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
        }
    },
});

// POST /api/documents/excel-to-pdf - Convert Excel to PDF
router.post(
    '/excel-to-pdf',
    authenticate,
    upload.single('file'),
    DocumentsController.convertExcelToPdf
);

export default router;
