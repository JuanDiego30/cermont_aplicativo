import fs from 'fs/promises';
import path from 'path';
import { basename } from 'path';
import { successResponse, errorResponse, createdResponse, HTTP_STATUS } from '../utils/response';
import { logger } from '../utils/logger';
import { z } from 'zod';
import { createAuditLog } from '../utils/response';
const UPLOAD_BASE_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const ALLOWED_SUBDIRS = ['evidences', 'orders', 'reports', 'profiles'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ALLOWED_MIME_TYPES = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf', 'text/plain',
    'video/mp4', 'video/avi',
];
const DeleteFileSchema = z.object({
    filename: z.string().min(1).max(255).refine((name) => /^[a-zA-Z0-9._-]+$/.test(name), { message: 'Filename inválido (no path traversal)' }),
    subdir: z.enum(ALLOWED_SUBDIRS).optional().default('evidences'),
});
const ensureDir = async (dirPath) => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    }
    catch (error) {
        if (error.code !== 'EEXIST') {
            throw new Error(`Failed to create directory: ${dirPath}`);
        }
    }
};
const getUploadPath = (filename, subdir) => {
    const safeFilename = basename(filename);
    return path.join(UPLOAD_BASE_DIR, subdir, safeFilename);
};
const validateFile = (file) => {
    if (!file?.mimetype || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new Error(`File type not allowed: ${file?.mimetype || 'unknown'}`);
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large: ${file.size} bytes > ${MAX_FILE_SIZE} bytes`);
    }
};
const cleanupFiles = async (filePaths) => {
    await Promise.allSettled(filePaths.map(async (filePath) => {
        try {
            await fs.unlink(filePath);
        }
        catch (error) {
            logger.warn(`Cleanup failed for ${filePath}: ${error.message}`);
        }
    }));
};
export const uploadSingle = asyncHandler(async (req, res) => {
    requireAuthenticated(req);
    const file = req.file;
    if (!file) {
        errorResponse(res, 'No file uploaded', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const subdir = req.query.subdir || 'evidences';
    if (!ALLOWED_SUBDIRS.includes(subdir)) {
        errorResponse(res, `Invalid subdir: ${subdir}. Allowed: ${ALLOWED_SUBDIRS.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const pendingPaths = [file.path];
    try {
        validateFile(file);
        await ensureDir(path.dirname(file.path));
        const filePath = getUploadPath(file.originalname, subdir);
        const fileUrl = `${BASE_URL}/uploads/${subdir}/${file.filename}`;
        const uploaded = {
            filename: file.filename,
            path: filePath,
            url: fileUrl,
            size: file.size,
            mimetype: file.mimetype,
        };
        logger.info(`File uploaded: ${file.filename} to ${subdir} (${file.size} bytes) by ${req.user.email}`);
        await createAuditLog({
            userId: req.user.userId,
            action: 'UPLOAD_SINGLE',
            resource: 'File',
            details: { filename: file.filename, subdir, mimetype: file.mimetype, size: file.size },
            status: 'SUCCESS',
            severity: 'LOW',
        });
        createdResponse(res, { data: uploaded }, 'File uploaded successfully');
    }
    catch (error) {
        logger.error('uploadSingle error:', error);
        await cleanupFiles(pendingPaths);
        errorResponse(res, error.message || 'Upload failed', HTTP_STATUS.BAD_REQUEST);
    }
});
export const uploadMultiple = asyncHandler(async (req, res) => {
    requireAuthenticated(req);
    const files = Array.isArray(req.files) ? req.files : req.files?.files || [];
    if (!files || files.length === 0) {
        errorResponse(res, 'No files uploaded', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    if (files.length > 10) {
        errorResponse(res, 'Too many files (max 10)', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const subdir = req.query.subdir || 'evidences';
    if (!ALLOWED_SUBDIRS.includes(subdir)) {
        errorResponse(res, `Invalid subdir: ${subdir}. Allowed: ${ALLOWED_SUBDIRS.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const pendingPaths = files.map((f) => f.path);
    try {
        await Promise.all(files.map(validateFile));
        await ensureDir(path.join(UPLOAD_BASE_DIR, subdir));
        const uploadedFiles = await Promise.all(files.map(async (file) => {
            const filePath = getUploadPath(file.originalname, subdir);
            const fileUrl = `${BASE_URL}/uploads/${subdir}/${file.filename}`;
            return {
                filename: file.filename,
                path: filePath,
                url: fileUrl,
                size: file.size,
                mimetype: file.mimetype,
            };
        }));
        logger.info(`Multiple files uploaded: ${files.length} to ${subdir} by ${req.user.email}`);
        await createAuditLog({
            userId: req.user.userId,
            action: 'UPLOAD_MULTIPLE',
            resource: 'File',
            details: {
                count: files.length,
                subdir,
                files: uploadedFiles.map((f) => ({ filename: f.filename, size: f.size })),
            },
            status: 'SUCCESS',
            severity: 'LOW',
        });
        createdResponse(res, { data: uploadedFiles }, `Files uploaded successfully (${uploadedFiles.length})`);
    }
    catch (error) {
        logger.error('uploadMultiple error:', error);
        await cleanupFiles(pendingPaths);
        errorResponse(res, error.message || 'Upload failed', HTTP_STATUS.BAD_REQUEST);
    }
});
export const deleteFile = asyncHandler(async (req, res) => {
    requireAuthenticated(req);
    const { subdir, filename } = DeleteFileSchema.parse(req.params);
    if (!ALLOWED_SUBDIRS.includes(subdir)) {
        errorResponse(res, `Invalid subdir: ${subdir}`, HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const filePath = getUploadPath(filename, subdir);
    try {
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        if (!exists) {
            errorResponse(res, 'File not found', HTTP_STATUS.NOT_FOUND);
            return;
        }
        await fs.unlink(filePath);
        logger.info(`File deleted: ${filename} from ${subdir} by ${req.user.email}`);
        await createAuditLog({
            userId: req.user.userId,
            action: 'DELETE_FILE',
            resource: 'File',
            details: { filename, subdir },
            status: 'SUCCESS',
            severity: 'MEDIUM',
        });
        successResponse(res, { data: { filename, subdir, deletedAt: new Date().toISOString() } }, 'File deleted successfully', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
    }
    catch (error) {
        logger.error('deleteFile error:', error);
        errorResponse(res, 'Delete failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
});
//# sourceMappingURL=upload.controller.js.map