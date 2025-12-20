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

@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(EventEmitter2)
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async execute(refreshToken: string, context: AuthContext): Promise<TokenResponse> {
    try {
      // 1. Buscar sesión por token
      const session = await this.authRepository.findSessionByToken(refreshToken);

      if (!session) {
        this.logger.warn(`Refresh attempt failed: Invalid token ${refreshToken.substring(0, 10)}...`);
        throw new UnauthorizedException('Refresh token inválido');
      }

      // 2. Verificar si está revocado (posible reutilización)
      if (session.isRevoked) {
        this.logger.warn(`Refresh attempt blocked: Token reused (Family ${session.family})`);
        // Revocar toda la familia (seguridad ante robo de token)
        await this.authRepository.revokeSessionFamily(session.family);
        throw new UnauthorizedException('Token reutilizado detectado');
      }

      // 3. Verificar expiración
      if (session.isExpired) {
        this.logger.debug(`Refresh token expired`);
        throw new UnauthorizedException('Refresh token expirado');
      }

      // 4. Revocar token actual
      await this.authRepository.revokeSession(refreshToken);

      // 5. Buscar usuario
      const user = await this.authRepository.findUserById(session.userId);

      if (!user || !user.active) {
        throw new UnauthorizedException('Usuario no encontrado o inactivo');
      }

      // 6. Generar nuevo access token
      const newAccessToken = this.jwtService.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // 7. Crear nueva sesión (rotación de token)
      const newSession = session.rotate(context.ip, context.userAgent);
      await this.authRepository.createSession(newSession);

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
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`Unexpected error during refresh token execution: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Error procesando la solicitud de refresh');
    }
  }
}
