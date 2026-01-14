/**
 * @usecase ListUsersUseCase
 *
 * Lista usuarios con filtros y paginación.
 */

import { Inject, Injectable } from "@nestjs/common";
import {
  IUserRepository,
  USER_REPOSITORY,
  type UserFilters,
  type PaginatedResult,
} from "../../domain/repositories/user.repository.interface";
import { UserMapper } from "../mappers/user.mapper";
import {
  UserResponseDto,
  PaginatedUsersResponseDto,
} from "../dto/user-response.dto";

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Ejecuta la búsqueda de usuarios
   */
  async execute(filters: UserFilters): Promise<PaginatedUsersResponseDto> {
    const result = await this.userRepository.findAll(filters);

    return {
      data: UserMapper.toResponseList(result.data),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  }
}
