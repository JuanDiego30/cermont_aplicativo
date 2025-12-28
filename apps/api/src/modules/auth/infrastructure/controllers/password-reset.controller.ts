/**
 * @controller PasswordResetController
 * @description Controlador para recuperación de contraseña
 * @layer Infrastructure
 */
import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../../../common/decorators/public.decorator';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { ValidateResetTokenUseCase } from '../../application/use-cases/validate-reset-token.use-case';
import {
    ForgotPasswordDtoSchema,
    ResetPasswordDtoSchema,
    ValidateResetTokenDtoSchema
} from '../../dto/password-reset.dto';

@ApiTags('Auth - Password Reset')
@Controller('auth')
export class PasswordResetController {
    private readonly logger = new Logger(PasswordResetController.name);

    constructor(
        private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
        private readonly resetPasswordUseCase: ResetPasswordUseCase,
        private readonly validateResetTokenUseCase: ValidateResetTokenUseCase,
    ) {
        this.logger.log('PasswordResetController instantiated');
    }

    /**
     * POST /api/auth/forgot-password
     * Envía email con link de reset de contraseña
     */
    @Post('forgot-password')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Solicitar reset de contraseña',
        description: 'Envía un email con link para resetear contraseña (válido por 1 hora)'
    })
    @ApiResponse({
        status: 200,
        description: 'Email enviado (siempre retorna 200 por seguridad)',
        schema: {
            example: {
                message: 'Si el email existe, recibirás instrucciones para resetear tu contraseña'
            }
        }
    })
    async forgotPassword(@Body() body: unknown) {
        const parseResult = ForgotPasswordDtoSchema.safeParse(body);
        if (!parseResult.success) {
            const errors = parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
            throw new BadRequestException(`Validación fallida: ${errors}`);
        }

        const { email } = parseResult.data;
        this.logger.log(`Password reset requested for email: ${email}`);

        return await this.forgotPasswordUseCase.execute(email);
    }

    /**
     * POST /api/auth/validate-reset-token
     * Valida que el token sea válido antes de mostrar formulario
     */
    @Post('validate-reset-token')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Validar token de reset',
        description: 'Verifica que el token sea válido y no haya expirado'
    })
    @ApiResponse({
        status: 200,
        description: 'Token válido',
        schema: {
            example: {
                valid: true,
                email: 'usuario@ejemplo.com'
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
    async validateResetToken(@Body() body: unknown) {
        const parseResult = ValidateResetTokenDtoSchema.safeParse(body);
        if (!parseResult.success) {
            const errors = parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
            throw new BadRequestException(`Validación fallida: ${errors}`);
        }

        const { token } = parseResult.data;
        this.logger.log('Reset token validation requested');

        return await this.validateResetTokenUseCase.execute(token);
    }

    /**
     * POST /api/auth/reset-password
     * Resetea la contraseña usando el token
     */
    @Post('reset-password')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Resetear contraseña',
        description: 'Cambia la contraseña del usuario usando el token válido'
    })
    @ApiResponse({
        status: 200,
        description: 'Contraseña actualizada',
        schema: {
            example: {
                message: 'Contraseña actualizada exitosamente'
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
    async resetPassword(@Body() body: unknown) {
        const parseResult = ResetPasswordDtoSchema.safeParse(body);
        if (!parseResult.success) {
            const errors = parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
            throw new BadRequestException(`Validación fallida: ${errors}`);
        }

        const { token, newPassword } = parseResult.data;
        this.logger.log('Password reset requested');

        return await this.resetPasswordUseCase.execute(token, newPassword);
    }
}
