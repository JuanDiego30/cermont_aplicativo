
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/repositories';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';

interface LoginDto {
  email: string;
  password: string;
}

interface AuthContext {
  ip?: string;
  userAgent?: string;
}

export interface LoginResult {
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
export class LoginUseCase {
  private readonly REFRESH_TOKEN_DAYS = 7;

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) { }

  async execute(dto: LoginDto, context: AuthContext): Promise<LoginResult> {
    // 1. Validate inputs via VOs
    const email = Email.create(dto.email);
    Password.create(dto.password); // Validate length

    // 2. Find user
    const user = await this.authRepository.findByEmail(email.getValue());
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
    }

    // 3. Check if can login
    if (!user.canLogin()) {
      throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
    }

    // 4. Verify password
    const isValid = await bcrypt.compare(dto.password, user.getPasswordHash());
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 5. Issue tokens
    const accessToken = this.jwtService.sign({
      userId: user.id,
      email: user.email.getValue(),
      role: user.role,
    });

    const refreshToken = uuidv4();
    const family = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_DAYS);

    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      family,
      expiresAt,
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });

    // 6. Update last login & audit
    await Promise.all([
      this.authRepository.updateLastLogin(user.id),
      this.authRepository.createAuditLog({
        userId: user.id,
        action: 'LOGIN',
        ip: context.ip,
        userAgent: context.userAgent,
      }),
    ]);

    return {
      message: 'Login exitoso',
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
