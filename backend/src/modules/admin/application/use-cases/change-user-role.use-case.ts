/**
 * @usecase ChangeUserRoleUseCase
 *
 * Cambia el rol de un usuario.
 */

import { Inject, Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { UserResponseDto } from '../dto/user-response.dto';

export interface ChangeUserRoleCommand {
  userId: string;
  newRole: string;
  changedBy: string;
}

@Injectable()
export class ChangeUserRoleUseCase {
  private readonly logger = new Logger(ChangeUserRoleUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Ejecuta el cambio de rol
   */
  async execute(command: ChangeUserRoleCommand): Promise<UserResponseDto> {
    // 1. Buscar usuario
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException(`Usuario ${command.userId} no encontrado`);
    }

    // 2. Validar que no se quite rol admin a sí mismo
    if (
      command.userId === command.changedBy &&
      user.role.isAdmin() &&
      command.newRole !== 'admin'
    ) {
      throw new BadRequestException('No puedes quitarte el rol de administrador');
    }

    // 3. Si es el último admin, no permitir cambio
    if (user.role.isAdmin() && command.newRole !== 'admin') {
      const adminCount = await this.userRepository.countAdmins();
      if (adminCount <= 1) {
        throw new BadRequestException(
          'No se puede cambiar el rol del único administrador del sistema'
        );
      }
    }

    // 4. Cambiar rol (validación de dominio ocurre aquí)
    const oldRole = user.role.getValue();
    user.changeRole(command.newRole, command.changedBy);

    // 5. Persistir
    const savedUser = await this.userRepository.save(user);

    // 6. Emitir eventos
    this.publishDomainEvents(savedUser);

    this.logger.log(
      `Rol actualizado para ${user.email.getValue()}: ${oldRole} -> ${command.newRole}`
    );

    return UserMapper.toResponse(savedUser);
  }

  /**
   * Publica eventos de dominio
   */
  private publishDomainEvents(user: UserEntity): void {
    const events = user.getDomainEvents();
    events.forEach(event => {
      this.eventEmitter.emit(event.eventName, event);
    });
    user.clearDomainEvents();
  }
}
