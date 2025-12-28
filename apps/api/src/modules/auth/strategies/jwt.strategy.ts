import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

export interface JwtPayload {
  sub?: string;      // Standard JWT claim (for compatibility)
  userId?: string;   // Our custom claim (used by login.use-case.ts)
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    // ✅ FIX: Accept both 'sub' (standard) and 'userId' (our custom claim)
    const userId = payload.sub || payload.userId;

    if (!userId) {
      this.logger.warn('JWT validation failed: No userId or sub in token');
      throw new UnauthorizedException('Token inválido: falta identificador de usuario');
    }

    // Verificar que el usuario existe y está activo
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
      },
    });

    if (!user) {
      this.logger.warn(`JWT validation failed: User not found - ${userId}`);
      throw new UnauthorizedException('Usuario no válido');
    }

    if (!user.active) {
      this.logger.warn(`JWT validation failed: User inactive - ${userId}`);
      throw new UnauthorizedException('Usuario inactivo');
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}

