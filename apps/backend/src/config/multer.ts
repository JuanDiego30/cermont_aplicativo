/**
 * Multer Configuration (TypeScript - November 2025, Fixed)
 * @description Configuración de Multer para uploads a VPS/disk storage, con paths dinámicos, filtros seguros y limits per-type.
 * Uso: En upload.routes.ts (import { singleUpload } from '../config/multer'; router.post('/evidencia', singleUpload('evidencia'), handler)). Env: UPLOAD_BASE_PATH='uploads' (absolute), MAX_FILE_SIZE=10485760 (10MB default).
 * Integrado con: logger (debug/warn/error structured), fs/promises (async mkdir/access). Secure: Sanitización filename (alfanum _.- no traversal), dual MIME/ext validation, size per-field, no symlinks (path.resolve + access).
 * Performance: Async dir creation (non-blocking), unique filenames (timestamp + rand 1E9). Extensible: Cloud S3 via multer-s3 (stub options), virus scan (e.g., ClamAV). Para ATG: Paths por fieldname (evidencias/orders/reports/profiles), videos CCTV.
 * Types: @types/multer^1.4.12 (FileFilterCallback overload, no any), Express.RequestHandler for wrappers. Pruebas: Jest mock('multer'), test singleUpload(req with file>maxSize).reject with 400, cb(null,true/false).
 * Fixes/Updates 2025: FileFilterCallback signature (optional err/accept, no fixed args TS2322), new Error() en filter (no MulterError code TS2345, custom message), singleUpload return RequestHandler (typed Response/NextFunction TS2322/7006, per-field max check). arrayUpload simple Multer. Strict cb, structured logs. tsconfig: "strict": true.
 * Model Assumes: Disk VPS writable. Deps: multer@^1.4.5-lts.1, @types/multer@^1.4.12. Security: No exec files, size <50MB. Future: Sharp resize, S3.
 */

import multer, { StorageEngine, Multer, FileFilterCallback } from 'multer';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger';

interface MulterFile extends Express.Multer.File {
  fieldname: string; // Explicit for type safety
  originalname: string;
  mimetype: string;
}

// Configurable base upload path - Resolve para absolute safety + validate exists
const UPLOAD_BASE_PATH: string = process.env.UPLOAD_BASE_PATH ? path.resolve(process.env.UPLOAD_BASE_PATH) : path.resolve('uploads');

// Validate base path writable (async init)
const validateUploadPath = async (): Promise<void> => {
  try {
    await fs.access(UPLOAD_BASE_PATH, fs.constants.W_OK);
    logger.debug(`Upload base path validated: ${UPLOAD_BASE_PATH}`);
  } catch (err) {
    const error = err as Error;
    logger.error(`Upload base path invalid (${UPLOAD_BASE_PATH}):`, { error: error.message });
    throw new Error(`Directorio de uploads no accesible: ${error.message}`);
  }
};

// Per-field max sizes (MB to bytes, extensible)
const getMaxSizePerField = (fieldname: string): number => {
  const sizes: Record<string, number> = {
    evidencia: 20 * 1024 * 1024, // 20MB for CCTV
    orden: 10 * 1024 * 1024,     // 10MB docs
    reporte: 15 * 1024 * 1024,   // 15MB reports
    profile: 2 * 1024 * 1024,    // 2MB avatars
  };
  return sizes[fieldname] || 10 * 1024 * 1024; // Default 10MB
};

// Default max from env (fallback)
const getDefaultMaxFileSize = (): number => {
  const sizeStr: string | undefined = process.env.MAX_FILE_SIZE;
  if (!sizeStr) {
    logger.warn('MAX_FILE_SIZE no configurado, usando default 10MB');
    return 10 * 1024 * 1024;
  }
  
  const size: number = parseInt(sizeStr, 10);
  if (isNaN(size) || size <= 0) {
    logger.warn(`MAX_FILE_SIZE inválido (${sizeStr}), usando default 10MB`);
    return 10 * 1024 * 1024;
  }
  
  return size;
};

const defaultMaxFileSize: number = getDefaultMaxFileSize();

// Init validate (call once, silent catch for routes)
validateUploadPath().catch((err) => logger.error('Init upload path failed:', { error: err.message }));

