/**
 * @service EmailService
 * @description Full Gmail OAuth2 integration for Cermont
 * Requires: googleapis package
 * 
 * Environment Variables needed:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - GOOGLE_REDIRECT_URI
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, gmail_v1 } from 'googleapis';

interface GmailToken {
    access_token: string;
    refresh_token?: string;
    scope: string;
    token_type: string;
    expiry_date: number;
}

export interface EmailMessage {
    id: string;
    threadId: string;
    subject: string;
    from: string;
    to: string;
    date: string;
    snippet: string;
    labelIds: string[];
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private oauth2Client: any;
    private tokens: Map<string, GmailToken> = new Map(); // userId -> tokens

    constructor(private readonly configService: ConfigService) {
        const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
        const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI')
            || 'http://localhost:4000/email/callback';

        this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    }

    /**
     * Generate OAuth2 authorization URL
     */
    getAuthUrl(userId: string): { url: string } {
        const scopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.labels',
        ];

        const url = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            state: userId, // Pass userId to associate tokens later
            prompt: 'consent', // Force consent to get refresh_token
        });

        return { url };
    }

    /**
     * Handle OAuth2 callback and store tokens
     */
    async handleCallback(code: string, userId: string): Promise<{ success: boolean; message: string }> {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);

            if (!tokens.access_token) {
                throw new Error('No access token received');
            }

            // Store tokens for this user
            this.tokens.set(userId, {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token || undefined,
                scope: tokens.scope || '',
                token_type: tokens.token_type || 'Bearer',
                expiry_date: tokens.expiry_date || Date.now() + 3600000,
            });

            this.logger.log(`Gmail authorized for user: ${userId}`);
            return { success: true, message: 'Gmail conectado exitosamente' };
        } catch (error) {
            this.logger.error('Gmail OAuth error:', error);
            return { success: false, message: 'Error al conectar Gmail' };
        }
    }

    /**
     * Check if user has valid tokens
     */
    isAuthorized(userId: string): boolean {
        const token = this.tokens.get(userId);
        if (!token) return false;

        // Check if token is expired (with 5 min buffer)
        return token.expiry_date > Date.now() + 300000;
    }

    /**
     * List emails from Gmail
     */
    async listEmails(
        userId: string,
        options: { maxResults?: number; labelIds?: string[]; query?: string } = {}
    ): Promise<EmailMessage[]> {
        const token = this.tokens.get(userId);
        if (!token) {
            throw new Error('Usuario no autorizado. Por favor conecte Gmail.');
        }

        this.oauth2Client.setCredentials(token);
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

        try {
            const response = await gmail.users.messages.list({
                userId: 'me',
                maxResults: options.maxResults || 20,
                labelIds: options.labelIds || ['INBOX'],
                q: options.query,
            });

            const messages = response.data.messages || [];
            const emails: EmailMessage[] = [];

            // Fetch details for each message
            for (const msg of messages.slice(0, 20)) { // Limit to 20 for performance
                if (!msg.id) continue;

                const detail = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id,
                    format: 'metadata',
                    metadataHeaders: ['Subject', 'From', 'To', 'Date'],
                });

                const headers = detail.data.payload?.headers || [];
                const getHeader = (name: string) =>
                    headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

                emails.push({
                    id: msg.id,
                    threadId: msg.threadId || '',
                    subject: getHeader('Subject'),
                    from: getHeader('From'),
                    to: getHeader('To'),
                    date: getHeader('Date'),
                    snippet: detail.data.snippet || '',
                    labelIds: detail.data.labelIds || [],
                });
            }

            return emails;
        } catch (error) {
            this.logger.error('Error fetching emails:', error);
            throw new Error('Error al obtener correos');
        }
    }

    /**
     * Send an email via Gmail
     */
    async sendEmail(
        userId: string,
        to: string,
        subject: string,
        body: string
    ): Promise<{ success: boolean; messageId?: string }> {
        const token = this.tokens.get(userId);
        if (!token) {
            throw new Error('Usuario no autorizado');
        }

        this.oauth2Client.setCredentials(token);
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

        // Create email in RFC 2822 format
        const email = [
            `To: ${to}`,
            `Subject: ${subject}`,
            'Content-Type: text/html; charset=utf-8',
            '',
            body,
        ].join('\r\n');

        const encodedEmail = Buffer.from(email)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        try {
            const response = await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedEmail,
                },
            });

            return { success: true, messageId: response.data.id || undefined };
        } catch (error) {
            this.logger.error('Error sending email:', error);
            return { success: false };
        }
    }

    /**
     * Get Gmail labels
     */
    async getLabels(userId: string): Promise<gmail_v1.Schema$Label[]> {
        const token = this.tokens.get(userId);
        if (!token) {
            throw new Error('Usuario no autorizado');
        }

        this.oauth2Client.setCredentials(token);
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

        const response = await gmail.users.labels.list({ userId: 'me' });
        return response.data.labels || [];
    }
}
