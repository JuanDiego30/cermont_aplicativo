/**
 * @service AuthService
 *
 * Gestiona login/registro y emisión de access/refresh tokens con persistencia en BD.
 *
 * Uso: AuthController delega aquí la autenticación y rotación de refresh tokens.
 */
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly REFRESH_TOKEN_DAYS = 7;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.configService.get<number>('BCRYPT_ROUNDS') || 12);
  }

  async comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  generateAccessToken(userId: string, email: string, role: string): string {
    return this.jwtService.sign({ userId, email, role });
  }

  async generateRefreshToken(userId: string, ip?: string, userAgent?: string): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_DAYS);
    await this.prisma.refreshToken.create({ data: { token, userId, expiresAt, family: uuidv4(), ipAddress: ip, userAgent } });
    return token;
  }

  /**
   * @refactor PRIORIDAD_MEDIA
   *
   * Problema: `generateTokens` usa `any` y asume shape de usuario sin contrato.
   *
   * Solución sugerida: Definir interfaz/DTO (p.ej. AuthUser) y tipar el payload (id/email/role).
   */
  async generateTokens(user: any) {
    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);
    return { accessToken, refreshToken };
  }

  validateToken(token: string) {
    try { return this.jwtService.verify(token); } catch { return null; }
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * @refactor PRIORIDAD_MEDIA
   *
   * Problema: `login` y `register` duplican construcción de respuesta y emisión de tokens.
   *
   * Solución sugerida: Extraer métodos privados `buildAuthResponse(user)` y `issueTokens(user, ip, userAgent)`.
   */
  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.active) throw new UnauthorizedException('Credenciales invalidas o usuario inactivo');
    const isValid = await this.comparePassword(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Credenciales invalidas');
    await this.prisma.auditLog.create({ data: { entityType: 'User', entityId: user.id, action: 'LOGIN', userId: user.id, ip, userAgent } });
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id, ip, userAgent);
    return { token: accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, phone: user.phone } };
  }

  async register(dto: RegisterDto, ip?: string, userAgent?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('El email ya esta registrado');
    const hashedPassword = await this.hashPassword(dto.password);
    const user = await this.prisma.user.create({ data: { email: dto.email, password: hashedPassword, name: dto.name, role: (dto.role || 'tecnico') as any, phone: dto.phone } });
    await this.prisma.auditLog.create({ data: { entityType: 'User', entityId: user.id, action: 'REGISTER', userId: user.id, ip, userAgent } });
    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id, ip, userAgent);
    return { token: accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, phone: user.phone } };
  }

  async refresh(refreshToken: string, ip?: string, userAgent?: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } });
    if (!storedToken) throw new UnauthorizedException('Refresh token invalido');
    if (storedToken.isRevoked) {
      await this.prisma.refreshToken.updateMany({ where: { family: storedToken.family }, data: { isRevoked: true } });
      throw new UnauthorizedException('Token reutilizado detectado');
    }
    if (new Date() > storedToken.expiresAt) throw new UnauthorizedException('Refresh token expirado');
    await this.prisma.refreshToken.update({ where: { id: storedToken.id }, data: { isRevoked: true } });
    const newRefreshToken = await this.generateRefreshToken(storedToken.userId, ip, userAgent);
    const newAccessToken = this.generateAccessToken(storedToken.userId, storedToken.user.email, storedToken.user.role);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(accessToken: string | undefined, refreshToken: string | undefined) {
    if (refreshToken) await this.prisma.refreshToken.updateMany({ where: { token: refreshToken }, data: { isRevoked: true } });
  }
}
