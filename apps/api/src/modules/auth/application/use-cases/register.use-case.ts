/**
 * @useCase RegisterUseCase
 * @description Caso de uso para registrar un nuevo usuario
 * @layer Application
 */
import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/repositories';
import { AuthSessionEntity } from '../../domain/entities';
import { Credentials } from '../../domain/value-objects';
import { UserRegisteredEvent } from '../../domain/events';
import { RegisterDto, LoginResponse, AuthContext } from '../dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: RegisterDto, context: AuthContext): Promise<LoginResponse> {
    // 1. Verificar si el email ya existe
    const existing = await this.authRepository.findUserByEmail(dto.email);

    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    // 2. Crear credenciales y hashear password
    const credentials = Credentials.create(dto.email, dto.password);
    const hashedCredentials = await credentials.hash(12);

    // 3. Crear usuario
    const user = await this.authRepository.createUser({
      email: hashedCredentials.email,
      password: hashedCredentials.password,
      name: dto.name,
      role: dto.role ?? 'tecnico',
      phone: dto.phone,
    });

    // 4. Generar tokens
    const accessToken = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 5. Crear sesión
    const session = AuthSessionEntity.create(
      user.id,
      context.ip,
      context.userAgent,
    );
    await this.authRepository.createSession(session);

    // 6. Registrar auditoría
    await this.authRepository.createAuditLog({
      entityType: 'User',
      entityId: user.id,
      action: 'REGISTER',
      userId: user.id,
      ip: context.ip,
      userAgent: context.userAgent,
    });

    // 7. Emitir evento
    this.eventEmitter.emit(
      'auth.user.registered',
      new UserRegisteredEvent(
        user.id,
        user.email,
        user.name,
        user.role,
        context.ip,
        context.userAgent,
      ),
    );

    return {
      message: 'Usuario registrado exitosamente',
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
