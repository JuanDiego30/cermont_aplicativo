/**
 * @domainService FileValidatorService
 * @description Domain service for validating uploaded files
 */

import sanitize from 'sanitize-filename';
import { FileSize } from '../value-objects/file-size.vo';
import { FileType } from '../value-objects/file-type.vo';
import { MimeType } from '../value-objects/mime-type.vo';

export interface FileValidationResult {
  isValid: boolean;
  fileType: FileType;
  mimeType: MimeType;
  fileSize: FileSize;
  sanitizedFilename: string;
  errors: string[];
}

export class FileValidatorService {
  private static readonly DANGEROUS_EXTENSIONS = [
    'exe',
    'bat',
    'cmd',
    'sh',
    'php',
    'js',
    'vbs',
    'ps1',
    'jar',
    'msi',
  ];

  // Some formats can be container-based and may be detected generically by magic bytes
  // (e.g., docx/xlsx are ZIP containers). We allow these as "inconclusive".
  private static readonly CONTENT_SNIFF_INCONCLUSIVE_MIMES = new Set([
    'application/zip',
    'application/octet-stream',
  ]);

  /**
   * Validate an uploaded file
   * @param file - Multer file object
   */
  public async validateFile(file: {
    mimetype: string;
    originalname: string;
    size: number;
    buffer?: Buffer;
  }): Promise<FileValidationResult> {
    const errors: string[] = [];
    let fileType: FileType | undefined;
    let mimeType: MimeType | undefined;
    let fileSize: FileSize | undefined;

    // 1. Validate MIME type
    try {
      mimeType = MimeType.create(file.mimetype);
    } catch (error) {
      errors.push(`Invalid MIME type: ${file.mimetype}`);
    }

    // 2. Derive FileType from MIME
    if (mimeType) {
      try {
        fileType = FileType.fromMimeType(file.mimetype);
      } catch (error) {
        errors.push(`Unsupported file type for: ${file.mimetype}`);
      }
    }

    // 3. Validate file size
    if (fileType) {
      try {
        fileSize = FileSize.create(file.size, fileType);
      } catch (error) {
        errors.push((error as Error).message);
      }
    }

    // 4. Validate extension
    const extension = this.getExtension(file.originalname).toLowerCase();
    if (FileValidatorService.DANGEROUS_EXTENSIONS.includes(extension)) {
      errors.push(`Dangerous file extension: .${extension}`);
    }

    // 5. Validate extension matches MIME type
    if (mimeType && !this.extensionMatchesMime(extension, mimeType)) {
      errors.push(`Extension .${extension} does not match MIME type ${file.mimetype}`);
    }

    // 6. Sanitize filename
    const sanitizedFilename = sanitize(file.originalname);
    if (sanitizedFilename.length === 0) {
      errors.push('Invalid filename after sanitization');
    }

    // 7. Deep validation (magic bytes) - optional but recommended
    if (file.buffer && file.buffer.length > 0 && mimeType) {
      const head = file.buffer.subarray(0, Math.min(file.buffer.length, 64));
      const detectedMime = this.detectMimeFromMagicBytes(head);

      if (
        detectedMime &&
        !FileValidatorService.CONTENT_SNIFF_INCONCLUSIVE_MIMES.has(detectedMime)
      ) {
        // If detected is not even supported, reject early.
        try {
          MimeType.create(detectedMime);
        } catch {
          errors.push(`File content type is not supported: ${detectedMime}`);
        }

        const expectedMime = mimeType.getValue().toLowerCase();
        const equivalents: Record<string, string[]> = {
          'image/jpeg': ['image/jpeg', 'image/jpg'],
          'image/jpg': ['image/jpeg', 'image/jpg'],
          'audio/mpeg': ['audio/mpeg', 'audio/mp3'],
          'audio/mp3': ['audio/mpeg', 'audio/mp3'],
        };

        const allowedDetected = equivalents[expectedMime] || [expectedMime];
        if (!allowedDetected.includes(detectedMime)) {
          errors.push(
            `File content (${detectedMime}) does not match declared MIME (${expectedMime})`
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      fileType: fileType ?? FileType.document(),
      mimeType: mimeType ?? MimeType.create('application/pdf'),
      fileSize:
        fileSize ??
        // Safe fallback that will not throw and will never be used when invalid
        FileSize.create(1, FileType.document()),
      sanitizedFilename,
      errors,
    };
  }

  private getExtension(filename: string): string {
    const dotIndex = filename.lastIndexOf('.');
    return dotIndex > 0 ? filename.substring(dotIndex + 1) : '';
  }

  private extensionMatchesMime(extension: string, mimeType: MimeType): boolean {
    const expectedExtension = mimeType.getExtension();

    // Allow some flexibility (e.g., jpeg/jpg)
    const equivalents: Record<string, string[]> = {
      jpg: ['jpeg', 'jpg'],
      jpeg: ['jpeg', 'jpg'],
      mp3: ['mp3', 'mpeg'],
    };

    const allowed = equivalents[expectedExtension] || [expectedExtension];
    return allowed.includes(extension.toLowerCase());
  }

  private detectMimeFromMagicBytes(head: Buffer): string | undefined {
    // PDF
    if (head.length >= 5 && head.subarray(0, 5).toString('utf8') === '%PDF-') {
      return 'application/pdf';
    }

    // PNG
    if (
      head.length >= 8 &&
      head[0] === 0x89 &&
      head[1] === 0x50 &&
      head[2] === 0x4e &&
      head[3] === 0x47 &&
      head[4] === 0x0d &&
      head[5] === 0x0a &&
      head[6] === 0x1a &&
      head[7] === 0x0a
    ) {
      return 'image/png';
    }

    // JPEG
    if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) {
      return 'image/jpeg';
    }

    // GIF (GIF87a / GIF89a)
    if (
      head.length >= 6 &&
      (head.subarray(0, 6).toString('ascii') === 'GIF87a' ||
        head.subarray(0, 6).toString('ascii') === 'GIF89a')
    ) {
      return 'image/gif';
    }

    return undefined;
  }
}
