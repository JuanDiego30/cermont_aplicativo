/**
 * @useCase LogoutUseCase
 * @description Caso de uso para cerrar sesión
 * @layer Application
 */
import { Injectable, Inject } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AUTH_REPOSITORY, IAuthRepository } from "../../domain/repositories";
import { UserLoggedOutEvent } from "../../domain/events";
import { LogoutResponse } from "../dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { Logger } from "@nestjs/common";
import { AUTH_CONSTANTS } from "../../auth.constants";

@Injectable()
export class LogoutUseCase {
  private readonly logger = new Logger(LogoutUseCase.name);

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async execute(
    userId: string,
    refreshToken?: string,
    ip?: string,
    accessTokenJti?: string,
    accessTokenExp?: number,
  ): Promise<LogoutResponse> {
    // 1. Revocar refresh token si existe
    if (refreshToken) {
      await this.authRepository.revokeSession(refreshToken);
    }

    // Regla 4: invalidar access token (jti) hasta su expiración
    if (accessTokenJti) {
      const ttlMs =
        typeof accessTokenExp === "number"
          ? Math.max(0, accessTokenExp * 1000 - Date.now())
          : 15 * 60 * 1000;

      const cacheKey = `${AUTH_CONSTANTS.JWT_REVOKED_JTI_CACHE_KEY_PREFIX}${accessTokenJti}`;
      await this.cache.set(cacheKey, true, ttlMs);
    }

    // Audit log
    try {
      await this.authRepository.createAuditLog({
        userId,
        action: "LOGOUT",
        ip,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `No se pudo registrar audit log de logout: ${errorMessage}`,
      );
    }

    // 2. Emitir evento
    this.eventEmitter.emit(
      "auth.user.logged-out",
      new UserLoggedOutEvent(userId, ip),
    );

    return {
      message: "Sesión cerrada exitosamente",
    };
  }
}
