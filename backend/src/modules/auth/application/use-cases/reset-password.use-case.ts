import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcryptjs';

export interface ResetPasswordResult {
  message: string;
}

@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.logger.log('ResetPasswordUseCase instantiated');
  }

  async execute(rawToken: string, newPassword: string): Promise<ResetPasswordResult> {
    try {
      // 1. Buscar todos los tokens activos (no usados y no expirados)
      const tokens = await this.prisma.passwordResetToken.findMany({
        where: {
          usedAt: null, // Solo tokens no usados
          expiresAt: { gt: new Date() },
        },
      });

      // 2. Verificar token contra cada hash
      let matchedToken = null;
      for (const tokenRecord of tokens) {
        const isValid = await bcrypt.compare(rawToken, tokenRecord.token);
        if (isValid) {
          matchedToken = tokenRecord;
          break;
        }
      }

      if (!matchedToken) {
        this.logger.warn('Password reset failed: Invalid or expired token');
        throw new BadRequestException('Token inválido o expirado');
      }

      // 3. Obtener información del usuario
      const user = await this.prisma.user.findUnique({
        where: { id: matchedToken.userId },
        select: { id: true, email: true, name: true },
      });

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      // 4. Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 5. Actualizar contraseña del usuario
      await this.prisma.user.update({
        where: { id: matchedToken.userId },
        data: { password: hashedPassword },
      });

      // 6. Marcar token como usado
      await this.prisma.passwordResetToken.update({
        where: { id: matchedToken.id },
        data: { usedAt: new Date() },
      });

      // 7. Invalidar todos los refresh tokens del usuario (logout en todos los dispositivos)
      await this.prisma.refreshToken.deleteMany({
        where: { userId: matchedToken.userId },
      });

      // 8. Emitir evento para enviar email de confirmación (desacoplado)
      this.eventEmitter.emit('auth.password-reset.completed', {
        userId: user.id,
        email: user.email,
        name: user.name,
      });

      this.logger.log(`Password reset completed for user ${matchedToken.userId}`);

      return {
        message: 'Contraseña actualizada exitosamente',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`Error resetting password: ${err.message}`, err.stack);
      throw new BadRequestException('Error al resetear contraseña');
    }
  }
}
