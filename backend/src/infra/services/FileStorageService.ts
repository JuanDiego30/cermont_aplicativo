/**
 * Servicio de almacenamiento de archivos (evidencias)
 * Resuelve: Pérdida de certificados, extravío de evidencias
 * 
 * @file backend/src/infra/services/FileStorageService.ts
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

// ==========================================
// Tipos y Configuraciones
// ==========================================

export interface StorageConfig {
  basePath: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
  enableCompression: boolean;
  compressionQuality: number;
}

export interface UploadResult {
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  url: string;
  checksum: string;
}

// Default configuration
const DEFAULT_CONFIG: StorageConfig = {
  basePath: path.join(process.cwd(), 'storage', 'evidences'),
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
    'video/mp4',
    'video/quicktime',
  ],
  enableCompression: true,
  compressionQuality: 80,
};

// ==========================================
// Helper de Procesamiento (Separación de Responsabilidad)
// ==========================================

class ImageProcessor {
  static async compress(buffer: Buffer, quality: number): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality })
        .toBuffer();
    } catch (error) {
      throw new Error('Failed to process image');
    }
  }
}

// ==========================================
// Servicio de Almacenamiento
// ==========================================

export class FileStorageService {
  private readonly config: StorageConfig;

  constructor(config?: Partial<StorageConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Inicializa el servicio (crea directorios necesarios)
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.config.basePath, { recursive: true });
    
    // Crear directorio del mes actual preventivamente
    const { relativePath } = this.getDatePathInfo();
    await fs.mkdir(path.join(this.config.basePath, relativePath), { recursive: true });
  }

  /**
   * Sube un archivo
   */
  async upload(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<UploadResult> {
    this.validateFile(fileBuffer, mimeType);

    let processedBuffer = fileBuffer;

    // Delegar compresión
    if (this.config.enableCompression && mimeType.startsWith('image/')) {
      processedBuffer = await ImageProcessor.compress(processedBuffer, this.config.compressionQuality);
    }

    const filename = this.generateUniqueFilename(originalName);
    const { relativePath, fullPath } = this.getDatePathInfo(filename);

    // Asegurar que el directorio existe (lazy creation)
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, processedBuffer);

    const checksum = this.calculateChecksum(processedBuffer);

    return {
      filename,
      originalName,
      mimeType,
      fileSize: processedBuffer.length,
      filePath: path.join(relativePath, filename), // Relative path for DB
      url: `/api/evidences/files/${relativePath}/${filename}`,
      checksum,
    };
  }

  async download(relativePath: string): Promise<Buffer> {
    // Sanitizar ruta para evitar Path Traversal
    const safePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(this.config.basePath, safePath);

    try {
      return await fs.readFile(fullPath);
    } catch {
      throw new Error(`File not found: ${relativePath}`);
    }
  }

  async delete(relativePath: string): Promise<boolean> {
    const safePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(this.config.basePath, safePath);

    try {
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      // Si el error es ENOENT (no existe), lo consideramos "éxito" (idempotencia)
      return (error as any).code === 'ENOENT';
    }
  }

  async exists(relativePath: string): Promise<boolean> {
    const safePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(this.config.basePath, safePath);

    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene el tamaño total de almacenamiento usado
   */
  async getStorageSize(): Promise<number> {
    return this.calculateDirSize(this.config.basePath);
  }

  // ==========================================
  // Helpers Privados
  // ==========================================

  private validateFile(buffer: Buffer, mimeType: string): void {
    if (buffer.length > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed: ${(this.config.maxFileSize / 1024 / 1024).toFixed(2)} MB`);
    }

    if (!this.config.allowedMimeTypes.includes(mimeType)) {
      throw new Error(`File type not allowed: ${mimeType}`);
    }
  }

  private getDatePathInfo(filename: string = '') {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const relativePath = path.join(year, month);
    const fullPath = path.join(this.config.basePath, relativePath, filename);
    
    return { relativePath, fullPath };
  }

  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext)
      .replace(/[^a-zA-Z0-9]/g, '-') // Sanitizar nombre
      .substring(0, 50);
    
    return `${baseName}-${timestamp}-${random}${ext}`;
  }

  private calculateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  private async calculateDirSize(dirPath: string): Promise<number> {
    let totalSize = 0;
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          totalSize += await this.calculateDirSize(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Ignorar errores de lectura si el directorio no existe
    }
    return totalSize;
  }
}

export const fileStorageService = new FileStorageService();

