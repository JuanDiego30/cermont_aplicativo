/**
 * Upload Controller (TypeScript - November 2025 - FIXED)
 * @description Gestión completa de uploads CERMONT ATG
 */

import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { basename } from 'path';
import { successResponse, errorResponse, createdResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';
import { createAuditLog } from '../middleware/auditLogger.js';
import type { AuditLogData } from '../types/index.js';

// ==================== HELPERS ====================

const requireAuthenticated = (req: Request): void => {
  const user = (req as any).user;
  if (!user || !user.userId) {
    throw new Error('No autenticado');
  }
};

// ==================== TYPES ====================

interface UploadedFile {
  filename: string;
  path: string;
  url: string;
  size: number;
  mimetype: string;
}

// ==================== CONSTANTS ====================

const UPLOAD_BASE_DIR: string = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const ALLOWED_SUBDIRS = ['evidences', 'orders', 'reports', 'profiles'] as const;
type SubDir = typeof ALLOWED_SUBDIRS[number];
const MAX_FILE_SIZE: number = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10) * 1024 * 1024;
const BASE_URL: string = process.env.BASE_URL || 'http://localhost:3000';
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 
  'image/png', 
  'image/gif',
  'application/pdf', 
  'text/plain',
  'video/mp4', 
  'video/avi',
] as const;

// ==================== ZOD SCHEMAS ====================

const DeleteFileSchema = z.object({
  filename: z.string().min(1).max(255).refine(
    (name: string) => /^[a-zA-Z0-9._-]+$/.test(name), 
    { message: 'Filename inválido (no path traversal)' }
  ),
  subdir: z.enum(ALLOWED_SUBDIRS).default('evidences'),
});

type DeleteFileType = z.infer<typeof DeleteFileSchema>;

// ==================== HELPERS ====================

const ensureDir = async (dirPath: string): Promise<void> => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw new Error(`Failed to create directory: ${dirPath}`);
    }
  }
};

const getUploadPath = (filename: string, subdir: SubDir): string => {
  const safeFilename: string = basename(filename);
  return path.join(UPLOAD_BASE_DIR, subdir, safeFilename);
};

