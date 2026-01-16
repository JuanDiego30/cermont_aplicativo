/**
 * @service SharpImageProcessor
 * @description Image processing using Sharp library
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { normalizeRelativePath, resolveSafePath } from '../storage/safe-path';
import { IImageProcessor, ImageProcessingResult } from './image-processor.interface';

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
      this.logger.warn('Sharp not installed. Image processing will be limited.');
    }
  }

  async processImage(filePath: string): Promise<ImageProcessingResult> {
    const safeRelative = normalizeRelativePath(filePath);
    const fullPath = resolveSafePath(this.basePath, safeRelative);

    if (!sharp) {
      this.logger.warn('Sharp not available, skipping image processing');
      return {};
    }

    try {
      const image = sharp(fullPath);
      const metadata = await image.metadata();

      const thumb150Path = this.getThumbnailPath(safeRelative, 150);
      const thumb300Path = this.getThumbnailPath(safeRelative, 300);
      const thumb150FullPath = resolveSafePath(this.basePath, thumb150Path);
      const thumb300FullPath = resolveSafePath(this.basePath, thumb300Path);

      await fs.mkdir(path.dirname(thumb150FullPath), { recursive: true });
      await fs.mkdir(path.dirname(thumb300FullPath), { recursive: true });

      await sharp(fullPath)
        .resize(150, 150, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumb150FullPath);

      await sharp(fullPath)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumb300FullPath);

      this.logger.log(`Thumbnails generated`, { thumb150Path, thumb300Path });

      return {
        thumbnailPath: thumb150Path,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          thumbnails: {
            s150: thumb150Path,
            s300: thumb300Path,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Image processing failed`, {
        path: safeRelative,
        error: (error as Error).message,
      });
      return {};
    }
  }

  async generateThumbnail(
    inputPath: string,
    outputPath: string,
    width: number = 200,
    height: number = 200
  ): Promise<string> {
    if (!sharp) {
      throw new Error('Sharp not available');
    }

    const safeInput = normalizeRelativePath(inputPath);
    const safeOutput = normalizeRelativePath(outputPath);
    const inputFullPath = resolveSafePath(this.basePath, safeInput);
    const outputFullPath = resolveSafePath(this.basePath, safeOutput);

    await fs.mkdir(path.dirname(outputFullPath), { recursive: true });

    await sharp(inputFullPath)
      .resize(width, height, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(outputFullPath);

    return safeOutput;
  }

  async compress(inputPath: string, quality: number = 80): Promise<Buffer> {
    const safeInput = normalizeRelativePath(inputPath);
    if (!sharp) {
      // Just return the original file
      const fullPath = resolveSafePath(this.basePath, safeInput);
      return fs.readFile(fullPath);
    }

    const fullPath = resolveSafePath(this.basePath, safeInput);
    return sharp(fullPath).jpeg({ quality }).toBuffer();
  }

  private getThumbnailPath(originalPath: string, size: 150 | 300): string {
    const dir = path.posix.dirname(originalPath);
    const filename = path.posix.basename(originalPath, path.posix.extname(originalPath));
    return path.posix.join(dir, 'thumbnails', String(size), `${filename}-thumb.jpg`);
  }
}
