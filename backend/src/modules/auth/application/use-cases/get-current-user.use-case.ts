/**
 * @useCase GetCurrentUserUseCase
 * @description Caso de uso para obtener el usuario actual
 * @layer Application
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/repositories';
import { MeResponse } from '../dto';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository
  ) {}

  async execute(userId: string): Promise<MeResponse> {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email.getValue(),
      name: user.name,
      role: user.role,
      avatar: user.avatar ?? undefined,
    };
  }
}
