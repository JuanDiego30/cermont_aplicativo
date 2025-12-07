import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AuthRepository, authRepository } from './auth.repository.js';
import { AppError, UnauthorizedError, ConflictError } from '../../shared/errors/index.js';
import { env } from '../../config/env.js';
import { createLogger } from '../../shared/utils/logger.js';
import type { LoginDTO, RegisterDTO, AuthResponse, TokenPayload, UserResponse, ForgotPasswordDTO, ResetPasswordDTO } from './auth.types.js';

const logger = createLogger('AuthService');
const REFRESH_TOKEN_DAYS = 7;

export class AuthService {
  constructor(private readonly repository: AuthRepository = authRepository) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, env.BCRYPT_ROUNDS);
  }

  async comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  generateAccessToken(userId: string, email: string, role: string): string {
    const payload: Omit<TokenPayload, 'iat' | 'exp'> = { userId, email, role };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
  }

  async generateRefreshToken(userId: string, ip?: string, userAgent?: string): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await this.repository.createRefreshToken({
      token,
      userId,
      expiresAt,
      family: uuidv4(),
      ipAddress: ip,
      userAgent: userAgent,
    });

    return token;
  }

  validateToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  async findUserById(id: string) {
    return this.repository.findById(id);
  }

  async login(data: LoginDTO, ip?: string, userAgent?: string): Promise<AuthResponse & { refreshToken: string }> {
    const user = await this.repository.findByEmail(data.email);

    if (!user || !user.active) {
      logger.warn('Login fallido: usuario no encontrado o inactivo', { email: data.email });
      throw new UnauthorizedError('Credenciales inválidas o usuario inactivo');
    }

    const isValid = await this.comparePassword(data.password, user.password);
    if (!isValid) {
      logger.warn('Login fallido: contraseña incorrecta', { email: data.email });
      throw new UnauthorizedError('Credenciales inválidas');
    }

    await this.repository.createAuditLog({
      entityType: 'User',
      entityId: user.id,
      action: 'LOGIN',
      userId: user.id,
      ip: ip || 'unknown',
      userAgent: userAgent,
    });

    await this.repository.updateLastLogin(user.id);

    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id, ip, userAgent);

    logger.info('Login exitoso', { userId: user.id, email: user.email });

    return {
      token: accessToken,
      refreshToken,
      user: this.formatUserResponse(user),
    };
  }

  async register(data: RegisterDTO, ip?: string, userAgent?: string): Promise<AuthResponse & { refreshToken: string }> {
    const existing = await this.repository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('El email ya está registrado');
    }

    const hashedPassword = await this.hashPassword(data.password);

    const user = await this.repository.createUser({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role,
      phone: data.phone,
    });

    await this.repository.createAuditLog({
      entityType: 'User',
      entityId: user.id,
      action: 'REGISTER',
      userId: user.id,
      ip: ip || 'unknown',
      userAgent: userAgent,
    });

    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id, ip, userAgent);

    logger.info('Registro exitoso', { userId: user.id, email: user.email });

    return {
      token: accessToken,
      refreshToken,
      user: this.formatUserResponse(user),
    };
  }

  async refresh(refreshToken: string, ip?: string, userAgent?: string): Promise<{ accessToken: string; refreshToken: string }> {
    const storedToken = await this.repository.findRefreshToken(refreshToken);

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token inválido');
    }

    if (storedToken.isRevoked) {
      await this.repository.revokeTokenFamily(storedToken.family);
      logger.warn('Token reutilizado detectado', { tokenFamily: storedToken.family });
      throw new UnauthorizedError('Token reutilizado detectado');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedError('Refresh token expirado');
    }

    await this.repository.revokeRefreshToken(storedToken.id);

    const newRefreshToken = await this.generateRefreshToken(storedToken.userId, ip, userAgent);
    const newAccessToken = this.generateAccessToken(storedToken.userId, storedToken.user.email, storedToken.user.role);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(_accessToken: string | undefined, refreshToken: string | undefined): Promise<void> {
    if (refreshToken) {
      await this.repository.revokeRefreshTokenByValue(refreshToken);
    }
  }

  async forgotPassword(data: ForgotPasswordDTO): Promise<void> {
    const user = await this.repository.findByEmail(data.email);
    if (!user) return;

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000);

    await this.repository.createPasswordResetToken({
      token,
      userId: user.id,
      email: user.email,
      expiresAt,
    });

    // TODO: Implementar envío de email real
    logger.info('Token de reset generado', { email: user.email, token });
  }

  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    const resetToken = await this.repository.findPasswordResetToken(data.token);

    if (!resetToken || resetToken.usedAt || new Date() > resetToken.expiresAt) {
      throw new AppError('Token inválido o expirado', 400);
    }

    const hashedPassword = await this.hashPassword(data.newPassword);
    
    await this.repository.resetPasswordTransaction(resetToken.id, resetToken.userId, hashedPassword);
    
    logger.info('Contraseña reseteada exitosamente', { userId: resetToken.userId });
  }

  private formatUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
    };
  }
}

export const authService = new AuthService();
