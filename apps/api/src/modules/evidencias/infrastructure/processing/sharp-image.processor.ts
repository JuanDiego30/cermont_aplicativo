/**
 * @service SharpImageProcessor
 * @description Image processing using Sharp library
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
    IImageProcessor,
    ImageProcessingResult,
} from './image-processor.interface';

// Sharp can be optionally imported
let sharp: typeof import('sharp') | null = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sharp = require('sharp');
} catch {
    // Sharp not available
}

@Injectable()
export class SharpImageProcessor implements IImageProcessor {
    private readonly logger = new Logger(SharpImageProcessor.name);
    private readonly basePath: string;

    constructor(private readonly config: ConfigService) {
        this.basePath = this.config.get<string>('UPLOAD_PATH', './uploads');

        if (!sharp) {
            this.logger.warn(
                'Sharp not installed. Image processing will be limited.',
            );
        }
    }

    async processImage(filePath: string): Promise<ImageProcessingResult> {
        const fullPath = path.join(this.basePath, filePath);

        if (!sharp) {
            this.logger.warn('Sharp not available, skipping image processing');
            return {};
        }

        try {
            const image = sharp(fullPath);
            const metadata = await image.metadata();

            // Generate thumbnail
            const thumbnailPath = this.getThumbnailPath(filePath);
            const thumbnailFullPath = path.join(this.basePath, thumbnailPath);

            // Ensure thumbnail directory exists
            await fs.mkdir(path.dirname(thumbnailFullPath), { recursive: true });

            await image
                .resize(200, 200, { fit: 'cover' })
                .jpeg({ quality: 80 })
                .toFile(thumbnailFullPath);

            this.logger.log(`Thumbnail generated: ${thumbnailPath}`);

            return {
                thumbnailPath,
                metadata: {
                    width: metadata.width,
                    height: metadata.height,
                    format: metadata.format,
                },
            };
        } catch (error) {
            this.logger.error(`Image processing failed: ${filePath}`, {
                error: (error as Error).message,
            });
            return {};
        }
    }

    async generateThumbnail(
        inputPath: string,
        outputPath: string,
        width: number = 200,
        height: number = 200,
    ): Promise<string> {
        if (!sharp) {
            throw new Error('Sharp not available');
        }

        const inputFullPath = path.join(this.basePath, inputPath);
        const outputFullPath = path.join(this.basePath, outputPath);

        await fs.mkdir(path.dirname(outputFullPath), { recursive: true });

        await sharp(inputFullPath)
            .resize(width, height, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toFile(outputFullPath);

        return outputPath;
    }

    async compress(inputPath: string, quality: number = 80): Promise<Buffer> {
        if (!sharp) {
            // Just return the original file
            const fullPath = path.join(this.basePath, inputPath);
            return fs.readFile(fullPath);
        }

        const fullPath = path.join(this.basePath, inputPath);
        return sharp(fullPath).jpeg({ quality }).toBuffer();
    }

    private getThumbnailPath(originalPath: string): string {
        const dir = path.dirname(originalPath);
        const filename = path.basename(originalPath, path.extname(originalPath));
        return path.join(dir, 'thumbnails', `${filename}-thumb.jpg`);
    }
}
