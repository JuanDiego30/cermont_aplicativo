/**
 * @useCase RefreshTokenUseCase
 * @description Caso de uso para refrescar el access token
 * @layer Application
 */
import { Injectable, Inject, UnauthorizedException, Logger, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/repositories';
import { TokenRefreshedEvent } from '../../domain/events';
import { TokenResponse, AuthContext } from '../dto';
import { BaseAuthUseCase } from './base-auth.use-case';

@Injectable()
export class RefreshTokenUseCase extends BaseAuthUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(JwtService)
    jwtService: JwtService,
    @Inject(EventEmitter2)
    private readonly eventEmitter: EventEmitter2,
  ) {
    super(jwtService);
  }

  async execute(refreshToken: string, context: AuthContext): Promise<TokenResponse> {
    try {
      // 1. Buscar sesión por token
      const session = await this.authRepository.findSessionByToken(refreshToken);

      if (!session) {
        this.logger.warn('Refresh attempt failed: invalid token');
        throw new UnauthorizedException('No autorizado');
      }

      // 2. Verificar si está revocado (posible reutilización)
      if (session.isRevoked) {
        this.logger.warn(`Refresh attempt blocked: Token reused (Family ${session.family})`);
        // Revocar toda la familia (seguridad ante robo de token)
        await this.authRepository.revokeSessionFamily(session.family);
        throw new UnauthorizedException('No autorizado');
      }

      // 3. Verificar expiración
      if (session.isExpired) {
        this.logger.debug(`Refresh token expired`);
        throw new UnauthorizedException('No autorizado');
      }

      // 4. Revocar token actual
      await this.authRepository.revokeSession(refreshToken);

      // 5. Buscar usuario
      const user = await this.authRepository.findUserById(session.userId);

      if (!user || !user.active) {
        throw new UnauthorizedException('No autorizado');
      }

      // 6. Generar nuevo access token
        const emailValue = typeof (user as any).email === 'string' ? (user as any).email : user.email.getValue();
      const newAccessToken = this.signAccessToken({
        id: user.id,
          email: emailValue,
        role: user.role,
      });

      // 7. Crear nueva sesión (rotación de token)
      const newSession = session.rotate(context.ip, context.userAgent);
      await this.authRepository.createSession(newSession);

      // Audit log
      try {
        await this.authRepository.createAuditLog({
          userId: session.userId,
          action: 'REFRESH',
          ip: context.ip,
          userAgent: context.userAgent,
        });
      } catch {
        // no-op
      }

      // 8. Emitir evento
      this.eventEmitter.emit(
        'auth.token.refreshed',
        new TokenRefreshedEvent(
          session.userId,
          session.id,
          context.ip,
          context.userAgent,
        ),
      );

      return {
        token: newAccessToken,
        refreshToken: newSession.refreshToken,
      };
    } catch (error) {
      if (this.isHttpExceptionLike(error)) throw error as any;
      const err = error as Error;
      this.logger.error(`Unexpected error during refresh token execution: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Error procesando la solicitud de refresh');
    }
  }
}
