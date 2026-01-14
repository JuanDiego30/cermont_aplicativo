/**
 * @useCase ProcessEvidenciaUseCase
 * @description Handles asynchronous processing (thumbnails, metadata extraction)
 */

import { Injectable, Inject, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import {
  IEvidenciaRepository,
  EVIDENCIA_REPOSITORY,
} from "../../domain/repositories";
import { EvidenciaUploadedEvent } from "../../domain/events";
import {
  IImageProcessor,
  IMAGE_PROCESSOR,
} from "../../infrastructure/processing/image-processor.interface";

@Injectable()
export class ProcessEvidenciaUseCase {
  private readonly logger = new Logger(ProcessEvidenciaUseCase.name);

  constructor(
    @Inject(EVIDENCIA_REPOSITORY)
    private readonly repository: IEvidenciaRepository,
    @Inject(IMAGE_PROCESSOR)
    private readonly imageProcessor: IImageProcessor,
  ) {}

  @OnEvent("evidencia.uploaded")
  async handleEvidenciaUploaded(event: EvidenciaUploadedEvent): Promise<void> {
    const { evidenciaId, fileType, requiresProcessing } = event.payload;
    const startTime = Date.now();

    this.logger.log(`Processing evidencia: ${evidenciaId}`, { fileType });

    if (!requiresProcessing) {
      // Mark as ready immediately for non-processable files
      await this.markAsReady(evidenciaId, startTime);
      return;
    }

    try {
      const evidencia = await this.repository.findById(evidenciaId);
      if (!evidencia) {
        this.logger.warn(`Evidencia not found for processing: ${evidenciaId}`);
        return;
      }

      evidencia.markAsProcessing();
      await this.repository.save(evidencia);

      let thumbnailPath: string | undefined;
      let metadata: Record<string, unknown> | undefined;

      // Process based on file type
      if (evidencia.isImage()) {
        const result = await this.imageProcessor.processImage(
          evidencia.storagePath.getValue(),
        );
        thumbnailPath = result.thumbnailPath;
        metadata = result.metadata;
      }
      // Video processing would go here (stub for now)

      // Mark as ready
      await this.markAsReady(evidenciaId, startTime, thumbnailPath, metadata);
    } catch (error) {
      this.logger.error(`Processing failed for ${evidenciaId}`, {
        error: (error as Error).message,
      });
      await this.markAsFailed(evidenciaId);
    }
  }

  private async markAsReady(
    evidenciaId: string,
    startTime: number,
    thumbnailPath?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const evidencia = await this.repository.findById(evidenciaId);
    if (!evidencia) return;

    evidencia.markAsReady({
      thumbnailPath,
      metadata: metadata as Record<string, unknown> | undefined,
      processingDurationMs: Date.now() - startTime,
    });

    await this.repository.save(evidencia);
    this.logger.log(`Evidencia ready: ${evidenciaId}`);
  }

  private async markAsFailed(evidenciaId: string): Promise<void> {
    const evidencia = await this.repository.findById(evidenciaId);
    if (!evidencia) return;

    evidencia.markAsFailed();
    await this.repository.save(evidencia);
  }
}