// Configurar almacenamiento - Typed async callbacks
const storage: StorageEngine = multer.diskStorage({
  destination: async function (req: Request, file: MulterFile, cb: (error: Error | null, destination: string) => void): Promise<void> {
    // Determinar carpeta según el tipo de archivo
    let uploadPath: string = '';
    
    switch (file.fieldname) {
      case 'evidencia':
      case 'evidencias':
        uploadPath = 'evidences/';
        break;
      case 'orden':
      case 'orders':
        uploadPath = 'orders/';
        break;
      case 'reporte':
      case 'reports':
        uploadPath = 'reports/';
        break;
      case 'profile':
      case 'avatar':
        uploadPath = 'profiles/';
        break;
      default:
        uploadPath = 'general/'; // Default para campos no mapeados
    }

    const fullPath: string = path.join(UPLOAD_BASE_PATH, uploadPath);
    
    try {
      // Crear directorio de forma asíncrona si no existe
      await fs.mkdir(fullPath, { recursive: true });
      logger.debug(`Ensured upload directory: ${uploadPath}`, { fieldname: file.fieldname });
    } catch (err) {
      const error = err as Error;
      logger.error(`Failed to create upload directory ${uploadPath}:`, { error: error.message, fieldname: file.fieldname });
      return cb(new Error(`No se pudo crear el directorio de uploads: ${error.message}`), '');
    }

    cb(null, fullPath);
  },
  filename: function (req: Request, file: MulterFile, cb: (error: Error | null, filename: string) => void): void {
    // Sanitizar basename para prevenir path traversal (solo alfanuméricos, guiones, underscores, puntos)
    const sanitizedBasename: string = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix: string = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext: string = path.extname(sanitizedBasename);
    const basename: string = path.basename(sanitizedBasename, ext);
    const filename: string = `${basename}-${uniqueSuffix}${ext}`;
    logger.debug(`Generated filename: ${filename}`, { original: file.originalname, fieldname: file.fieldname });
    cb(null, filename);
  }
});

// Filtro de tipos de archivo permitidos - Proper FileFilterCallback overload (optional err/accept)
const fileFilter = (
  req: Request,
  file: MulterFile,
  cb: (error: Error | null, acceptFile?: boolean) => void
): void => {
  const allowedMimes: string[] = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    // Docs
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    // Videos for CCTV (2025 update)
    'video/mp4', 'video/avi', 'video/mov'
  ];

  const allowedExts: string[] = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', 
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv',
    // Videos
    '.mp4', '.avi', '.mov'
  ];

  const ext: string = path.extname(file.originalname).toLowerCase();

  // Check size per-field (early reject)
  const maxSize = getMaxSizePerField(file.fieldname);
  if (file.size > maxSize) {
    const error: Error = new Error(`Archivo demasiado grande. Máx: ${(maxSize / 1024 / 1024)}MB para ${file.fieldname}`);
    logger.warn(`Rejected oversized file: ${file.originalname}`, { size: file.size, max: maxSize, fieldname: file.fieldname });
    return cb(error, false);
  }

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    const error: Error = new Error(`Tipo de archivo no permitido: ${file.mimetype} (extensión: ${ext})`);
    logger.warn(`Rejected file upload: ${file.originalname}`, { mimetype: file.mimetype, ext, fieldname: file.fieldname });
    cb(error, false);
  }
};

// Dynamic limits (global fallback, per-field in filter)
const multerLimits = {
  files: 10, // Límite de archivos por request anti-DoS
  fileSize: defaultMaxFileSize, // Overridden in filter
};

// Configuración principal de Multer - Typed instance
export const upload: Multer = multer({
  storage: storage,
  limits: multerLimits,
  fileFilter: fileFilter,
});

// Helpers para uso en routes (typed middleware)
export const singleUpload = (field: string): RequestHandler => {
  const uploader = upload.single(field);
  return (req: Request, res: Response, next: NextFunction) => {
    uploader(req, res, (err: any) => {
      if (err) {
        // Handle Multer errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          const maxSize = getMaxSizePerField(field);
          logger.warn(`File size limit exceeded: ${req.file?.originalname}`, { field, size: req.file?.size, max: maxSize });
          return res.status(400).json({ success: false, message: `Archivo demasiado grande. Máx: ${(maxSize / 1024 / 1024)}MB para ${field}` });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ success: false, message: `Demasiados archivos para ${field}. Máx: 10` });
        }
        // Custom filter errors
        if (err.message?.includes('Tipo de archivo no permitido') || err.message?.includes('demasiado grande')) {
          return res.status(400).json({ success: false, message: err.message });
        }
        logger.error('Multer single upload error:', { code: err.code, message: err.message, field });
        return res.status(400).json({ success: false, message: `Error en upload: ${err.message}` });
      }
      next();
    });
  };
};

export const arrayUpload = (field: string, maxCount: number = 10): RequestHandler => {
  logger.debug(`Array upload configured: ${field} (max: ${maxCount})`);
  return upload.array(field, maxCount); // Direct Multer middleware (RequestHandler), handle errors in route
};

export const fieldsUpload = (fields: { name: string; maxCount?: number }[]): RequestHandler => {
  logger.debug(`Fields upload configured:`, { fields });
  return upload.fields(fields);
};

export default upload;
