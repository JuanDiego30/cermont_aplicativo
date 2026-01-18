/**
 * @controller Auth2FAController
 * @description Controlador para autenticación de dos factores (2FA)
 * @layer Infrastructure
 */
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CurrentUser, JwtPayload } from '../../../../shared/decorators/current-user.decorator';
import { Public } from '../../../../shared/decorators/public.decorator';
import { ThrottleAuth } from '../../../../shared/decorators/throttle.decorator';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { ActivateTotpUseCase } from '../../application/use-cases/activate-totp.use-case';
import { Send2FACodeUseCase } from '../../application/use-cases/send-2fa-code.use-case';
import { SetupTotpUseCase } from '../../application/use-cases/setup-totp.use-case';
import { Toggle2FAUseCase } from '../../application/use-cases/toggle-2fa.use-case';
import { Verify2FACodeUseCase } from '../../application/use-cases/verify-2fa-code.use-case';
import { Enable2FADto, Request2FACodeDto, Verify2FACodeDto } from '../../dto/two-factor.dto';

@ApiTags('Auth - Two-Factor Authentication')
@Controller('auth/2fa')
export class Auth2FAController {
  private readonly logger = new Logger(Auth2FAController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly send2FACodeUseCase: Send2FACodeUseCase,
    private readonly verify2FACodeUseCase: Verify2FACodeUseCase,
    private readonly toggle2FAUseCase: Toggle2FAUseCase,
    private readonly setupTotpUseCase: SetupTotpUseCase,
    private readonly activateTotpUseCase: ActivateTotpUseCase
  ) {}

  /**
   * POST /api/auth/2fa/send
   * Envía código de verificación por email
   */
  @Post('send')
  @Public()
  @ThrottleAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar código 2FA',
    description:
      'Envía un código de 6 dígitos al email del usuario para autenticación de dos factores',
  })
  @ApiBody({ type: Request2FACodeDto })
  @ApiResponse({
    status: 200,
    description: 'Código enviado exitosamente',
    schema: {
      example: {
        message: 'Código de verificación enviado exitosamente',
        expiresIn: 300,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 400, description: 'Usuario no tiene 2FA habilitado' })
  async sendCode(@Body() dto: Request2FACodeDto) {
    this.logger.log('2FA code request received');

    return await this.send2FACodeUseCase.execute(dto.email);
  }

  /**
   * POST /api/auth/2fa/verify
   * Verifica el código 2FA
   */
  @Post('verify')
  @Public()
  @ThrottleAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar código 2FA',
    description: 'Verifica el código de 6 dígitos proporcionado por el usuario',
  })
  @ApiBody({ type: Verify2FACodeDto })
  @ApiResponse({
    status: 200,
    description: 'Código válido',
    schema: {
      example: {
        valid: true,
        userId: 'uuid-del-usuario',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Código inválido o expirado' })
  async verifyCode(@Body() dto: Verify2FACodeDto) {
    this.logger.log('2FA verification attempt received');

    return await this.verify2FACodeUseCase.execute(dto.email, dto.code);
  }

  /**
   * POST /api/auth/2fa/toggle
   * Habilita o deshabilita 2FA para el usuario autenticado
   */
  @Post('toggle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Habilitar/Deshabilitar 2FA',
    description:
      'Permite al usuario autenticado activar o desactivar la autenticación de dos factores',
  })
  @ApiBody({ type: Enable2FADto })
  @ApiResponse({
    status: 200,
    description: '2FA actualizado',
    schema: {
      example: {
        twoFactorEnabled: true,
        message: 'Autenticación de dos factores habilitada exitosamente',
      },
    },
  })
  async toggleTwoFactor(@CurrentUser() user: JwtPayload, @Body() dto: Enable2FADto) {
    this.logger.log(`Toggle 2FA request for user: ${user.userId}, enable: ${dto.enable}`);

    return await this.toggle2FAUseCase.execute(user.userId, dto.enable);
  }

  /**
   * GET /api/auth/2fa/status
   * Obtiene el estado de 2FA del usuario autenticado
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener estado 2FA',
    description: 'Retorna si el usuario tiene habilitada la autenticación de dos factores',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de 2FA',
    schema: {
      example: {
        twoFactorEnabled: true,
      },
    },
  })
  async getTwoFactorStatus(@CurrentUser() user: JwtPayload) {
    const record = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { twoFactorEnabled: true, role: true },
    });

    return {
      twoFactorEnabled: Boolean(record?.twoFactorEnabled),
    };
  }

  /**
   * GET /api/auth/2fa/setup
   * Genera secreto y retorna QR
   */
  @Get('setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Iniciar configuración 2FA (Enrollment)',
    description: 'Genera un nuevo secreto TOTP y retorna el DataURL del código QR para escanear',
  })
  @ApiResponse({
    status: 200,
    description: 'QR Generado',
    schema: {
      example: {
        secret: 'KVKFK43...',
        qrCode: 'data:image/png;base64,...',
      },
    },
  })
  async setup(@CurrentUser() user: JwtPayload) {
    // We assume the user has an email in the payload, if not fetch it.
    // Our token has email.
    return await this.setupTotpUseCase.execute(user.userId, user.email);
  }

  /**
   * POST /api/auth/2fa/activate
   * Verifica el TOTP y activa 2FA
   */
  @Post('activate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Activar 2FA con código TOTP',
    description: 'Verifica el código generado por Google Authenticator y activa el 2FA en la cuenta',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: '123456' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '2FA Activado exitosamente' })
  @ApiResponse({ status: 401, description: 'Código inválido' })
  async activate(@CurrentUser() user: JwtPayload, @Body('code') code: string) {
    const result = await this.activateTotpUseCase.execute(user.userId, code);
    return {
      message: '2FA activado correctamente',
      enabled: result,
    };
  }
}

