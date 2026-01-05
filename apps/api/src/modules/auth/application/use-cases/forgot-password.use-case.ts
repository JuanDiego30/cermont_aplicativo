import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../../../prisma/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { maskEmailForLogs } from "../../../../common/utils/pii.util";
import * as crypto from "crypto";
import * as bcrypt from "bcryptjs";

export interface ForgotPasswordResult {
  message: string;
}

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);
  private readonly TOKEN_EXPIRATION_HOURS = 1;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.log("ForgotPasswordUseCase instantiated");
  }

  async execute(email: string): Promise<ForgotPasswordResult> {
    // Siempre devolver el mismo mensaje por seguridad
    // (no revelar si el email existe o no)
    const successMessage: ForgotPasswordResult = {
      message:
        "Si el email existe, recibirás instrucciones para resetear tu contraseña",
    };

    try {
      // 1. Buscar usuario por email
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true },
      });

      if (!user) {
        // Simular delay para evitar timing attacks
        await this.delay(500 + Math.random() * 500);
        this.logger.log(
          `Password reset requested for non-existent email: ${maskEmailForLogs(email)}`,
        );
        return successMessage;
      }

      // 2. Invalidar tokens anteriores del usuario (marcar como usados)
      await this.prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null, // Solo tokens no usados
          expiresAt: { gt: new Date() },
        },
        data: { usedAt: new Date() }, // Marcar como usado
      });

      // 3. Generar token único (32 bytes = 64 caracteres hex)
      const rawToken = crypto.randomBytes(32).toString("hex");

      // 4. Hashear token para guardarlo en DB
      const hashedToken = await bcrypt.hash(rawToken, 10);

      // 5. Calcular expiración (1 hora)
      const expiresAt = new Date(
        Date.now() + this.TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000,
      );

      // 6. Guardar token en base de datos
      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: hashedToken,
          expiresAt,
          // usedAt es null por defecto (no usado)
        },
      });

      // 7. Construir link de reset
      const frontendUrl = this.configService.get<string>(
        "FRONTEND_URL",
        "http://localhost:4200",
      );
      const resetLink = `${frontendUrl}/auth/reset-password?token=${rawToken}`;

      // 8. Emitir evento para enviar email (desacoplado)
      this.eventEmitter.emit("auth.password-reset.requested", {
        userId: user.id,
        email: user.email,
        name: user.name,
        resetLink,
        expiresAt,
      });

      this.logger.log(`Password reset token generated for user ${user.id}`);

      return successMessage;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error processing forgot password: ${err.message}`,
        err.stack,
      );
      // Retornar mensaje genérico por seguridad
      return successMessage;
    }
  }

  /**
   * Simula un delay para prevenir timing attacks
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
