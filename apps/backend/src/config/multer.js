/**
 * Multer Configuration
 * @description File upload configuration for VPS storage
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
// fileURLToPath not required here
import { logger } from '../utils/logger.js';

// Not using __dirname here (we use process.cwd() for storage paths)

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determinar carpeta según el tipo de archivo
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'evidencia' || file.fieldname === 'evidencias') {
      uploadPath = 'uploads/evidences/';
    } else if (file.fieldname === 'orden' || file.fieldname === 'orders') {
      uploadPath = 'uploads/orders/';
    } else if (file.fieldname === 'reporte' || file.fieldname === 'reports') {
      uploadPath = 'uploads/reports/';
    } else if (file.fieldname === 'profile' || file.fieldname === 'avatar') {
      uploadPath = 'uploads/profiles/';
    }

    // Crear directorio si no existe
    const fullPath = path.join(process.cwd(), uploadPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      logger.info(`Created upload directory: ${uploadPath}`);
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// Filtro de tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

// Configuración principal de Multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: fileFilter,
});

export default upload;
