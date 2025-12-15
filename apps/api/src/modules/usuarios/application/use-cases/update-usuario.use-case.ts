/**
 * ARCHIVO: update-usuario.use-case.ts
 * FUNCION: Caso de uso para actualización parcial de datos de usuario
 * IMPLEMENTACION: Verifica existencia, hashea password si cambia, emite evento usuario.updated
 * DEPENDENCIAS: NestJS, bcryptjs, EventEmitter2, IUsuarioRepository
 * EXPORTS: UpdateUsuarioUseCase
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcryptjs';
import { USUARIO_REPOSITORY, IUsuarioRepository } from '../../domain/repositories';
import { UpdateUsuarioDto, UsuarioResponse } from '../dto';

@Injectable()
export class UpdateUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: string,
    dto: UpdateUsuarioDto,
  ): Promise<{ message: string; data: UsuarioResponse }> {
    // Verificar existencia
    const existing = await this.usuarioRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Preparar datos de actualización
    const updateData: Record<string, unknown> = { ...dto };

    // Hash password si se proporciona
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 12);
    }

    // Actualizar
    const usuario = await this.usuarioRepository.update(id, updateData as any);

    // Emitir evento
    this.eventEmitter.emit('usuario.updated', {
      userId: usuario.id,
      changes: Object.keys(dto),
    });

    return {
      message: 'Usuario actualizado exitosamente',
      data: {
        id: usuario.id,
        email: usuario.email,
        name: usuario.name,
        role: usuario.role,
        phone: usuario.phone,
        avatar: usuario.avatar,
        active: usuario.active,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,
      },
    };
  }
}
