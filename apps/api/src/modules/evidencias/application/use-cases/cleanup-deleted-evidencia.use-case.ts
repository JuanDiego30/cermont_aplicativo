import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  IStorageProvider,
  STORAGE_PROVIDER,
} from '../../infrastructure/storage/storage-provider.interface';

export interface EvidenciaDeletedPayload {
  evidenciaId: string;
  filePath?: string;
  thumbnailPath?: string;
  extraThumbnailPaths?: string[];
  deletedBy?: string;
  isSoftDelete?: boolean;
}

@Injectable()
export class CleanupDeletedEvidenciaUseCase {
  private readonly logger = new Logger(CleanupDeletedEvidenciaUseCase.name);

  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storage: IStorageProvider,
  ) {}

  @OnEvent('evidencia.deleted')
  async handle(event: { evidenciaId?: string } & EvidenciaDeletedPayload): Promise<void> {
    // Regla 30: borrar archivo físico (en permanent delete)
    if (event.isSoftDelete) {
      return;
    }

    const toDelete = [event.filePath, event.thumbnailPath, ...(event.extraThumbnailPaths ?? [])]
      .filter(Boolean) as string[];

    for (const p of toDelete) {
      try {
        await this.storage.delete(p);
      } catch (error) {
        this.logger.warn('Failed to delete file from storage', {
          evidenciaId: event.evidenciaId,
          path: p,
          error: (error as Error).message,
        });
      }
    }

    this.logger.log('Storage cleanup completed', {
      evidenciaId: event.evidenciaId,
      count: toDelete.length,
    });
  }
}
