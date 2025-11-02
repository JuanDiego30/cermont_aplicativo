/**
 * Upload Controller
 * Minimal implementation to handle file uploads (single/multiple) and deletion
 */

import fs from 'fs';
import path from 'path';
import { successResponse, errorResponse, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * Subir un archivo single
 */
export const uploadSingle = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return errorResponse(res, 'No file uploaded', HTTP_STATUS.BAD_REQUEST);
    }

    return successResponse(res, { file }, 'File uploaded', HTTP_STATUS.CREATED);
  } catch (error) {
    logger.error('uploadSingle error:', error);
    return errorResponse(res, 'Upload failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Subir múltiples archivos
 */
export const uploadMultiple = async (req, res) => {
  try {
    const files = req.files || req.files?.files || [];

    if (!files || files.length === 0) {
      return errorResponse(res, 'No files uploaded', HTTP_STATUS.BAD_REQUEST);
    }

    return successResponse(res, { files }, 'Files uploaded', HTTP_STATUS.CREATED);
  } catch (error) {
    logger.error('uploadMultiple error:', error);
    return errorResponse(res, 'Upload failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Eliminar un archivo por nombre (busca en carpetas comunes de uploads)
 */
export const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return errorResponse(res, 'Filename required', HTTP_STATUS.BAD_REQUEST);
    }

    const candidateDirs = [
      'uploads',
      'uploads/evidences',
      'uploads/orders',
      'uploads/reports',
      'uploads/profiles',
    ];

    let deleted = false;
    let deletedPath = null;

    for (const dir of candidateDirs) {
      const p = path.join(process.cwd(), dir, filename);
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        deleted = true;
        deletedPath = p;
        break;
      }
    }

    if (!deleted) {
      return errorResponse(res, 'File not found', HTTP_STATUS.NOT_FOUND);
    }

    return successResponse(res, { path: deletedPath }, 'File deleted');
  } catch (error) {
    logger.error('deleteFile error:', error);
    return errorResponse(res, 'Delete failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};
