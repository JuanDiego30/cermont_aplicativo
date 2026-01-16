import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  DownloadEvidenciaUseCase,
  DownloadEvidenciaResult,
} from "./download-evidencia.use-case";

export interface DownloadEvidenciaByTokenCommand {
  token: string;
}

interface EvidenciaDownloadTokenPayload {
  typ?: string;
  evidenciaId?: string;
  requestedBy?: string;
  role?: string;
}

@Injectable()
export class DownloadEvidenciaByTokenUseCase {
  private readonly logger = new Logger(DownloadEvidenciaByTokenUseCase.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly downloadUseCase: DownloadEvidenciaUseCase,
  ) {}

  async execute(
    command: DownloadEvidenciaByTokenCommand,
  ): Promise<DownloadEvidenciaResult> {
    const { token } = command;

    let payload: EvidenciaDownloadTokenPayload;
    try {
      payload = this.jwtService.verify(token) as EvidenciaDownloadTokenPayload;
    } catch (error) {
      this.logger.warn("Invalid download token", {
        error: (error as Error).message,
      });
      throw new BadRequestException("Token inválido o expirado");
    }

    if (payload?.typ !== "evidencia_download") {
      throw new BadRequestException("Token inválido");
    }
    if (!payload.evidenciaId || !payload.requestedBy) {
      throw new BadRequestException("Token inválido");
    }

    return this.downloadUseCase.execute({
      id: payload.evidenciaId,
      requestedBy: payload.requestedBy,
      requesterRole: payload.role,
    });
  }
}
