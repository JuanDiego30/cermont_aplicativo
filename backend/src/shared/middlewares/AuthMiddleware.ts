import { Request, Response, NextFunction } from 'express';
import { IRevokedTokenRepository } from '../../domain/repositories/IRevokedTokenRepository.js';
import { JWTService } from '../../domain/services/AuthService.js';
import { logger, getErrorMessage } from '../utils/index.js';
import { loginFailedTotal } from '../metrics/prometheus.js';
import { AppError } from '../errors/AppError.js';

export class AuthMiddleware {
    constructor(
        private readonly revokedTokenRepository: IRevokedTokenRepository,
        private readonly jwtService: JWTService
    ) { }

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                loginFailedTotal.inc({ reason: 'missing_token' });
                throw new AppError('Token de autenticación requerido', 401);
            }

            const token = authHeader.substring(7);

            const payload = await this.jwtService.verify(token);

            const isRevoked = await this.revokedTokenRepository.isRevoked(payload.jti);

            if (isRevoked) {
                logger.warn('Revoked token used', {
                    userId: payload.userId,
                    jti: payload.jti,
                    path: req.path,
                });

                loginFailedTotal.inc({ reason: 'revoked_token' });
                throw new AppError('Token inválido o expirado', 401);
            }

            req.user = {
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
                jti: payload.jti,
            };

            logger.debug('Authentication successful', {
                userId: payload.userId,
                path: req.path,
            });

            next();
        } catch (error: unknown) {
            logger.warn('Authentication failed', {
                error: getErrorMessage(error),
                path: req.path,
                ip: req.ip,
            });

            loginFailedTotal.inc({ reason: 'invalid_token' });

            if (error instanceof AppError) {
                next(error);
                return;
            }

            const errorMsg = getErrorMessage(error);
            const message = errorMsg === 'Token expirado' ? 'Token expirado' : 'Token inválido o expirado';
            next(new AppError(message, 401));
        }
    };

    handleOptional = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }

        await this.handle(req, res, next);
    };
}
