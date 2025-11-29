export interface IFileStorageService {
  /**
   * Sube archivo y retorna identificador o path relativo.
   */
  upload(fileName: string, buffer: Buffer, mimeType: string): Promise<string>;

  download(filePath: string): Promise<Buffer>;

  delete(filePath: string): Promise<void>;

  exists(filePath: string): Promise<boolean>;

  /**
   * Obtiene URL de acceso.
   * Si es privado, debería retornar URL firmada por defecto o aceptar opción.
   */
  getUrl(filePath: string, options?: { expiresIn?: number; public?: boolean }): Promise<string>;
}

