/**
 * @usecase GetUserStatsUseCase
 *
 * Obtiene estadísticas de usuarios.
 */

import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { UserStatsResponseDto } from '../dto/user-response.dto';

@Injectable()
export class GetUserStatsUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Ejecuta la obtención de estadísticas
   */
  async execute(): Promise<UserStatsResponseDto> {
    const stats = await this.userRepository.getStats();

    return {
      total: stats.total,
      activos: stats.activos,
      porRol: stats.porRol,
    };
  }
}
