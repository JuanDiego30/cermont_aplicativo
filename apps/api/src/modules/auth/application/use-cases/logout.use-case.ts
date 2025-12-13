/**
 * @useCase LogoutUseCase
 * @description Caso de uso para cerrar sesión
 * @layer Application
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/repositories';
import { UserLoggedOutEvent } from '../../domain/events';
import { LogoutResponse } from '../dto';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    userId: string,
    refreshToken?: string,
    ip?: string,
  ): Promise<LogoutResponse> {
    // 1. Revocar refresh token si existe
    if (refreshToken) {
      await this.authRepository.revokeSession(refreshToken);
    }

    // 2. Emitir evento
    this.eventEmitter.emit(
      'auth.user.logged-out',
      new UserLoggedOutEvent(userId, ip),
    );

    return {
      message: 'Sesión cerrada exitosamente',
    };
  }
}
