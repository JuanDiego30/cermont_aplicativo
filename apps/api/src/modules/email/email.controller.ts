import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Email')
@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @Get('auth-url')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener URL de autorización de Gmail' })
    async getAuthUrl(@CurrentUser() user: any) {
        return this.emailService.getAuthUrl(user.id);
    }

    @Get('callback')
    @ApiOperation({ summary: 'Callback de OAuth2 (redirigido por Google)' })
    @ApiQuery({ name: 'code', required: true })
    @ApiQuery({ name: 'state', required: false, description: 'User ID' })
    async callback(
        @Query('code') code: string,
        @Query('state') userId?: string
    ) {
        // state contains userId passed in getAuthUrl
        return this.emailService.handleCallback(code, userId || 'default');
    }

    @Get('status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Verificar si Gmail está conectado' })
    async getStatus(@CurrentUser() user: any) {
        const isAuthorized = this.emailService.isAuthorized(user.id);
        return { connected: isAuthorized };
    }

    @Get('list')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar correos de Gmail' })
    @ApiQuery({ name: 'maxResults', required: false, type: Number })
    @ApiQuery({ name: 'query', required: false, type: String })
    async listEmails(
        @CurrentUser() user: any,
        @Query('maxResults') maxResults?: number,
        @Query('query') query?: string
    ) {
        const emails = await this.emailService.listEmails(user.id, {
            maxResults: maxResults || 20,
            query,
        });
        return { data: emails, total: emails.length };
    }

    @Post('send')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Enviar correo vía Gmail' })
    async sendEmail(
        @CurrentUser() user: any,
        @Body() body: { to: string; subject: string; body: string }
    ) {
        return this.emailService.sendEmail(user.id, body.to, body.subject, body.body);
    }

    @Get('labels')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener etiquetas de Gmail' })
    async getLabels(@CurrentUser() user: any) {
        const labels = await this.emailService.getLabels(user.id);
        return { data: labels };
    }
}
