/**
 * @usecase ToggleUserActiveUseCase
 *
 * Activa o desactiva un usuario.
 */

import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  IUserRepository,
  USER_REPOSITORY,
} from "../../domain/repositories/user.repository.interface";

export interface ToggleUserActiveCommand {
  userId: string;
  active: boolean;
  reason?: string;
  changedBy: string;
}

export interface ToggleActiveResult {
  success: boolean;
  message: string;
}

@Injectable()
export class ToggleUserActiveUseCase {
  private readonly logger = new Logger(ToggleUserActiveUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Ejecuta la activación/desactivación
   */
  async execute(command: ToggleUserActiveCommand): Promise<ToggleActiveResult> {
    // 1. Buscar usuario
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException(`Usuario ${command.userId} no encontrado`);
    }

    // 2. No permitir desactivarse a sí mismo
    if (command.userId === command.changedBy && !command.active) {
      throw new BadRequestException("No puedes desactivar tu propia cuenta");
    }

    // 3. No desactivar último admin
    if (!command.active && user.role.isAdmin()) {
      const adminCount = await this.userRepository.countAdmins();
      const activeAdmins = await this.userRepository.countByRole("admin");
      // Verificar si es el único admin activo
      if (activeAdmins <= 1) {
        throw new BadRequestException(
          "No se puede desactivar el único administrador activo del sistema",
        );
      }
    }

    // 4. Aplicar cambio
    if (command.active) {
      user.activate();
    } else {
      user.deactivate(command.changedBy, command.reason);
    }

    // 5. Persistir
    await this.userRepository.save(user);

    // 6. Emitir eventos
    this.publishDomainEvents(user);

    const estado = command.active ? "activado" : "desactivado";
    this.logger.log(`Usuario ${estado}: ${user.email.getValue()}`);

    return {
      success: true,
      message: `Usuario ${user.email.getValue()} ${estado}`,
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
