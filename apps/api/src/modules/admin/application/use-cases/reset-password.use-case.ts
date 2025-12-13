/**
 * @usecase ResetPasswordUseCase
 * 
 * Resetea la contraseña de un usuario (por admin).
 */

import {
  Inject,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';

export interface ResetPasswordCommand {
  userId: string;
  newPassword: string;
  resetBy: string;
}

export interface ResetPasswordResult {
  success: boolean;
  message: string;
}

@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Ejecuta el reset de contraseña
   */
  async execute(command: ResetPasswordCommand): Promise<ResetPasswordResult> {
    // 1. Buscar usuario
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException(`Usuario ${command.userId} no encontrado`);
    }

    // 2. Cambiar contraseña (validación de dominio)
    await user.changePassword(command.newPassword, command.resetBy, true);

    // 3. Persistir
    await this.userRepository.save(user);

    // 4. Emitir eventos
    this.publishDomainEvents(user);

    this.logger.log(`Contraseña reseteada para: ${user.email.getValue()}`);

    return {
      success: true,
      message: `Contraseña actualizada para ${user.email.getValue()}`,
    };
  }

  /**
   * Publica eventos de dominio
   */
  private publishDomainEvents(user: any): void {
    const events = user.getDomainEvents();
    events.forEach((event: any) => {
      this.eventEmitter.emit(event.eventName, event);
    });
    user.clearDomainEvents();
  }
}
