/**
 * ARCHIVO: deactivate-usuario.use-case.ts
 * FUNCION: Caso de uso para desactivación lógica de usuarios (soft delete)
 * IMPLEMENTACION: Verifica existencia, desactiva usuario, emite evento usuario.deactivated
 * DEPENDENCIAS: NestJS, EventEmitter2, IUsuarioRepository
 * EXPORTS: DeactivateUsuarioUseCase
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USUARIO_REPOSITORY, IUsuarioRepository } from '../../domain/repositories';

@Injectable()
export class DeactivateUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string): Promise<{ message: string }> {
    // Verificar existencia
    const existing = await this.usuarioRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Desactivar
    await this.usuarioRepository.deactivate(id);

    // Emitir evento
    this.eventEmitter.emit('usuario.deactivated', {
      userId: id,
      email: existing.email,
    });

    return { message: 'Usuario desactivado exitosamente' };
  }
}
