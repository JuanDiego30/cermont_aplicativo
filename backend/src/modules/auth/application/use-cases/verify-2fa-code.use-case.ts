import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

export interface Verify2FACodeResult {
  valid: boolean;
  userId: string;
}

@Injectable()
export class Verify2FACodeUseCase {
  private readonly logger = new Logger(Verify2FACodeUseCase.name);
  private readonly MAX_ATTEMPTS = 5;

  constructor(private readonly prisma: PrismaService) {}

  async execute(email: string, code: string): Promise<Verify2FACodeResult> {
    try {
      // 1. Buscar usuario
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (!user) {
        this.logger.warn('2FA verification failed: User not found');
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // 2. Buscar código válido
      const twoFactorToken = await this.prisma.twoFactorToken.findFirst({
        where: {
          userId: user.id,
          code,
          verified: false,
          expiresAt: {
            gt: new Date(), // Mayor que la fecha actual (no expirado)
          },
        },
      });

      if (!twoFactorToken) {
        // Incrementar contador de intentos fallidos
        await this.prisma.twoFactorToken.updateMany({
          where: {
            userId: user.id,
            verified: false,
          },
          data: {
            attempts: { increment: 1 },
          },
        });

        // Verificar si se excedieron los intentos
        const tokenWithAttempts = await this.prisma.twoFactorToken.findFirst({
          where: {
            userId: user.id,
            verified: false,
          },
        });

        if (tokenWithAttempts && tokenWithAttempts.attempts >= this.MAX_ATTEMPTS) {
          // Invalidar el token por exceso de intentos
          await this.prisma.twoFactorToken.deleteMany({
            where: { userId: user.id },
          });
          this.logger.warn(
            `2FA token invalidated for user ${user.id} due to max attempts exceeded`
          );
          throw new UnauthorizedException(
            'Demasiados intentos fallidos. Solicita un nuevo código.'
          );
        }

        this.logger.warn(`2FA verification failed: Invalid or expired code for user ${user.id}`);
        throw new UnauthorizedException('Código inválido o expirado');
      }

      // 3. Marcar código como verificado
      await this.prisma.twoFactorToken.update({
        where: { id: twoFactorToken.id },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
      });

      // 4. Eliminar códigos antiguos del usuario
      await this.prisma.twoFactorToken.deleteMany({
        where: {
          userId: user.id,
          id: { not: twoFactorToken.id },
        },
      });

      await this.prisma.auditLog.create({
        data: {
          entityType: 'User',
          entityId: user.id,
          action: '2FA_VERIFIED',
          userId: user.id,
        },
      });

      this.logger.log(`2FA code verified successfully for user ${user.id}`);

      return {
        valid: true,
        userId: user.id,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`Error verifying 2FA code: ${err.message}`, err.stack);
      throw new UnauthorizedException('Error al verificar código');
    }
  }
}
