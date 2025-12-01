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
import { fileTypeFromBuffer } from 'file-type';
import sanitize from 'sanitize-filename';

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

// Magic bytes signatures for file type validation
// Previene que usuarios suban archivos maliciosos con extensiones falsas
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/jpg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'video/mp4': [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp at offset 4
    [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70], // ftyp variant
    [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], // ftyp variant
  ],
  'video/quicktime': [[0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74]],
};

// Dangerous file patterns that should never be allowed
const DANGEROUS_PATTERNS = [
  /\.exe$/i,
  /\.dll$/i,
  /\.bat$/i,
  /\.cmd$/i,
  /\.ps1$/i,
  /\.sh$/i,
  /\.php$/i,
  /\.jsp$/i,
  /\.asp$/i,
  /\.aspx$/i,
  /\.(html?|js|svg)$/i, // Can contain XSS
];

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
    await this.validateFile(fileBuffer, mimeType, originalName);

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

  /**
   * Valida un archivo de forma robusta:
   * 1. Verifica tamaño máximo
   * 2. Verifica MIME type permitido
   * 3. Valida magic bytes usando file-type
   * 4. Bloquea extensiones peligrosas
   */
  private async validateFile(buffer: Buffer, mimeType: string, originalName?: string): Promise<void> {
    // 1. Validar tamaño
    if (buffer.length > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed: ${(this.config.maxFileSize / 1024 / 1024).toFixed(2)} MB`);
    }

    // 2. Validar MIME type declarado
    if (!this.config.allowedMimeTypes.includes(mimeType)) {
      throw new Error(`File type not allowed: ${mimeType}`);
    }

    // 3. Validar extensión contra patrones peligrosos
    if (originalName) {
      const isDangerous = DANGEROUS_PATTERNS.some(pattern => pattern.test(originalName));
      if (isDangerous) {
        throw new Error('Dangerous file type detected');
      }
    }

    // 4. Validar magic bytes real usando file-type
    const type = await fileTypeFromBuffer(buffer);
    if (!type) {
      // Si file-type no lo reconoce, pero nosotros permitimos ciertos tipos que file-type podría no cubrir (raro),
      // podríamos fallar o advertir. Para seguridad estricta, fallamos.
      throw new Error(`Could not determine file type from content.`);
    }

    if (type.mime !== mimeType) {
      // Permitir discrepancias menores si son seguros (ej: jpg vs jpeg)
      const isImage = type.mime.startsWith('image/') && mimeType.startsWith('image/');
      if (!isImage) {
        throw new Error(`File content (${type.mime}) does not match declared type (${mimeType})`);
      }
    }

    if (!this.config.allowedMimeTypes.includes(type.mime)) {
      throw new Error(`Detected file type not allowed: ${type.mime}`);
    }
  }

  /**
   * Verifica que los primeros bytes del archivo coincidan con el tipo declarado
   * Previene ataques donde se sube un .exe disfrazado de .jpg
   */
  private validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
    const signatures = MAGIC_BYTES[mimeType];

    // Si no tenemos firma definida, aceptamos (pero ya pasó la validación de MIME type)
    if (!signatures) {
      return true;
    }

    // Verificar si alguna de las firmas coincide
    return signatures.some(signature => {
      if (buffer.length < signature.length) {
        return false;
      }

      return signature.every((byte, index) => buffer[index] === byte);
    });
  }

  private getDatePathInfo(filename: string = '') {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const relativePath = path.join(year, month);
    const fullPath = path.join(this.config.basePath, relativePath, filename);

    return { relativePath, fullPath };
  }

  /**
   * Genera un nombre único y sanitizado con timestamp y sufijo aleatorio
   */
  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).slice(2, 10);
    const sanitized = sanitize(originalName);
    const ext = path.extname(sanitized);
    const name = path.basename(sanitized, ext) || 'file';

    return `${name}-${timestamp}-${randomStr}${ext}`;
  }

  /**
   * Calcula checksum SHA-256 del buffer almacenado
   */
  private calculateChecksum(buffer: Buffer): string {
    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    return hash.digest('hex');
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

