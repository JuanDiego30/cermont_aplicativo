/**
 * @useCase UploadEvidenciaUseCase
 * @description Handles file upload, validation, and domain event emission
 */

import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { createHash } from "crypto";
import { Evidencia } from "../../domain/entities";
import { FileValidatorService } from "../../domain/services";
import {
  IEvidenciaRepository,
  EVIDENCIA_REPOSITORY,
} from "../../domain/repositories";
import {
  IStorageProvider,
  STORAGE_PROVIDER,
} from "../../infrastructure/storage/storage-provider.interface";
import {
  ORDEN_REPOSITORY,
  IOrdenRepository,
} from "../../../ordenes/domain/repositories";
import { EvidenciaMapper } from "../mappers";
import { UploadEvidenciaDto, EvidenciaResponse } from "../dto";

export interface UploadEvidenciaCommand {
  file: Express.Multer.File;
  dto: UploadEvidenciaDto;
  uploadedBy: string;
  uploaderRole?: string;
}

export interface UploadEvidenciaResult {
  success: boolean;
  evidencia?: EvidenciaResponse;
  errors?: string[];
}

@Injectable()
export class UploadEvidenciaUseCase {
  private readonly logger = new Logger(UploadEvidenciaUseCase.name);

  constructor(
    @Inject(EVIDENCIA_REPOSITORY)
    private readonly repository: IEvidenciaRepository,
    @Inject(STORAGE_PROVIDER)
    private readonly storage: IStorageProvider,
    @Inject(ORDEN_REPOSITORY)
    private readonly ordenRepository: IOrdenRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly fileValidator: FileValidatorService,
  ) {}

  async execute(
    command: UploadEvidenciaCommand,
  ): Promise<UploadEvidenciaResult> {
    const { file, dto, uploadedBy, uploaderRole } = command;

    this.logger.log(`Uploading evidencia for orden ${dto.ordenId}`, {
      size: file.size,
      mimeType: file.mimetype,
    });

    try {
      // 0. Validate required link: Orden must exist
      const orden = await this.ordenRepository.findById(dto.ordenId);
      if (!orden) {
        throw new NotFoundException("Orden no encontrada");
      }

      const role = uploaderRole?.toLowerCase();
      const isPrivileged = role === "admin" || role === "supervisor";
      const canUpload =
        isPrivileged ||
        orden.creadorId === uploadedBy ||
        orden.asignadoId === uploadedBy;
      if (!canUpload) {
        throw new ForbiddenException("No autorizado");
      }

      // 1. Validate file
      const validation = await this.fileValidator.validateFile({
        mimetype: file.mimetype,
        originalname: file.originalname,
        size: file.size,
        buffer: file.buffer,
      });
      if (!validation.isValid) {
        this.logger.warn("File validation failed", {
          errors: validation.errors,
        });
        return { success: false, errors: validation.errors };
      }

      // 1.1 Validate declared tipo matches detected content (if provided)
      if (dto.tipo && validation.fileType.toSpanish() !== dto.tipo) {
        return {
          success: false,
          errors: [
            `Tipo declarado (${dto.tipo}) no coincide con el tipo detectado (${validation.fileType.toSpanish()})`,
          ],
        };
      }

      // 2. Create domain entity
      const sha256 = file.buffer
        ? createHash("sha256").update(file.buffer).digest("hex")
        : undefined;

      const evidencia = Evidencia.create({
        ejecucionId: dto.ejecucionId || "",
        ordenId: dto.ordenId,
        mimeType: file.mimetype,
        originalFilename: validation.sanitizedFilename,
        fileBytes: file.size,
        descripcion: dto.descripcion,
        tags: dto.tags
          ? dto.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        uploadedBy,
        sha256,
      });

      // 3. Upload to storage
      await this.storage.upload(file.buffer, evidencia.storagePath.getValue());
      this.logger.log("File uploaded", {
        evidenciaId: evidencia.id.getValue(),
        size: file.size,
      });

      // 4. Save to repository
      const saved = await this.repository.save(evidencia);

      // 5. Emit domain events (for async processing)
      const events = saved.pullDomainEvents();
      for (const event of events) {
        this.eventEmitter.emit(event.eventName, event);
        this.logger.debug(`Emitted event: ${event.eventName}`);
      }

      this.logger.log(`Evidencia created: ${saved.id.getValue()}`);

      return {
        success: true,
        evidencia: EvidenciaMapper.toResponse(saved),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, errors: [(error as Error).message] };
      }
      this.logger.error("Upload failed", {
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
      return {
        success: false,
        errors: [(error as Error).message],
      };
    }
  }
}
