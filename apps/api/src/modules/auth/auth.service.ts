/**
 * @service AuthService
 *
 * Gestiona login/registro y emisión de access/refresh tokens con persistencia en BD.
 *
 * Uso: AuthController delega aquí la autenticación y rotación de refresh tokens.
 * 
 * Principios aplicados:
 * - DRY: Métodos privados para lógica reutilizada (buildAuthResponse, issueTokens, createAuditLog)
 * - SRP: Cada método tiene una responsabilidad clara
 */
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../lib/services/password.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

/**
 * Tipo para usuario autenticado (evita any)
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  phone?: string | null;
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: Omit<AuthUser, 'password'>;
}

/**
 * Tipo de acción de auditoría
 */
type AuditAction = 'LOGIN' | 'REGISTER' | 'LOGOUT' | 'REFRESH';

@Injectable()
export class AuthService {
  private readonly REFRESH_TOKEN_DAYS = 7;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
  ) { }

  // =====================================================
  // MÉTODOS PÚBLICOS DE HASH Y TOKENS
  // =====================================================

  async hashPassword(password: string): Promise<string> {
    return this.passwordService.hash(password);
  }

  async comparePassword(plain: string, hashed: string): Promise<boolean> {
    return this.passwordService.compare(plain, hashed);
  }

  generateAccessToken(userId: string, email: string, role: string): string {
    return this.jwtService.sign({ userId, email, role });
  }

  async generateRefreshToken(
    userId: string,
    ip?: string,
    userAgent?: string,
  ): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_DAYS);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
        family: uuidv4(),
        ipAddress: ip ?? null,
        userAgent: userAgent ?? null,
      },
    });

    return token;
  }

  validateToken(token: string): Record<string, unknown> | null {
    try {
      return this.jwtService.verify(token) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // =====================================================
  // MÉTODOS PRINCIPALES DE AUTENTICACIÓN
  // =====================================================

  /**
   * Autentica un usuario existente
   */
  async login(dto: LoginDto, ip?: string, userAgent?: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !user.active || !user.password) {
      throw new UnauthorizedException('Credenciales invalidas o usuario inactivo');
    }

    const isValid = await this.comparePassword(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    // Registrar auditoría y actualizar último login
    await Promise.all([
      this.createAuditLog(user.id, 'LOGIN', ip, userAgent),
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      }),
    ]);

    return this.buildAuthResponse(user, ip, userAgent);
  }

  /**
   * Registra un nuevo usuario
   */
  async register(dto: RegisterDto, ip?: string, userAgent?: string): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('El email ya esta registrado');
    }

    const hashedPassword = await this.hashPassword(dto.password);
    const role = dto.role ?? 'tecnico';

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: role as 'admin' | 'supervisor' | 'tecnico',
        phone: dto.phone,
      },
    });

    await this.createAuditLog(user.id, 'REGISTER', ip, userAgent);

    return this.buildAuthResponse(user, ip, userAgent);
  }

  /**
   * Renueva tokens usando refresh token
   */
  async refresh(refreshToken: string, ip?: string, userAgent?: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token invalido');
    }

    // Detectar reutilización de token (posible robo)
    if (storedToken.isRevoked) {
      await this.prisma.refreshToken.updateMany({
        where: { family: storedToken.family },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException('Token reutilizado detectado');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token expirado');
    }

    // Revocar token actual y emitir nuevos
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const { accessToken, refreshToken: newRefreshToken } = await this.issueTokens(
      storedToken.user,
      ip,
      userAgent,
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Cierra sesión revocando refresh token
   */
  async logout(
    accessToken: string | undefined,
    refreshToken: string | undefined,
  ): Promise<void> {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { isRevoked: true },
      });
    }
  }

  // =====================================================
  // MÉTODOS PRIVADOS - DRY (Don't Repeat Yourself)
  // =====================================================

  /**
   * Construye respuesta de autenticación estándar
   * Aplica DRY: usado por login y register
   */
  private async buildAuthResponse(
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    const { accessToken, refreshToken } = await this.issueTokens(user, ip, userAgent);

    return {
      token: accessToken,
      refreshToken,
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

  /**
   * Emite par de tokens (access + refresh)
   * Aplica DRY: usado por login, register, refresh
   */
  private async issueTokens(
    user: Pick<AuthUser, 'id' | 'email' | 'role'>,
    ip?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id, ip, userAgent);

    return { accessToken, refreshToken };
  }

  /**
   * Crea registro de auditoría
   * Aplica DRY: usado por login, register
   */
  private async createAuditLog(
    userId: string,
    action: AuditAction,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'User',
        entityId: userId,
        action,
        userId,
        ip,
        userAgent,
      },
    });
  }
}
