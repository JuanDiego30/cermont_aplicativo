import type { IFileStorageService } from '../../domain/services/IFileStorageService.js';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export class LocalFileStorageService implements IFileStorageService {
    async upload(fileName: string, buffer: Buffer, mimeType: string): Promise<string> {
        const fullPath = path.join(UPLOAD_DIR, fileName);
        const dir = path.dirname(fullPath);

        // Create directory if it doesn't exist
        await fs.mkdir(dir, { recursive: true });

        // Write file
        await fs.writeFile(fullPath, buffer);

        logger.info('File uploaded', { fileName, size: buffer.length });

        return fileName; // Return relative path
    }

    async download(filePath: string): Promise<Buffer> {
        const fullPath = path.join(UPLOAD_DIR, filePath);
        return await fs.readFile(fullPath);
    }

    async delete(filePath: string): Promise<void> {
        const fullPath = path.join(UPLOAD_DIR, filePath);

        try {
            await fs.unlink(fullPath);
            logger.info('File deleted', { filePath });
        } catch (error) {
            logger.warn('Failed to delete file', { filePath, error });
        }
    }

    async exists(filePath: string): Promise<boolean> {
        const fullPath = path.join(UPLOAD_DIR, filePath);

        try {
            await fs.access(fullPath);
            return true;
        } catch {
            return false;
        }
    }

    async getUrl(filePath: string): Promise<string> {
        // For local storage, return a relative URL
        return `/uploads/${filePath}`;
    }
}

export const fileStorageService = new LocalFileStorageService();
