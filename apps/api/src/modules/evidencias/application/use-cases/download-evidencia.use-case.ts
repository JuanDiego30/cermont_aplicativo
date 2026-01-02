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
} from '@nestjs/common';
import {
  IEvidenciaRepository,
  EVIDENCIA_REPOSITORY,
} from '../../domain/repositories';
import {
  IStorageProvider,
  STORAGE_PROVIDER,
} from '../../infrastructure/storage/storage-provider.interface';

export interface DownloadEvidenciaCommand {
  id: string;
  requestedBy: string;
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
  ) {}

  async execute(command: DownloadEvidenciaCommand): Promise<DownloadEvidenciaResult> {
    const { id, requestedBy } = command;

    this.logger.log(`Downloading evidencia: ${id}`, { requestedBy });

    const evidencia = await this.repository.findById(id);
    if (!evidencia) {
      throw new NotFoundException(`Evidencia ${id} not found`);
    }

    const storagePath = evidencia.storagePath.getValue();
    if (!storagePath) {
      throw new BadRequestException('Evidencia has no storage path');
    }

    const exists = await this.storage.exists(storagePath);
    if (!exists) {
      throw new NotFoundException('Evidencia file not found in storage');
    }

    const buffer = await this.storage.download(storagePath);

    const extension = evidencia.mimeType.getExtension();
    const baseName = evidencia.originalFilename || `evidencia-${evidencia.id.getValue()}`;
    const filename = baseName.includes('.') ? baseName : `${baseName}.${extension}`;

    return {
      buffer,
      filename,
      mimeType: evidencia.mimeType.getValue(),
    };
  }
}
