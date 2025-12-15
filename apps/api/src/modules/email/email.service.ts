
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

export interface EmailMessage {
    id: string;
    from: string;
    subject: string;
    snippet: string;
    date: string;
    read: boolean;
}

export interface EmailContent {
    id: string;
    from?: string;
    to?: string;
    subject?: string;
    date?: string;
    body: string;
}

@Injectable()
export class EmailService {
    private readonly gmail = google.gmail('v1');
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;

    constructor(private configService: ConfigService) {
        this.clientId = this.configService.get('GOOGLE_CLIENT_ID') || '';
        this.clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET') || '';
        this.redirectUri = this.configService.get('GOOGLE_REDIRECT_URI') ||
            'http://localhost:3001/api/emails/auth-callback';
    }

    /**
     * Obtener URL para que usuario autorice la aplicación
     */
    getAuthUrl(): string {
        const oauth2Client = new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            this.redirectUri
        );

        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/gmail.readonly'],
            prompt: 'consent', // Force refresh token generation
        });
    }

    /**
     * Intercambiar código por tokens
     */
    async getTokensFromCode(code: string) {
        const oauth2Client = new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            this.redirectUri
        );

        try {
            const { tokens } = await oauth2Client.getToken(code);
            return tokens;
        } catch (error) {
            console.error('Error getting tokens from code:', error);
            throw new Error('Failed to authenticate with Google');
        }
    }

    /**
     * Obtener emails usando access token
     */
    async getEmails(
        accessToken: string,
        maxResults: number = 10,
        query?: string
    ): Promise<EmailMessage[]> {
        const oauth2Client = new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            this.redirectUri
        );

        oauth2Client.setCredentials({ access_token: accessToken });

        try {
            // Listar message IDs
            const response = await this.gmail.users.messages.list({
                auth: oauth2Client,
                userId: 'me',
                q: query || 'from:cermont@* OR to:cermont@*',
                maxResults,
            });

            if (!response.data.messages) {
                return [];
            }

            // Obtener detalles de cada message
            const emailDetails = await Promise.all(
                response.data.messages.map((msg) =>
                    this.gmail.users.messages.get({
                        auth: oauth2Client,
                        userId: 'me',
                        id: msg.id!,
                    })
                )
            );

            // Parsear respuestas
            return emailDetails.map((detail) => {
                const msg = detail.data;
                const headers = msg.payload?.headers || [];
                const fromHeader = headers.find((h) => h.name === 'From');
                const subjectHeader = headers.find((h) => h.name === 'Subject');
                const dateHeader = headers.find((h) => h.name === 'Date');

                return {
                    id: msg.id!,
                    from: fromHeader?.value || 'Unknown',
                    subject: subjectHeader?.value || '(no subject)',
                    snippet: msg.snippet || '',
                    date: dateHeader?.value || new Date().toISOString(),
                    read: !msg.labelIds?.includes('UNREAD'),
                };
            });
        } catch (error) {
            console.error('Error fetching emails:', error);
            throw new Error('Failed to fetch emails from Gmail');
        }
    }

    /**
     * Obtener contenido completo de un email
     */
    async getEmailContent(accessToken: string, messageId: string): Promise<EmailContent> {
        const oauth2Client = new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            this.redirectUri
        );

        oauth2Client.setCredentials({ access_token: accessToken });

        try {
            const response = await this.gmail.users.messages.get({
                auth: oauth2Client,
                userId: 'me',
                id: messageId,
                format: 'full',
            });

            const msg = response.data;
            const headers = msg.payload?.headers || [];

            // Logic to extract body is a bit complex due to multipart
            let body = '';
            if (msg.payload?.body?.data) {
                body = Buffer.from(msg.payload.body.data, 'base64').toString();
            } else if (msg.payload?.parts) {
                const part = msg.payload.parts.find(p => p.mimeType === 'text/html') ||
                    msg.payload.parts.find(p => p.mimeType === 'text/plain');
                if (part && part.body?.data) {
                    body = Buffer.from(part.body.data, 'base64').toString();
                }
            }

            return {
                id: msg.id!,
                from: headers.find((h) => h.name === 'From')?.value ?? undefined,
                to: headers.find((h) => h.name === 'To')?.value ?? undefined,
                subject: headers.find((h) => h.name === 'Subject')?.value ?? undefined,
                date: headers.find((h) => h.name === 'Date')?.value ?? undefined,
                body,
            };
        } catch (error) {
            console.error('Error fetching email content:', error);
            throw new Error('Failed to fetch email content');
        }
    }
}
