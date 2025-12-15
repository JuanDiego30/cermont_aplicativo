/**
 * ARCHIVO: create-usuario.use-case.ts
 * FUNCION: Caso de uso para creación de nuevos usuarios
 * IMPLEMENTACION: Valida email único, hashea password con bcrypt, emite evento usuario.created
 * DEPENDENCIAS: NestJS, bcryptjs, EventEmitter2, IUsuarioRepository
 * EXPORTS: CreateUsuarioUseCase
 */
import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcryptjs';
import { USUARIO_REPOSITORY, IUsuarioRepository } from '../../domain/repositories';
import { CreateUsuarioDto, UsuarioResponse } from '../dto';

@Injectable()
export class CreateUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateUsuarioDto): Promise<{ message: string; data: UsuarioResponse }> {
    // Verificar email único
    const existing = await this.usuarioRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Crear usuario
    const usuario = await this.usuarioRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: dto.role,
      phone: dto.phone,
      avatar: dto.avatar,
    });

    // Emitir evento
    this.eventEmitter.emit('usuario.created', {
      userId: usuario.id,
      email: usuario.email,
      role: usuario.role,
    });

    return {
      message: 'Usuario creado exitosamente',
      data: {
        id: usuario.id,
        email: usuario.email,
        name: usuario.name,
        role: usuario.role,
        phone: usuario.phone,
        avatar: usuario.avatar,
        active: usuario.active,
        createdAt: usuario.createdAt,
      },
    };
  }
}
