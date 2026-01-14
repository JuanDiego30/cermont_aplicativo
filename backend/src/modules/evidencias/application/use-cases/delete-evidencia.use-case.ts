/**
 * @useCase DeleteEvidenciaUseCase
 * @description Handles soft deletion of evidencias
 */

import { Injectable, Inject, Logger, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  IEvidenciaRepository,
  EVIDENCIA_REPOSITORY,
} from "../../domain/repositories";
import { DeleteEvidenciaResponse } from "../dto";

@Injectable()
export class DeleteEvidenciaUseCase {
  private readonly logger = new Logger(DeleteEvidenciaUseCase.name);

  constructor(
    @Inject(EVIDENCIA_REPOSITORY)
    private readonly repository: IEvidenciaRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: string,
    deletedBy: string,
    permanent: boolean = false,
  ): Promise<DeleteEvidenciaResponse> {
    this.logger.log(`Deleting evidencia: ${id}`, { permanent, deletedBy });

    const evidencia = await this.repository.findById(id);

    if (!evidencia) {
      this.logger.warn(`Evidencia not found: ${id}`);
      throw new NotFoundException(`Evidencia ${id} not found`);
    }

    try {
      if (permanent) {
        // Permanent delete - also emit event for storage cleanup
        await this.repository.permanentDelete(id);

        const extraThumbnailPaths: string[] = [];
        const thumbs = evidencia.metadata?.thumbnails;
        if (thumbs?.s150) extraThumbnailPaths.push(thumbs.s150);
        if (thumbs?.s300) extraThumbnailPaths.push(thumbs.s300);

        this.eventEmitter.emit("evidencia.deleted", {
          evidenciaId: id,
          filePath: evidencia.storagePath.getValue(),
          thumbnailPath: evidencia.thumbnailPath?.getValue(),
          extraThumbnailPaths,
          deletedBy,
          isSoftDelete: false,
        });
        this.logger.log(`Evidencia permanently deleted: ${id}`);
        return {
          success: true,
          message: "Evidencia eliminada permanentemente",
        };
      } else {
        // Soft delete
        evidencia.softDelete(deletedBy);
        await this.repository.save(evidencia);

        const events = evidencia.pullDomainEvents();
        for (const event of events) {
          this.eventEmitter.emit(event.eventName, event);
        }

        this.logger.log(`Evidencia soft deleted: ${id}`);
        return { success: true, message: "Evidencia movida a papelera" };
      }
    } catch (error) {
      this.logger.error("Delete failed", {
        id,
        error: (error as Error).message,
      });
      throw error;
    }
  }
}
