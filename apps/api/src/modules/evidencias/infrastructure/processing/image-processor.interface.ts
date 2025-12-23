/**
 * @interface IImageProcessor
 * @description Abstraction for image processing
 */

export interface ImageProcessingResult {
    thumbnailPath?: string;
    metadata?: {
        width?: number;
        height?: number;
        format?: string;
    };
}

export interface IImageProcessor {
    /**
     * Process an image (compress, generate thumbnail, extract metadata)
     */
    processImage(filePath: string): Promise<ImageProcessingResult>;

    /**
     * Generate a thumbnail for an image
     */
    generateThumbnail(
        inputPath: string,
        outputPath: string,
        width?: number,
        height?: number,
    ): Promise<string>;

    /**
     * Compress an image
     */
    compress(inputPath: string, quality?: number): Promise<Buffer>;
}

/**
 * Token for dependency injection
 */
export const IMAGE_PROCESSOR = Symbol('IImageProcessor');
