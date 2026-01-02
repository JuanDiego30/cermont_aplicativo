import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  IEvidenciaRepository,
  EVIDENCIA_REPOSITORY,
} from '../../domain/repositories';
import {
  ORDEN_REPOSITORY,
  IOrdenRepository,
} from '../../../ordenes/domain/repositories';

export interface GenerateEvidenciaDownloadTokenCommand {
  id: string;
  requestedBy: string;
  requesterRole?: string;
}

export interface GenerateEvidenciaDownloadTokenResult {
  token: string;
  url: string;
  expiresInSeconds: number;
}

@Injectable()
export class GenerateEvidenciaDownloadTokenUseCase {
  private readonly logger = new Logger(GenerateEvidenciaDownloadTokenUseCase.name);

  constructor(
    @Inject(EVIDENCIA_REPOSITORY)
    private readonly repository: IEvidenciaRepository,
    @Inject(ORDEN_REPOSITORY)
    private readonly ordenRepository: IOrdenRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async execute(
    command: GenerateEvidenciaDownloadTokenCommand,
  ): Promise<GenerateEvidenciaDownloadTokenResult> {
    const { id, requestedBy, requesterRole } = command;

    const evidencia = await this.repository.findById(id);
    if (!evidencia) {
      throw new NotFoundException(`Evidencia ${id} not found`);
    }

    const orden = await this.ordenRepository.findById(evidencia.ordenId);
    if (!orden) {
      throw new NotFoundException('Orden no encontrada');
    }

    const role = requesterRole?.toLowerCase();
    const isPrivileged = role === 'admin' || role === 'supervisor';
    const canAccess =
      isPrivileged ||
      evidencia.uploadedBy === requestedBy ||
      orden.creadorId === requestedBy ||
      orden.asignadoId === requestedBy;
    if (!canAccess) {
      throw new ForbiddenException('No autorizado');
    }

    const expiresInSeconds = 60 * 60; // 1h (Regla 27)

    const token = this.jwtService.sign(
      {
        typ: 'evidencia_download',
        evidenciaId: id,
        requestedBy,
        role: requesterRole,
      },
      { expiresIn: expiresInSeconds },
    );

    const baseUrl = this.config.get<string>('BASE_URL', 'http://localhost:3001');
    const url = `${baseUrl}/evidencias/download/${token}`;

    this.logger.debug('Generated temporary download token', {
      evidenciaId: id,
      requestedBy,
      expiresInSeconds,
    });

    return { token, url, expiresInSeconds };
  }
}
