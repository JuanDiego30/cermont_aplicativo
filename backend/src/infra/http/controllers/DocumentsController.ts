/**
 * Documents Controller
 * Handles document generation and conversion
 */

import type { Request, Response } from 'express';
import { excelToPdfService } from '../../services/ExcelToPdfService.js';
import { logger } from '../../../shared/utils/logger.js';

type MulterRequest = Request & { file?: Express.Multer.File };

export class DocumentsController {
    /**
     * Convert Excel file to PDF
     * POST /api/documents/excel-to-pdf
     */
    static async convertExcelToPdf(req: MulterRequest, res: Response) {
        try {
            // Check if file was uploaded
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No se proporcionó ningún archivo Excel',
                });
            }

            const { buffer, originalname } = req.file;

            // Get options from request body
            const options = {
                sheetName: req.body.sheetName,
                includeHeader: req.body.includeHeader === 'true',
                includeGridlines: req.body.includeGridlines === 'true',
                landscape: req.body.landscape === 'true',
            };

            logger.info('Converting Excel to PDF', { filename: originalname, options });

            // Convert to PDF
            const pdfBuffer = await excelToPdfService.convertExcelToPdf(buffer, options);

            // Generate filename
            const pdfFilename = originalname.replace(/\.(xlsx?|xls)$/i, '.pdf');

            // Send PDF as response
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${pdfFilename}"`);
            res.setHeader('Content-Length', pdfBuffer.length);

            return res.send(pdfBuffer);
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Error converting Excel to PDF:', { error: msg });

            return res.status(500).json({
                success: false,
                error: 'Error al convertir Excel a PDF',
                details: msg,
            });
        }
    }
}
