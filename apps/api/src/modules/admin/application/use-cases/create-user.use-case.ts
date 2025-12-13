/**
 * @usecase CreateUserUseCase
 * 
 * Crea un nuevo usuario en el sistema.
 * Contiene la lógica de orquestación (no reglas de negocio).
 */

import { Inject, Injectable, ConflictException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { type CreateUserInput } from '../dto/create-user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { UserResponseDto } from '../dto/user-response.dto';

export interface CreateUserCommand extends CreateUserInput {
  createdBy: string;
}

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Ejecuta la creación de usuario
   */
  async execute(command: CreateUserCommand): Promise<UserResponseDto> {
    // 1. Verificar email único
    const existingUser = await this.userRepository.existsByEmail(command.email);
    if (existingUser) {
      throw new ConflictException(`Email ${command.email} ya está registrado`);
    }

    // 2. Crear entity (validaciones de dominio ocurren aquí)
    const userData = UserMapper.createDtoToEntityData(command, command.createdBy);
    const user = await UserEntity.create(userData);

    // 3. Persistir
    const savedUser = await this.userRepository.save(user);

    // 4. Emitir eventos de dominio
    this.publishDomainEvents(savedUser);

    this.logger.log(`Usuario creado: ${command.email} con rol ${command.role}`);

    // 5. Retornar DTO
    return UserMapper.toResponse(savedUser);
  }

  /**
   * Publica eventos de dominio
   */
  private publishDomainEvents(user: UserEntity): void {
    const events = user.getDomainEvents();
    events.forEach((event) => {
      this.eventEmitter.emit(event.eventName, event);
    });
    user.clearDomainEvents();
  }
}
