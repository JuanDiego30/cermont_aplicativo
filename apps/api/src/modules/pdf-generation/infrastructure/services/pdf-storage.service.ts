import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs/promises";
import * as path from "path";

@Injectable()
export class PdfStorageService {
  private readonly logger = new Logger(PdfStorageService.name);
  private readonly storageDir: string;
  private readonly cacheTtlSeconds: number;

  constructor(private readonly configService: ConfigService) {
    this.storageDir =
      this.configService.get("PDF_STORAGE_DIR") || "./storage/pdfs";
    const ttlRaw = this.configService.get<string | number>(
      "PDF_CACHE_TTL_SECONDS",
    );
    const parsedTtl = typeof ttlRaw === "number" ? ttlRaw : Number(ttlRaw);
    this.cacheTtlSeconds =
      Number.isFinite(parsedTtl) && parsedTtl > 0 ? parsedTtl : 24 * 60 * 60;
  }

  async onModuleInit() {
    // Crear directorio si no existe
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      this.logger.log(`Directorio de almacenamiento: ${this.storageDir}`);
    } catch (error) {
      this.logger.error("Error creando directorio de storage", error);
    }
  }

  async save(buffer: Buffer, filename: string): Promise<string> {
    try {
      const safeFilename = this.normalizeFilename(filename, {
        ensurePdfExtension: true,
      });
      const filepath = path.join(this.storageDir, safeFilename);
      await fs.writeFile(filepath, buffer);
      this.logger.log(`PDF guardado: ${filepath}`);
      return filepath;
    } catch (error) {
      this.logger.error("Error guardando PDF", error);
      throw error;
    }
  }

  async get(filename: string): Promise<Buffer | null> {
    try {
      const safeFilename = this.normalizeFilename(filename);
      const filepath = path.join(this.storageDir, safeFilename);
      return await fs.readFile(filepath);
    } catch (error) {
      this.logger.warn(`PDF no encontrado: ${filename}`);
      return null;
    }
  }

  /**
   * Recupera un PDF del storage respetando TTL de caché.
   * Si está expirado, se elimina y se retorna null.
   */
  async getCached(
    filename: string,
    ttlSeconds?: number,
  ): Promise<Buffer | null> {
    const safeFilename = this.normalizeFilename(filename);
    const filepath = path.join(this.storageDir, safeFilename);

    const effectiveTtlSeconds =
      typeof ttlSeconds === "number" &&
      Number.isFinite(ttlSeconds) &&
      ttlSeconds > 0
        ? ttlSeconds
        : this.cacheTtlSeconds;

    try {
      const stat = await fs.stat(filepath);
      const ageSeconds = (Date.now() - stat.mtimeMs) / 1000;

      if (ageSeconds > effectiveTtlSeconds) {
        await fs.unlink(filepath).catch(() => undefined);
        this.logger.log(`PDF expirado por TTL y eliminado: ${safeFilename}`);
        return null;
      }

      return await fs.readFile(filepath);
    } catch {
      this.logger.warn(`PDF no encontrado (cache): ${filename}`);
      return null;
    }
  }

  async delete(filename: string): Promise<boolean> {
    try {
      const safeFilename = this.normalizeFilename(filename);
      const filepath = path.join(this.storageDir, safeFilename);
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
      const safeFilename = this.normalizeFilename(filename);
      const filepath = path.join(this.storageDir, safeFilename);
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  getPublicUrl(filename: string): string {
    const safeFilename = this.normalizeFilename(filename);
    const baseUrl = (
      this.configService.get<string>("API_URL") || "http://localhost:3000"
    ).replace(/\/$/, "");
    // Nota: el API tiene globalPrefix = 'api' y el controller está en 'pdf'
    return `${baseUrl}/api/pdf/${encodeURIComponent(safeFilename)}`;
  }

  private normalizeFilename(
    filename: string,
    options?: { ensurePdfExtension?: boolean },
  ): string {
    if (!filename || typeof filename !== "string") {
      throw new BadRequestException("Nombre de archivo inválido");
    }

    const trimmed = filename.trim();
    if (!trimmed) {
      throw new BadRequestException("Nombre de archivo inválido");
    }

    // Evita path traversal: no se permiten separadores de ruta ni cambios por basename
    const base = path.basename(trimmed);
    if (
      base !== trimmed ||
      base.includes("..") ||
      base.includes("/") ||
      base.includes("\\")
    ) {
      throw new BadRequestException("Nombre de archivo no permitido");
    }

    // Restringe caracteres (conservador) para URLs/FS
    // Permitimos letras/números, guiones, guion bajo, punto.
    const safe = base.replace(/[^a-zA-Z0-9._-]/g, "_");

    if (!safe) {
      throw new BadRequestException("Nombre de archivo inválido");
    }

    if (options?.ensurePdfExtension && !safe.toLowerCase().endsWith(".pdf")) {
      return `${safe}.pdf`;
    }

    return safe;
  }
}
