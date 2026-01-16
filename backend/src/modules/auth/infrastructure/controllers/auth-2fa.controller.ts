/**
 * @controller Auth2FAController
 * @description Controlador para autenticación de dos factores (2FA)
 * @layer Infrastructure
 */
import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../../../shared/decorators/current-user.decorator';
import { Public } from '../../../../shared/decorators/public.decorator';
import { ThrottleAuth } from '../../../../shared/decorators/throttle.decorator';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Send2FACodeUseCase } from '../../application/use-cases/send-2fa-code.use-case';
import { Verify2FACodeUseCase } from '../../application/use-cases/verify-2fa-code.use-case';
import { Toggle2FAUseCase } from '../../application/use-cases/toggle-2fa.use-case';
import { Request2FACodeDto, Verify2FACodeDto, Enable2FADto } from '../../dto/two-factor.dto';

@ApiTags('Auth - Two-Factor Authentication')
@Controller('auth/2fa')
export class Auth2FAController {
  private readonly logger = new Logger(Auth2FAController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly send2FACodeUseCase: Send2FACodeUseCase,
    private readonly verify2FACodeUseCase: Verify2FACodeUseCase,
    private readonly toggle2FAUseCase: Toggle2FAUseCase
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
}
