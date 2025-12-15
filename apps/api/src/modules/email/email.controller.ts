import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Email')
@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @Get('auth-url')
    @ApiOperation({ summary: 'Obtener URL de autorización de Gmail' })
    async getAuthUrl() {
        return this.emailService.getAuthUrl();
    }

    @Get('callback')
    @ApiOperation({ summary: 'Callback de OAuth2' })
    async callback(@Query('code') code: string) {
        return this.emailService.handleCallback(code);
    }

    @Get('list')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Listar correos' })
    async listEmails() {
        return this.emailService.listEmails();
    }
}
