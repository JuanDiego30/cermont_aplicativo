import { Injectable, UnauthorizedException, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { AUTH_CONSTANTS } from '../auth.constants';

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
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {
    const secret =
      configService.get<string>(AUTH_CONSTANTS.JWT_SECRET_ENV) ??
      process.env[AUTH_CONSTANTS.JWT_SECRET_ENV];
    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    // ✅ FIX: Accept both 'sub' (standard) and 'userId' (our custom claim)
    const userId = payload.sub || payload.userId;

    if (!userId) {
      this.logger.warn('JWT validation failed: missing sub/userId');
      throw new UnauthorizedException('No autorizado');
    }

    const cacheKey = `${AUTH_CONSTANTS.JWT_USER_CACHE_KEY_PREFIX}${userId}`;
    const ttlMs =
      this.configService.get<number>(AUTH_CONSTANTS.JWT_USER_CACHE_TTL_MS_ENV) ??
      AUTH_CONSTANTS.JWT_USER_CACHE_TTL_MS_DEFAULT;

    const cachedUser = await this.cache.get<{
      id: string;
      email: string;
      name: string;
      role: string;
      active: boolean;
    }>(cacheKey);

    const user =
      cachedUser ??
      (await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
        },
      }));

    if (!cachedUser && user) {
      await this.cache.set(cacheKey, user, ttlMs);
    }

    if (!user) {
      this.logger.warn(`JWT validation failed: User not found - ${userId}`);
      throw new UnauthorizedException('No autorizado');
    }

    if (!user.active) {
      this.logger.warn(`JWT validation failed: User inactive - ${userId}`);
      throw new UnauthorizedException('No autorizado');
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}

