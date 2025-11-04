import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger';
const UPLOAD_BASE_PATH = process.env.UPLOAD_BASE_PATH ? path.resolve(process.env.UPLOAD_BASE_PATH) : path.resolve('uploads');
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        let uploadPath = '';
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
                uploadPath = 'general/';
        }
        const fullPath = path.join(UPLOAD_BASE_PATH, uploadPath);
        try {
            await fs.mkdir(fullPath, { recursive: true });
            logger.debug(`Ensured upload directory exists: ${uploadPath}`);
        }
        catch (err) {
            const error = err;
            logger.error(`Failed to create upload directory ${uploadPath}:`, error.message);
            return cb(new Error(`No se pudo crear el directorio de uploads: ${error.message}`), '');
        }
        cb(null, path.join(UPLOAD_BASE_PATH, uploadPath));
    },
    filename: function (req, file, cb) {
        const sanitizedBasename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(sanitizedBasename);
        const basename = path.basename(sanitizedBasename, ext);
        cb(null, `${basename}-${uniqueSuffix}${ext}`);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv'
    ];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
        cb(null, true);
    }
    else {
        const error = new Error(`Tipo de archivo no permitido: ${file.mimetype} (extensión: ${ext})`);
        logger.warn(`Rejected file upload: ${file.originalname} (${file.mimetype})`);
        cb(error, false);
    }
};
const getMaxFileSize = () => {
    const sizeStr = process.env.MAX_FILE_SIZE;
    if (!sizeStr) {
        logger.warn('MAX_FILE_SIZE no configurado, usando default 10MB');
        return 10 * 1024 * 1024;
    }
    const size = parseInt(sizeStr, 10);
    if (isNaN(size) || size <= 0) {
        logger.warn(`MAX_FILE_SIZE inválido (${sizeStr}), usando default 10MB`);
        return 10 * 1024 * 1024;
    }
    return size;
};
const maxFileSize = getMaxFileSize();
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: maxFileSize,
        files: 10,
    },
    fileFilter: fileFilter,
});
export const singleUpload = (field) => upload.single(field);
export const arrayUpload = (field, maxCount) => upload.array(field, maxCount || 10);
export const fieldsUpload = (fields) => upload.fields(fields);
export default upload;
//# sourceMappingURL=multer.js.map