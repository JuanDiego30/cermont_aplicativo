
import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/repositories';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';

interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'supervisor' | 'tecnico' | 'administrativo';
  phone?: string;
}

interface AuthContext {
  ip?: string;
  userAgent?: string;
}

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
export class RegisterUseCase {
  private readonly REFRESH_TOKEN_DAYS = 7;

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) { }

  async execute(dto: RegisterDto, context: AuthContext): Promise<RegisterResult> {
    // 1. Validate inputs via VOs
    const email = Email.create(dto.email);
    Password.create(dto.password); // Validate length

    // 2. Check if user exists
    const existing = await this.authRepository.findByEmail(email.getValue());
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    // 3. Hash password
    const rounds = this.configService.get<number>('BCRYPT_ROUNDS') ?? 12;
    const hashedPassword = await bcrypt.hash(dto.password, rounds);

    // 4. Create user - map 'administrativo' to 'tecnico' as fallback
    const role = dto.role === 'administrativo' ? 'tecnico' : (dto.role ?? 'tecnico');
    const user = await this.authRepository.create({
      email: email.getValue(),
      password: hashedPassword,
      name: dto.name,
      role: role as 'admin' | 'supervisor' | 'tecnico',
      phone: dto.phone ?? null,
      avatar: null,
      active: true,
      lastLogin: null,
    });

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

    // 6. Audit log
    await this.authRepository.createAuditLog({
      userId: user.id,
      action: 'REGISTER',
      ip: context.ip,
      userAgent: context.userAgent,
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
