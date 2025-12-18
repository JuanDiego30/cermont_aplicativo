
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SendEmailDto } from '../../application/dto/send-email.dto';
import { SendEmailUseCase } from '../../application/use-cases/send-email.use-case';
import { SendBulkEmailsUseCase } from '../../application/use-cases/send-bulk-emails.use-case';
// import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'; // Assuming global guard or apply here
// import { RolesGuard } from '@/common/guards/roles.guard';
// import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Email')
@Controller('email')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
export class EmailController {
    constructor(
        private readonly sendEmailUseCase: SendEmailUseCase,
        private readonly sendBulkEmailsUseCase: SendBulkEmailsUseCase,
    ) { }

    @Post('send')
    @ApiOperation({ summary: 'Enviar un correo electrónico individual' })
    @ApiResponse({ status: 200, description: 'Correo enviado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    // @Roles('admin', 'system') 
    async sendEmail(@Body() dto: SendEmailDto) {
        return this.sendEmailUseCase.execute(dto);
    }

    @Post('send-bulk')
    @ApiOperation({ summary: 'Enviar correos masivos' })
    @ApiResponse({ status: 200, description: 'Proceso de envío iniciado' })
    // @Roles('admin')
    async sendBulkEmails(@Body() dtos: SendEmailDto[]) {
        return this.sendBulkEmailsUseCase.execute(dtos);
    }
}
