import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

export interface Toggle2FAResult {
  twoFactorEnabled: boolean;
  message: string;
}

@Injectable()
export class Toggle2FAUseCase {
  private readonly logger = new Logger(Toggle2FAUseCase.name);

  constructor(private readonly prisma: PrismaService) {
    this.logger.log('Toggle2FAUseCase instantiated');
  }

  async execute(userId: string, enable: boolean): Promise<Toggle2FAResult> {
    try {
      // 1. Verificar que el usuario existe
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        this.logger.warn(`Toggle 2FA failed: User not found with ID ${userId}`);
        throw new NotFoundException('Usuario no encontrado');
      }

      // 1.1 Regla de negocio: los técnicos no deben usar 2FA
      if (user.role === 'tecnico' && enable) {
        this.logger.warn(`Toggle 2FA blocked: tecnico user ${userId} attempted to enable 2FA`);
        throw new ForbiddenException('2FA no está disponible para cuentas de técnico');
      }

      // 2. Actualizar estado de 2FA
      await this.prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: enable },
      });

      // 3. Si se deshabilita, eliminar códigos pendientes
      if (!enable) {
        await this.prisma.twoFactorToken.deleteMany({
          where: { userId },
        });
        this.logger.log(`2FA disabled for user ${userId}, all pending tokens deleted`);
      } else {
        this.logger.log(`2FA enabled for user ${userId}`);
      }

      return {
        twoFactorEnabled: enable,
        message: enable
          ? 'Autenticación de dos factores habilitada exitosamente'
          : 'Autenticación de dos factores deshabilitada exitosamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`Error toggling 2FA: ${err.message}`, err.stack);
      throw new NotFoundException('Error al actualizar configuración de 2FA');
    }
  }
}
