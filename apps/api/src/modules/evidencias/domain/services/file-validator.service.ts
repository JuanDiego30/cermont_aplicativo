/**
 * @domainService FileValidatorService
 * @description Domain service for validating uploaded files
 */

import { FileType } from '../value-objects/file-type.vo';
import { FileSize } from '../value-objects/file-size.vo';
import { MimeType } from '../value-objects/mime-type.vo';
import sanitize from 'sanitize-filename';

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
        'exe', 'bat', 'cmd', 'sh', 'php', 'js', 'vbs', 'ps1', 'jar', 'msi',
    ];

    /**
     * Validate an uploaded file
     * @param file - Multer file object
     */
    public validateFile(file: {
        mimetype: string;
        originalname: string;
        size: number;
    }): FileValidationResult {
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
            errors.push(
                `Extension .${extension} does not match MIME type ${file.mimetype}`,
            );
        }

        // 6. Sanitize filename
        const sanitizedFilename = sanitize(file.originalname);
        if (sanitizedFilename.length === 0) {
            errors.push('Invalid filename after sanitization');
        }

        return {
            isValid: errors.length === 0,
            fileType: fileType || FileType.document(),
            mimeType: mimeType || MimeType.create('application/pdf'),
            fileSize: fileSize || FileSize.create(file.size, FileType.document()),
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
}
