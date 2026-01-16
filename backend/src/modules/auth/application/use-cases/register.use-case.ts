import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/repositories';
import { Email, Password } from '../../domain/value-objects';

import { RegisterDto } from '../dto/register.dto';
import { AuthContext } from '../dto/auth-types.dto';
import { BaseAuthUseCase } from './base-auth.use-case';

export interface RegisterResult {
  message: string;
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    phone?: string;
  };
}

@Injectable()
export class RegisterUseCase extends BaseAuthUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(JwtService)
    jwtService: JwtService
  ) {
    super(jwtService);
  }

  async execute(dto: RegisterDto, context: AuthContext): Promise<RegisterResult> {
    // 1. Validate inputs via VOs
    const email = Email.create(dto.email);
    // Password validation happens in createFromPlainText

    // 2. Check if user exists
    const existing = await this.authRepository.findByEmail(email.getValue());
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    // 3. Create Password VO (hashes internally)
    // const rounds = this.configService.get<number>('BCRYPT_ROUNDS') ?? 12; // Encapsulated in Password VO
    const passwordVO = await Password.createFromPlainText(dto.password);

    // 4. Create user - map 'administrativo' to 'tecnico' as fallback
    const role = dto.role === 'administrativo' ? 'tecnico' : (dto.role ?? 'tecnico');
    const user = await this.authRepository.create({
      email: email.getValue(),
      password: passwordVO.getHash(),
      name: dto.name,
      role: role as 'admin' | 'supervisor' | 'tecnico',
      phone: dto.phone ?? null,
      avatar: null,
      active: true,
      lastLogin: null,
    });

    // 5. Issue tokens
    const accessToken = this.signAccessToken({
      id: user.id,
      email: user.email.getValue(),
      role: user.role,
    });

    const {
      token: refreshToken,
      family,
      expiresAt,
    } = this.createRefreshToken(this.getRefreshTokenDays(false));

    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      family,
      expiresAt,
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });

    // 6. Audit log (best-effort)
    Promise.allSettled([
      this.authRepository.createAuditLog({
        userId: user.id,
        action: 'REGISTER',
        ip: context.ip,
        userAgent: context.userAgent,
      }),
    ]).then(results => {
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          this.logger.error(`Failed to execute post-register action ${index}: ${result.reason}`);
        }
      });
    });

    return {
      message: 'Usuario registrado exitosamente',
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email.getValue(),
        name: user.name,
        role: user.role,
        avatar: user.avatar ?? undefined,
        phone: user.phone ?? undefined,
      },
    };
  }
}
