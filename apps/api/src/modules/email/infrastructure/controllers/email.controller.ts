import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { SendEmailUseCase } from '../../application/use-cases/send-email.use-case';
import { SendEmailDto } from '../../application/dto/send-email.dto';

/**
 * Controller: Email
 * Endpoints para envío de emails siguiendo arquitectura DDD
 */
@ApiTags('Email')
@Controller('email')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class EmailController {
    constructor(private readonly sendEmailUseCase: SendEmailUseCase) { }

    /**
     * POST /api/email/send
     * Enviar un email a uno o más destinatarios
     */
    @Post('send')
    @Roles('admin', 'supervisor')
    @ApiOperation({
        summary: 'Enviar email',
        description: 'Envía un email a uno o más destinatarios. Requiere rol ADMIN o SUPERVISOR.',
    })
    @ApiResponse({
        status: 201,
        description: 'Email enviado exitosamente',
        schema: {
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Email enviado' },
                messageId: { type: 'string', example: '<abc123@smtp.mailtrap.io>' },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de email inválidos',
    })
    @ApiResponse({
        status: 401,
        description: 'No autenticado',
    })
    @ApiResponse({
        status: 403,
        description: 'Sin permisos para enviar emails',
    })
    async sendEmail(@Body() dto: SendEmailDto) {
        const result = await this.sendEmailUseCase.execute(dto);

        return {
            success: result.success,
            message: result.success ? 'Email enviado' : 'Error al enviar email',
            messageId: result.messageId,
            error: result.error,
        };
    }
}
