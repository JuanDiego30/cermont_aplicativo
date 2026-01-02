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

    private normalizeRelativePath(filePath: string): string {
        const normalized = filePath.replace(/\\/g, '/');
        if (path.isAbsolute(normalized)) {
            throw new Error('Absolute paths are not allowed');
        }
        if (normalized.includes('..')) {
            throw new Error('Path traversal is not allowed');
        }
        return normalized;
    }

    private resolveSafePath(filePath: string): string {
        const relative = this.normalizeRelativePath(filePath);
        const base = path.resolve(this.basePath);
        const full = path.resolve(base, relative);

        // Ensure the resolved path is within base
        if (full !== base && !full.startsWith(base + path.sep)) {
            throw new Error('Invalid storage path');
        }

        return full;
    }

    async upload(buffer: Buffer, filePath: string): Promise<UploadResult> {
        const safeRelative = this.normalizeRelativePath(filePath);
        const fullPath = this.resolveSafePath(safeRelative);
        const directory = path.dirname(fullPath);

        // Ensure directory exists
        await fs.mkdir(directory, { recursive: true });

        // Write file
        await fs.writeFile(fullPath, buffer);

        // Do not log full paths
        this.logger.log(`File saved`, { path: safeRelative, size: buffer.length });

        return {
            path: safeRelative,
            url: `${this.baseUrl}/uploads/${safeRelative}`,
            size: buffer.length,
        };
    }

    async download(filePath: string): Promise<Buffer> {
        const safeRelative = this.normalizeRelativePath(filePath);
        const fullPath = this.resolveSafePath(safeRelative);

        try {
            return await fs.readFile(fullPath);
        } catch (error) {
            this.logger.error(`Failed to read file`, { path: safeRelative });
            throw new Error(`File not found: ${filePath}`);
        }
    }

    async delete(filePath: string): Promise<void> {
        const safeRelative = this.normalizeRelativePath(filePath);
        const fullPath = this.resolveSafePath(safeRelative);

        try {
            await fs.unlink(fullPath);
            this.logger.log(`File deleted`, { path: safeRelative });
        } catch (error) {
            this.logger.warn(`File not found for deletion`, { path: safeRelative });
        }
    }

    async exists(filePath: string): Promise<boolean> {
        const safeRelative = this.normalizeRelativePath(filePath);
        const fullPath = this.resolveSafePath(safeRelative);

        try {
            await fs.access(fullPath);
            return true;
        } catch {
            return false;
        }
    }

    async getUrl(filePath: string): Promise<string> {
        const safeRelative = this.normalizeRelativePath(filePath);
        return `${this.baseUrl}/uploads/${safeRelative}`;
    }
}
