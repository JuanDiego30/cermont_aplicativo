import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PdfStorageService {
    private readonly logger = new Logger(PdfStorageService.name);
    private readonly storageDir: string;

    constructor(private readonly configService: ConfigService) {
        this.storageDir = this.configService.get('PDF_STORAGE_DIR') || './storage/pdfs';
    }

    async onModuleInit() {
        // Crear directorio si no existe
        try {
            await fs.mkdir(this.storageDir, { recursive: true });
            this.logger.log(`Directorio de almacenamiento: ${this.storageDir}`);
        } catch (error) {
            this.logger.error('Error creando directorio de storage', error);
        }
    }

    async save(buffer: Buffer, filename: string): Promise<string> {
        try {
            const filepath = path.join(this.storageDir, filename);
            await fs.writeFile(filepath, buffer);
            this.logger.log(`PDF guardado: ${filepath}`);
            return filepath;
        } catch (error) {
            this.logger.error('Error guardando PDF', error);
            throw error;
        }
    }

    async get(filename: string): Promise<Buffer | null> {
        try {
            const filepath = path.join(this.storageDir, filename);
            return await fs.readFile(filepath);
        } catch (error) {
            this.logger.warn(`PDF no encontrado: ${filename}`);
            return null;
        }
    }

    async delete(filename: string): Promise<boolean> {
        try {
            const filepath = path.join(this.storageDir, filename);
            await fs.unlink(filepath);
            this.logger.log(`PDF eliminado: ${filepath}`);
            return true;
        } catch (error) {
            this.logger.warn(`Error eliminando PDF: ${filename}`);
            return false;
        }
    }

    async exists(filename: string): Promise<boolean> {
        try {
            const filepath = path.join(this.storageDir, filename);
            await fs.access(filepath);
            return true;
        } catch {
            return false;
        }
    }

    getPublicUrl(filename: string): string {
        const baseUrl = this.configService.get('API_URL') || 'http://localhost:3000';
        return `${baseUrl}/api/pdfs/${filename}`;
    }
}
