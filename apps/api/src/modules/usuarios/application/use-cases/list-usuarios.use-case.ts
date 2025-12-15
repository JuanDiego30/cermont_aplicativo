/**
 * ARCHIVO: list-usuarios.use-case.ts
 * FUNCION: Caso de uso para listar usuarios con paginación y filtros
 * IMPLEMENTACION: Aplica filtros (rol, activo, búsqueda), calcula paginación
 * DEPENDENCIAS: NestJS, IUsuarioRepository
 * EXPORTS: ListUsuariosUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { USUARIO_REPOSITORY, IUsuarioRepository } from '../../domain/repositories';
import { UsuarioQueryDto, UsuarioListResponse } from '../dto';

@Injectable()
export class ListUsuariosUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(query: UsuarioQueryDto): Promise<UsuarioListResponse> {
    const { data, total } = await this.usuarioRepository.findAll({
      role: query.role,
      active: query.active,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    const totalPages = Math.ceil(total / query.limit);

    return {
      data: data.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        phone: u.phone,
        avatar: u.avatar,
        active: u.active,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }
}
