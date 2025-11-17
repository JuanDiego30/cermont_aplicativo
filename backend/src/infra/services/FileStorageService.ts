/**
 * Servicio de almacenamiento de archivos (evidencias)
 * Resuelve: P�rdida de certificados, extrav�o de evidencias
 * 
 * @file backend/src/infra/services/FileStorageService.ts
 * @requires multer
 * @requires sharp (compresi�n de im�genes)
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

/**
 * Configuraci�n de almacenamiento
 */
interface StorageConfig {
  basePath: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
  enableCompression: boolean;
  compressionQuality: number;
}

/**
 * Resultado de subida de archivo
 */
export interface UploadResult {
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  url: string;
  checksum: string;
}

/**
 * Servicio de almacenamiento de archivos
 * @class FileStorageService
 */
export class FileStorageService {
  private readonly config: StorageConfig;

  constructor(config?: Partial<StorageConfig>) {
    this.config = {
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
      ...config,
    };
  }

  /**
   * Inicializa el servicio (crea directorios necesarios)
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.config.basePath, { recursive: true });
    
    // Crear subdirectorios por a�o/mes
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    await fs.mkdir(path.join(this.config.basePath, String(year), month), { recursive: true });
  }

  /**
   * Sube un archivo
   * @param {Buffer} fileBuffer - Buffer del archivo
   * @param {string} originalName - Nombre original del archivo
   * @param {string} mimeType - Tipo MIME del archivo
   * @returns {Promise<UploadResult>} Resultado de la subida
   */
  async upload(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<UploadResult> {
    // Validar tama�o
    if (fileBuffer.length > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed: ${this.config.maxFileSize} bytes`);
    }

    // Validar tipo MIME
    if (!this.config.allowedMimeTypes.includes(mimeType)) {
      throw new Error(`File type not allowed: ${mimeType}`);
    }

    // Comprimir si es imagen
    let processedBuffer = fileBuffer;
    if (this.config.enableCompression && mimeType.startsWith('image/')) {
      processedBuffer = await this.compressImage(fileBuffer);
    }

    // Generar nombre �nico
    const filename = this.generateUniqueFilename(originalName);
    
    // Obtener ruta por fecha (a�o/mes)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const relativePath = path.join(String(year), month, filename);
    const fullPath = path.join(this.config.basePath, relativePath);

    // Guardar archivo
    await fs.writeFile(fullPath, processedBuffer);

    // Calcular checksum
    const checksum = this.calculateChecksum(processedBuffer);

    return {
      filename,
      originalName,
      mimeType,
      fileSize: processedBuffer.length,
      filePath: relativePath,
      url: `/api/evidences/files/${relativePath}`,
      checksum,
    };
  }

  /**
   * Descarga un archivo
   * @param {string} filePath - Ruta relativa del archivo
   * @returns {Promise<Buffer>} Buffer del archivo
   */
  async download(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.config.basePath, filePath);
    
    try {
      return await fs.readFile(fullPath);
    } catch {
      throw new Error(`File not found: ${filePath}`);
    }
  }

  /**
   * Elimina un archivo
   * @param {string} filePath - Ruta relativa del archivo
   * @returns {Promise<boolean>} True si se elimin� correctamente
   */
  async delete(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.config.basePath, filePath);
    
    try {
      await this.deleteFromDisk(fullPath);
      return true;
    } catch (error) {
      console.error(`[FileStorageService] Error deleting file: ${filePath}`, error);
      return false;
    }
  }

  /**
   * Verifica si un archivo existe
   * @param {string} filePath - Ruta relativa del archivo
   * @returns {Promise<boolean>} True si existe
   */
  async exists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.config.basePath, filePath);
    
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Comprime una imagen usando Sharp
   * @private
   */
  private async compressImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: this.config.compressionQuality })
      .toBuffer();
  }

  /**
   * Genera un nombre de archivo �nico
   * @private
   */
  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .substring(0, 50);
    
    return `${baseName}-${timestamp}-${random}${ext}`;
  }

  /**
   * Calcula el checksum SHA-256 de un buffer
   * @private
   */
  private calculateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Obtiene el tama�o total de almacenamiento usado
   * @returns {Promise<number>} Tama�o en bytes
   */
  async getStorageSize(): Promise<number> {
    let totalSize = 0;
    
    const calculateDirSize = async (dirPath: string): Promise<number> => {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      let size = 0;

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          size += await calculateDirSize(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          size += stats.size;
        }
      }

      return size;
    };

    try {
      totalSize = await calculateDirSize(this.config.basePath);
    } catch (error) {
      console.error('[FileStorageService] Error calculating storage size', error);
    }

    return totalSize;
  }

  private async deleteFromDisk(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch {
      // Log silencioso, el archivo podría no existir
    }
  }
}

/**
 * Instancia singleton del servicio
 */
export const fileStorageService = new FileStorageService();
