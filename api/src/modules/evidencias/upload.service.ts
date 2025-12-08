import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';

// Directorio de uploads - usar variable de entorno o valor por defecto
const UPLOAD_DIR = env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

export interface SavedFile {
    rutaArchivo: string;
    nombreArchivo: string;
    tamano: number;
    mimeType: string;
}

export class UploadService {
    /**
     * Inicializar directorio de uploads
     */
    async init(): Promise<void> {
        const dirs = ['evidencias', 'documentos', 'firmas', 'temp'];

        for (const dir of dirs) {
            const fullPath = path.join(UPLOAD_DIR, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
                logger.info(`Directorio creado: ${fullPath}`);
            }
        }
    }

    /**
     * Guardar archivo subido
     */
    async saveFile(
        file: Express.Multer.File,
        subfolder: string = 'evidencias'
    ): Promise<SavedFile> {
        try {
            // Crear nombre único
            const extension = path.extname(file.originalname);
            const nombreArchivo = `${randomUUID()}${extension}`;

            // Crear directorio si no existe
            const carpeta = path.join(UPLOAD_DIR, subfolder);
            if (!fs.existsSync(carpeta)) {
                fs.mkdirSync(carpeta, { recursive: true });
            }

            // Ruta completa del archivo
            const rutaCompleta = path.join(carpeta, nombreArchivo);

            // Guardar archivo desde buffer
            await fs.promises.writeFile(rutaCompleta, file.buffer);

            logger.info(`Archivo guardado: ${rutaCompleta}`);

            return {
                rutaArchivo: path.join(subfolder, nombreArchivo),
                nombreArchivo,
                tamano: file.size,
                mimeType: file.mimetype,
            };
        } catch (error) {
            logger.error('Error al guardar archivo:', error);
            throw error;
        }
    }

    /**
     * Obtener URL pública del archivo
     */
    getFileUrl(rutaArchivo: string): string {
        return `/uploads/${rutaArchivo.replace(/\\/g, '/')}`;
    }

    /**
     * Obtener ruta absoluta del archivo
     */
    getAbsolutePath(rutaArchivo: string): string {
        return path.join(UPLOAD_DIR, rutaArchivo);
    }

    /**
     * Eliminar archivo
     */
    async deleteFile(rutaArchivo: string): Promise<void> {
        try {
            const rutaCompleta = this.getAbsolutePath(rutaArchivo);

            if (fs.existsSync(rutaCompleta)) {
                await fs.promises.unlink(rutaCompleta);
                logger.info(`Archivo eliminado: ${rutaCompleta}`);
            }
        } catch (error) {
            logger.error(`Error al eliminar archivo ${rutaArchivo}:`, error);
            // No lanzar error, solo registrar
        }
    }

    /**
     * Verificar si archivo existe
     */
    fileExists(rutaArchivo: string): boolean {
        return fs.existsSync(this.getAbsolutePath(rutaArchivo));
    }

    /**
     * Obtener información del archivo
     */
    async getFileInfo(rutaArchivo: string): Promise<fs.Stats | null> {
        try {
            const rutaCompleta = this.getAbsolutePath(rutaArchivo);
            return await fs.promises.stat(rutaCompleta);
        } catch {
            return null;
        }
    }

    /**
     * Mover archivo temporal a ubicación final
     */
    async moveFile(tempPath: string, destPath: string): Promise<void> {
        try {
            const srcFull = this.getAbsolutePath(tempPath);
            const destFull = this.getAbsolutePath(destPath);

            // Crear directorio destino si no existe
            const destDir = path.dirname(destFull);
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            await fs.promises.rename(srcFull, destFull);
            logger.info(`Archivo movido: ${srcFull} -> ${destFull}`);
        } catch (error) {
            logger.error('Error al mover archivo:', error);
            throw error;
        }
    }
}

export const uploadService = new UploadService();
