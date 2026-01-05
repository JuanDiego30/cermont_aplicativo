/**
 * @useCase DownloadEvidenciaUseCase
 * @description Downloads the evidencia binary from storage
 */

import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
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

export interface DownloadEvidenciaCommand {
  id: string;
  requestedBy: string;
  requesterRole?: string;
}

export interface DownloadEvidenciaResult {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

@Injectable()
export class DownloadEvidenciaUseCase {
  private readonly logger = new Logger(DownloadEvidenciaUseCase.name);

  constructor(
    @Inject(EVIDENCIA_REPOSITORY)
    private readonly repository: IEvidenciaRepository,
    @Inject(STORAGE_PROVIDER)
    private readonly storage: IStorageProvider,
    @Inject(ORDEN_REPOSITORY)
    private readonly ordenRepository: IOrdenRepository,
  ) {}

  async execute(
    command: DownloadEvidenciaCommand,
  ): Promise<DownloadEvidenciaResult> {
    const { id, requestedBy, requesterRole } = command;

    this.logger.log(`Downloading evidencia: ${id}`, { requestedBy });

    const evidencia = await this.repository.findById(id);
    if (!evidencia) {
      throw new NotFoundException(`Evidencia ${id} not found`);
    }

    // Authorization: requester must be allowed to access the Orden associated with the evidencia.
    // Rule (minimal & conservative):
    // - If requester is the orden creator OR the assigned technician => allow
    // - Admin/Supervisor is handled via creator/assigned in current domain model; if not present, deny
    // Note: extend with a centralized permissions service when available.
    const orden = await this.ordenRepository.findById(evidencia.ordenId);
    if (!orden) {
      // If order is missing, treat as not found to avoid leaking association details.
      throw new NotFoundException("Orden no encontrada");
    }

    // Admin/Supervisor bypass: rely on JWT role when available in command context.
    // This use-case currently only receives userId, so we conservatively allow only creator/assigned.
    // NOTE: controller passes only requestedBy=userId; to support role-based access, extend command.
    const role = requesterRole?.toLowerCase();
    const isPrivileged = role === "admin" || role === "supervisor";
    const canAccess =
      isPrivileged ||
      evidencia.uploadedBy === requestedBy ||
      orden.creadorId === requestedBy ||
      orden.asignadoId === requestedBy;
    if (!canAccess) {
      throw new ForbiddenException("No autorizado");
    }

    const storagePath = evidencia.storagePath.getValue();
    if (!storagePath) {
      throw new BadRequestException("Evidencia has no storage path");
    }

    const exists = await this.storage.exists(storagePath);
    if (!exists) {
      throw new NotFoundException("Evidencia file not found in storage");
    }

    const buffer = await this.storage.download(storagePath);

    const extension = evidencia.mimeType.getExtension();
    const baseName =
      evidencia.originalFilename || `evidencia-${evidencia.id.getValue()}`;
    const filename = baseName.includes(".")
      ? baseName
      : `${baseName}.${extension}`;

    return {
      buffer,
      filename,
      mimeType: evidencia.mimeType.getValue(),
    };
  }
}
