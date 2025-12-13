/**
 * @useCase GetUsuarioByIdUseCase
 * @description Caso de uso para obtener un usuario por ID
 * @layer Application
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { USUARIO_REPOSITORY, IUsuarioRepository } from '../../domain/repositories';
import { UsuarioResponse } from '../dto';

@Injectable()
export class GetUsuarioByIdUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(id: string): Promise<UsuarioResponse> {
    const usuario = await this.usuarioRepository.findById(id);

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: usuario.id,
      email: usuario.email,
      name: usuario.name,
      role: usuario.role,
      phone: usuario.phone,
      avatar: usuario.avatar,
      active: usuario.active,
      lastLogin: usuario.lastLogin,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt,
    };
  }
}
