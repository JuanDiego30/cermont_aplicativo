/**
 * @interface IStorageProvider
 * @description Abstraction for file storage (local, S3, etc.)
 */

export interface UploadResult {
  path: string;
  url: string;
  size: number;
}

export interface IStorageProvider {
  /**
   * Upload a file to storage
   */
  upload(buffer: Buffer, path: string): Promise<UploadResult>;

  /**
   * Download a file from storage
   */
  download(path: string): Promise<Buffer>;

  /**
   * Delete a file from storage
   */
  delete(path: string): Promise<void>;

  /**
   * Check if file exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Get a public or signed URL for the file
   */
  getUrl(path: string, expiresInSeconds?: number): Promise<string>;
}

/**
 * Token for dependency injection
 */
export const STORAGE_PROVIDER = Symbol("IStorageProvider");
