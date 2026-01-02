/**
 * @valueObject FileSize
 * @description Value Object for file size with validation against type-specific limits
 */

import { FileType } from './file-type.vo';

export class FileSize {
    // Regla 22: Máximo 50MB por archivo
    private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    private constructor(
        private readonly _bytes: number,
        private readonly _fileType: FileType,
    ) {
        Object.freeze(this);
    }

    public static create(bytes: number, fileType: FileType): FileSize {
        FileSize.validate(bytes, fileType);
        return new FileSize(bytes, fileType);
    }

    private static validate(bytes: number, fileType: FileType): void {
        if (bytes <= 0) {
            throw new Error('File size must be positive');
        }

        const maxSize = FileSize.getMaxSizeForType(fileType);
        if (bytes > maxSize) {
            throw new Error(
                `File size ${FileSize.formatBytes(bytes)} exceeds limit of ${FileSize.formatBytes(maxSize)} for ${fileType.getValue()} files`,
            );
        }
    }

    private static getMaxSizeForType(fileType: FileType): number {
        void fileType;
        return FileSize.MAX_FILE_SIZE;
    }

    private static formatBytes(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    public getBytes(): number {
        return this._bytes;
    }

    public getKilobytes(): number {
        return this._bytes / 1024;
    }

    public getMegabytes(): number {
        return this._bytes / (1024 * 1024);
    }

    public format(): string {
        return FileSize.formatBytes(this._bytes);
    }

    public isWithinLimit(): boolean {
        const maxSize = FileSize.getMaxSizeForType(this._fileType);
        return this._bytes <= maxSize;
    }

    public equals(other: FileSize): boolean {
        return this._bytes === other._bytes;
    }
}
