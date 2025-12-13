/**
 * @usecase UpdateUserUseCase
 * 
 * Actualiza información básica de un usuario.
 */

import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { UserMapper } from '../mappers/user.mapper';
import { UserResponseDto } from '../dto/user-response.dto';
import { type UpdateUserInput } from '../dto/update-user.dto';

export interface UpdateUserCommand extends UpdateUserInput {
  userId: string;
  updatedBy: string;
}

@Injectable()
export class UpdateUserUseCase {
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Ejecuta la actualización de usuario
   */
  async execute(command: UpdateUserCommand): Promise<UserResponseDto> {
    // 1. Buscar usuario
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException(`Usuario ${command.userId} no encontrado`);
    }

    // 2. Aplicar actualizaciones (validaciones de dominio)
    const updateData = UserMapper.extractUpdateData(command);
    user.update(updateData, command.updatedBy);

    // 3. Persistir
    const savedUser = await this.userRepository.save(user);

    // 4. Emitir eventos de dominio
    this.publishDomainEvents(savedUser);

    this.logger.log(`Usuario actualizado: ${user.email.getValue()}`);

    // 5. Retornar DTO
    return UserMapper.toResponse(savedUser);
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
