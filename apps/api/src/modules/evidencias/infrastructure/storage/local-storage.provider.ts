/**
 * @service LocalStorageProvider
 * @description Local filesystem storage implementation
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IStorageProvider, UploadResult } from './storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
    private readonly logger = new Logger(LocalStorageProvider.name);
    private readonly basePath: string;
    private readonly baseUrl: string;

    constructor(private readonly config: ConfigService) {
        this.basePath = this.config.get<string>('UPLOAD_PATH', './uploads');
        this.baseUrl = this.config.get<string>('BASE_URL', 'http://localhost:3001');
    }

    async upload(buffer: Buffer, filePath: string): Promise<UploadResult> {
        const fullPath = path.join(this.basePath, filePath);
        const directory = path.dirname(fullPath);

        // Ensure directory exists
        await fs.mkdir(directory, { recursive: true });

        // Write file
        await fs.writeFile(fullPath, buffer);

        this.logger.log(`File saved to ${fullPath}`);

        return {
            path: filePath,
            url: `${this.baseUrl}/uploads/${filePath}`,
            size: buffer.length,
        };
    }

    async download(filePath: string): Promise<Buffer> {
        const fullPath = path.join(this.basePath, filePath);

        try {
            return await fs.readFile(fullPath);
        } catch (error) {
            this.logger.error(`Failed to read file: ${filePath}`);
            throw new Error(`File not found: ${filePath}`);
        }
    }

    async delete(filePath: string): Promise<void> {
        const fullPath = path.join(this.basePath, filePath);

        try {
            await fs.unlink(fullPath);
            this.logger.log(`File deleted: ${filePath}`);
        } catch (error) {
            this.logger.warn(`File not found for deletion: ${filePath}`);
        }
    }

    async exists(filePath: string): Promise<boolean> {
        const fullPath = path.join(this.basePath, filePath);

        try {
            await fs.access(fullPath);
            return true;
        } catch {
            return false;
        }
    }

    async getUrl(filePath: string): Promise<string> {
        return `${this.baseUrl}/uploads/${filePath}`;
    }
}
