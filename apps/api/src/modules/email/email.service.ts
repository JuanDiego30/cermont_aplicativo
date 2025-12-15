import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
    constructor(private readonly configService: ConfigService) { }

    async getAuthUrl() {
        return { url: 'https://accounts.google.com/o/oauth2/v2/auth' };
    }

    async handleCallback(code: string) {
        return { message: 'Callback received', code };
    }

    async listEmails() {
        return [];
    }
}
