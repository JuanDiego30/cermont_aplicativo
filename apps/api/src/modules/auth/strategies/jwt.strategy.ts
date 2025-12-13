/**
 * @strategy JwtStrategy
 *
 * Estrategia Passport JWT: extrae token Bearer y valida el payload usado por guards.
 *
 * Uso: Habilitada por AuthModule y consumida por JwtAuthGuard.
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly configService: ConfigService) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET is required');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: { userId: string; email: string; role: string }) {
        return { userId: payload.userId, email: payload.email, role: payload.role };
    }
}
