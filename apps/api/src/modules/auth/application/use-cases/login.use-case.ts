/**
 * @useCase LoginUseCase
 * @description Caso de uso para iniciar sesión
 * @layer Application
 */
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/repositories';
import { AuthSessionEntity } from '../../domain/entities';
import { Credentials } from '../../domain/value-objects';
import { UserLoggedInEvent } from '../../domain/events';
import { LoginDto, LoginResponse, AuthContext } from '../dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: LoginDto, context: AuthContext): Promise<LoginResponse> {
    // 1. Buscar usuario por email
    const user = await this.authRepository.findUserByEmail(dto.email);

    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
    }

    // 2. Verificar contraseña
    const credentials = Credentials.fromHashed(user.email, user.password);
    const isValid = await credentials.verify(dto.password);

    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Generar tokens
    const accessToken = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 4. Crear sesión con refresh token
    const session = AuthSessionEntity.create(
      user.id,
      context.ip,
      context.userAgent,
    );
    await this.authRepository.createSession(session);

    // 5. Actualizar último login
    await this.authRepository.updateLastLogin(user.id);

    // 6. Registrar auditoría
    await this.authRepository.createAuditLog({
      entityType: 'User',
      entityId: user.id,
      action: 'LOGIN',
      userId: user.id,
      ip: context.ip,
      userAgent: context.userAgent,
    });

    // 7. Emitir evento
    this.eventEmitter.emit(
      'auth.user.logged-in',
      new UserLoggedInEvent(user.id, user.email, context.ip, context.userAgent),
    );

    return {
      message: 'Login exitoso',
      token: accessToken,
      refreshToken: session.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      },
    };
  }
}
