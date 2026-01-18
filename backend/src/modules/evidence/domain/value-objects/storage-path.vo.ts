/**
 * @valueObject StoragePath
 * @description Value Object for file storage paths with sanitization
 */

import sanitize from 'sanitize-filename';

export class StoragePath {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  /**
   * Create a StoragePath from a raw path, sanitizing unsafe characters
   */
  public static create(value: string): StoragePath {
    if (!value || value.trim().length === 0) {
      throw new Error('Storage path cannot be empty');
    }

    // Normalize separators to forward slashes
    const normalized = value.replace(/\\/g, '/');

    // Validate no directory traversal
    if (normalized.includes('..')) {
      throw new Error('Storage path cannot contain directory traversal (..)');
    }

    return new StoragePath(normalized);
  }

  /**
   * Generate a storage path for an evidencia file
   */
  public static generate(params: {
    contextType: string;
    contextId: string;
    filename: string;
    uniqueId: string;
  }): StoragePath {
    const { contextType, contextId, filename, uniqueId } = params;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const sanitizedFilename = sanitize(filename);
    const path = `evidencias/${contextType}/${contextId}/${year}/${month}/${uniqueId}-${sanitizedFilename}`;

    return StoragePath.create(path);
  }

  /**
   * Generate thumbnail path from a file path
   */
  public generateThumbnailPath(): StoragePath {
    const parts = this._value.split('/');
    const filename = parts.pop() || '';
    const directory = parts.join('/');

    const extIndex = filename.lastIndexOf('.');
    const name = extIndex > 0 ? filename.substring(0, extIndex) : filename;
    const ext = extIndex > 0 ? filename.substring(extIndex) : '';

    const thumbnailFilename = `${name}-thumb${ext || '.jpg'}`;
    return StoragePath.create(`${directory}/thumbnails/${thumbnailFilename}`);
  }

  public getValue(): string {
    return this._value;
  }

  public getDirectory(): string {
    const lastSlash = this._value.lastIndexOf('/');
    return lastSlash > 0 ? this._value.substring(0, lastSlash) : '';
  }

  public getFilename(): string {
    const lastSlash = this._value.lastIndexOf('/');
    return lastSlash >= 0 ? this._value.substring(lastSlash + 1) : this._value;
  }

  public getExtension(): string {
    const filename = this.getFilename();
    const dotIndex = filename.lastIndexOf('.');
    return dotIndex > 0 ? filename.substring(dotIndex + 1) : '';
  }

  public equals(other: StoragePath): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
