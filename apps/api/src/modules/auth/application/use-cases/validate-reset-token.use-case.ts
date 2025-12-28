import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

export interface ValidateResetTokenResult {
    valid: boolean;
    email: string;
}

@Injectable()
export class ValidateResetTokenUseCase {
    private readonly logger = new Logger(ValidateResetTokenUseCase.name);

    constructor(private readonly prisma: PrismaService) {
        this.logger.log('ValidateResetTokenUseCase instantiated');
    }

    async execute(rawToken: string): Promise<ValidateResetTokenResult> {
        try {
            // 1. Buscar todos los tokens activos (no usados y no expirados)
            const tokens = await this.prisma.passwordResetToken.findMany({
                where: {
                    usedAt: null, // Solo tokens no usados
                    expiresAt: { gt: new Date() }
                }
            });

            // 2. Verificar token contra cada hash (timing-safe)
            for (const tokenRecord of tokens) {
                const isValid = await bcrypt.compare(rawToken, tokenRecord.token);

                if (isValid) {
                    // El email está directamente en el token
                    this.logger.log(`Reset token validated for email: ${tokenRecord.email}`);
                    return {
                        valid: true,
                        email: tokenRecord.email
                    };
                }
            }

            this.logger.warn('Reset token validation failed: Token not found or expired');
            throw new BadRequestException('Token inválido o expirado');
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            const err = error as Error;
            this.logger.error(`Error validating reset token: ${err.message}`, err.stack);
            throw new BadRequestException('Token inválido o expirado');
        }
    }
}

