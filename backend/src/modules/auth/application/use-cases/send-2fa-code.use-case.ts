import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface Send2FACodeResult {
  message: string;
  expiresIn: number;
}

@Injectable()
export class Send2FACodeUseCase {
  private readonly logger = new Logger(Send2FACodeUseCase.name);
  private readonly CODE_EXPIRATION_MINUTES = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(email: string): Promise<Send2FACodeResult> {
    try {
      // 1. Verificar que el usuario existe
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          twoFactorEnabled: true,
          role: true,
        },
      });

      if (!user) {
        this.logger.warn('2FA code request failed: User not found');
        throw new NotFoundException('Usuario no encontrado');
      }

      // Regla 2: admin SIEMPRE requiere 2FA.
      const isAdmin = String(user.role) === 'admin';
      if (!user.twoFactorEnabled && !isAdmin) {
        this.logger.warn('2FA code request failed: 2FA not enabled');
        throw new BadRequestException('El usuario no tiene 2FA habilitado');
      }

      // 2. Invalidar códigos anteriores del usuario
      await this.prisma.twoFactorToken.deleteMany({
        where: {
          userId: user.id,
          verified: false,
        },
      });

      // 3. Generar código de 6 dígitos
      const code = this.generateSixDigitCode();

      // 4. Calcular expiración (5 minutos)
      const expiresAt = new Date(Date.now() + this.CODE_EXPIRATION_MINUTES * 60 * 1000);

      // 5. Guardar código en base de datos
      await this.prisma.twoFactorToken.create({
        data: {
          userId: user.id,
          code,
          expiresAt,
          verified: false,
          attempts: 0,
        },
      });

      // 6. Emitir evento para enviar email (desacoplado)
      this.eventEmitter.emit('auth.2fa.code-generated', {
        userId: user.id,
        email: user.email,
        name: user.name,
        code,
        expiresAt,
      });

      // Audit log (sin secretos)
      await this.prisma.auditLog.create({
        data: {
          entityType: 'User',
          entityId: user.id,
          action: '2FA_CODE_SENT',
          userId: user.id,
          changes: {
            expiresAt: expiresAt.toISOString(),
          } as any,
        },
      });

      this.logger.log(`2FA code generated for user ${user.id}`);

      return {
        message: 'Código de verificación enviado exitosamente',
        expiresIn: this.CODE_EXPIRATION_MINUTES * 60, // segundos
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`Error sending 2FA code: ${err.message}`, err.stack);
      throw new BadRequestException('Error al enviar código de verificación');
    }
  }

  /**
   * Genera un código aleatorio de 6 dígitos
   */
  private generateSixDigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
