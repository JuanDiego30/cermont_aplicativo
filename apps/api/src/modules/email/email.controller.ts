
import { Controller, Get, Post, Body, Query, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmailService } from './email.service';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

interface UserWithGmail extends JwtPayload {
    gmail_access_token?: string;
}

@Controller('emails')
@UseGuards(JwtAuthGuard)
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    /**
     * GET /api/emails/auth-url
     * Obtener URL para autorizarse con Google
     */
    @Get('auth-url')
    getAuthUrl() {
        return {
            authUrl: this.emailService.getAuthUrl(),
            message: 'Abre este URL para autorizar acceso a Gmail',
        };
    }

    /**
     * POST /api/emails/auth-callback
     * Callback después de autorizar en Google
     */
    @Post('auth-callback')
    async authCallback(
        @Body() body: { code: string },
        @CurrentUser() user: JwtPayload
    ) {
        try {
            const tokens = await this.emailService.getTokensFromCode(body.code);
            // NOTE: In a real app, save tokens to DB associated with user.
            // For this implementation, we return it to frontend to store in session/state.
            return {
                success: true,
                message: 'Gmail authorized successfully',
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * GET /api/emails?maxResults=10&query=from:cermont
     * Obtener lista de emails
     */
    @Get()
    async getEmails(
        @Query('accessToken') accessToken: string,
        @Query('maxResults') maxResults?: string,
        @Query('query') query?: string
    ) {
        try {
            if (!accessToken) {
                return {
                    success: false,
                    error: 'No Gmail authorization token found. Please authorize first.',
                };
            }

            const emails = await this.emailService.getEmails(
                accessToken,
                parseInt(maxResults || '10'),
                query
            );

            return {
                success: true,
                emails,
                count: emails.length,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch emails',
            };
        }
    }

    /**
     * GET /api/emails/:messageId
     * Obtener contenido completo de un email
     */
    @Get(':messageId')
    async getEmailContent(
        @Query('accessToken') accessToken: string,
        @Query('messageId') messageIdParam: string // fallback if param not working
    ) {
        // Note: messageId should come from @Param('messageId') but keeping simple for now
        try {
            if (!accessToken) {
                return {
                    success: false,
                    error: 'No Gmail authorization token found',
                };
            }

            return {
                success: false,
                error: 'Use GET /api/emails/content/:messageId endpoint',
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch email',
            };
        }
    }

    @Get('content/:messageId')
    async getEmailContentReal(
        @Query('accessToken') accessToken: string,
        @Param('messageId') messageId: string
    ) {
        try {
            if (!accessToken) {
                return {
                    success: false,
                    error: 'No Gmail authorization token found',
                };
            }

            const emailContent = await this.emailService.getEmailContent(accessToken, messageId);
            return { success: true, email: emailContent };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch email',
            };
        }
    }
}
