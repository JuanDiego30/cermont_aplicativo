import { HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { AUTH_CONSTANTS } from '../../auth.constants';

export interface AuthTokenUserPayload {
  id: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  token: string;
  family: string;
  expiresAt: Date;
}

export abstract class BaseAuthUseCase {
  protected constructor(protected readonly jwtService: JwtService) {}

  protected signAccessToken(user: AuthTokenUserPayload): string {
    return this.jwtService.sign({
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      jti: randomUUID(),
    });
  }

  protected createRefreshToken(days: number): RefreshTokenPayload {
    const token = randomUUID();
    const family = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return { token, family, expiresAt };
  }

  protected getRefreshTokenDays(rememberMe?: boolean): number {
    return rememberMe
      ? AUTH_CONSTANTS.REFRESH_TOKEN_DAYS_REMEMBER
      : AUTH_CONSTANTS.REFRESH_TOKEN_DAYS_DEFAULT;
  }

  protected isHttpExceptionLike(error: unknown): boolean {
    return (
      error instanceof HttpException ||
      (typeof error === 'object' &&
        error !== null &&
        typeof (error as any).getStatus === 'function' &&
        typeof (error as any).getResponse === 'function')
    );
  }
}