const validateFile = (file: Express.Multer.File): void => {
  if (!file?.mimetype || !ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
    throw new Error(`File type not allowed: ${file?.mimetype || 'unknown'}`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${file.size} bytes > ${MAX_FILE_SIZE} bytes`);
  }
};

const cleanupFiles = async (filePaths: string[]): Promise<void> => {
  await Promise.allSettled(
    filePaths.map(async (filePath: string) => {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        logger.warn(`Cleanup failed for ${filePath}: ${(error as Error).message}`);
      }
    })
  );
};

// ==================== CONTROLLERS ====================

export const uploadSingle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireAuthenticated(req);

  const file: Express.Multer.File | undefined = req.file;

  if (!file) {
    errorResponse(res, 'No file uploaded', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const subdir: SubDir = (req.query.subdir as SubDir) || 'evidences';
  if (!ALLOWED_SUBDIRS.includes(subdir)) {
    errorResponse(
      res,
      `Invalid subdir: ${subdir}. Allowed: ${ALLOWED_SUBDIRS.join(', ')}`,
      HTTP_STATUS.BAD_REQUEST
    );
    return;
  }

  const pendingPaths: string[] = [file.path];
  try {
    validateFile(file);

    await ensureDir(path.dirname(file.path));

    const filePath: string = getUploadPath(file.originalname, subdir);
    const fileUrl: string = `${BASE_URL}/uploads/${subdir}/${file.filename}`;
    
    const uploaded: UploadedFile = {
      filename: file.filename,
      path: filePath,
      url: fileUrl,
      size: file.size,
      mimetype: file.mimetype,
    };

    logger.info(`File uploaded: ${file.filename} to ${subdir} (${file.size} bytes) by ${(req as any).user.email}`);

    await createAuditLog({
      userId: (req as any).user.userId,
      action: 'UPLOAD_SINGLE',
      resource: 'File',
      details: { filename: file.filename, subdir, mimetype: file.mimetype, size: file.size },
      status: 'SUCCESS',
      severity: 'LOW',
    } as AuditLogData);

    createdResponse(res, uploaded, 'File uploaded successfully');
  } catch (error) {
    logger.error('uploadSingle error:', error);
    await cleanupFiles(pendingPaths);
    errorResponse(
      res,
      (error as Error).message || 'Upload failed',
      HTTP_STATUS.BAD_REQUEST
    );
  }
});

export const uploadMultiple = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireAuthenticated(req);

  const files: Express.Multer.File[] = Array.isArray(req.files) 
    ? req.files 
    : (req.files as any)?.files || [];

  if (!files || files.length === 0) {
    errorResponse(res, 'No files uploaded', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  if (files.length > 10) {
    errorResponse(res, 'Too many files (max 10)', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const subdir: SubDir = (req.query.subdir as SubDir) || 'evidences';
  if (!ALLOWED_SUBDIRS.includes(subdir)) {
    errorResponse(
      res,
      `Invalid subdir: ${subdir}. Allowed: ${ALLOWED_SUBDIRS.join(', ')}`,
      HTTP_STATUS.BAD_REQUEST
    );
    return;
  }

  const pendingPaths: string[] = files.map((f: Express.Multer.File) => f.path);
  try {
    await Promise.all(files.map(validateFile));

    await ensureDir(path.join(UPLOAD_BASE_DIR, subdir));

    const uploadedFiles: UploadedFile[] = await Promise.all(
      files.map(async (file: Express.Multer.File) => {
        const filePath: string = getUploadPath(file.originalname, subdir);
        const fileUrl: string = `${BASE_URL}/uploads/${subdir}/${file.filename}`;
        return {
          filename: file.filename,
          path: filePath,
          url: fileUrl,
          size: file.size,
          mimetype: file.mimetype,
        };
      })
    );

    logger.info(`Multiple files uploaded: ${files.length} to ${subdir} by ${(req as any).user.email}`);

    await createAuditLog({
      userId: (req as any).user.userId,
      action: 'UPLOAD_MULTIPLE',
      resource: 'File',
      details: {
        count: files.length,
        subdir,
        files: uploadedFiles.map((f: UploadedFile) => ({ filename: f.filename, size: f.size })),
      },
      status: 'SUCCESS',
      severity: 'LOW',
    } as AuditLogData);

    createdResponse(res, uploadedFiles, `Files uploaded successfully (${uploadedFiles.length})`);
  } catch (error) {
    logger.error('uploadMultiple error:', error);
    await cleanupFiles(pendingPaths);
    errorResponse(
      res,
      (error as Error).message || 'Upload failed',
      HTTP_STATUS.BAD_REQUEST
    );
  }
});

export const deleteFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireAuthenticated(req);

  const { subdir, filename } = DeleteFileSchema.parse(req.params);

  if (!ALLOWED_SUBDIRS.includes(subdir)) {
    errorResponse(res, `Invalid subdir: ${subdir}`, HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const filePath: string = getUploadPath(filename, subdir);

  try {
    const exists: boolean = await fs.access(filePath)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      errorResponse(res, 'File not found', HTTP_STATUS.NOT_FOUND);
      return;
    }

    await fs.unlink(filePath);

    logger.info(`File deleted: ${filename} from ${subdir} by ${(req as any).user.email}`);

    await createAuditLog({
      userId: (req as any).user.userId,
      action: 'DELETE_FILE',
      resource: 'File',
      details: { filename, subdir },
      status: 'SUCCESS',
      severity: 'MEDIUM',
    } as AuditLogData);

    successResponse(
      res,
      { filename, subdir, deletedAt: new Date().toISOString() },
      'File deleted successfully',
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error('deleteFile error:', error);
    errorResponse(res, 'Delete failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});
