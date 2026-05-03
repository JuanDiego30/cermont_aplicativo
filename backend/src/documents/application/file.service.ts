/**
 * File Service for Cermont Backend
 *
 * Handles file processing and storage:
 * - Sharp compression and format conversion (WebP/JPEG)
 * - Random filename generation with UUID
 * - Storage outside web root for security
 * - ClamAV integration placeholder (TODO)
 */

import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import sharp from "sharp";
import { BadRequestError } from "../../_shared/common/errors";
import { createLogger } from "../../_shared/common/utils";
import { env } from "../../_shared/config/env";
import { scanWithClamAV } from "../../_shared/middlewares/uploadMiddleware";

const log = createLogger("file-service");

export const UPLOAD_SUBDIRS = {
	EVIDENCES: "evidences",
	DOCUMENTS: "documents",
	PHOTOS: "photos",
} as const;

export type UploadSubdir = (typeof UPLOAD_SUBDIRS)[keyof typeof UPLOAD_SUBDIRS];

export interface ProcessedFile {
	filename: string;
	originalName: string;
	mimeType: string;
	size: number;
	width?: number;
	height?: number;
	urlPath: string;
}

export interface ProcessOptions {
	subdir: UploadSubdir;
	maxWidth?: number;
	maxHeight?: number;
	quality?: number;
	format?: "webp" | "jpeg" | "png";
}

/**
 * Process and save uploaded file with Sharp compression
 *
 * Pipeline:
 * 1. Validate file exists in memory (Multer memoryStorage)
 * 2. Compress/resize with Sharp
 * 3. Generate random filename
 * 4. Save to UPLOAD_DIR/subdir/
 * 5. TODO: ClamAV scan before commit
 * 6. Return file metadata
 */
export async function processAndSaveFile(
	file: Express.Multer.File,
	options: ProcessOptions,
): Promise<ProcessedFile> {
	const { subdir, maxWidth = 1920, maxHeight = 1920, quality = 85, format = "webp" } = options;

	const isSafe = await scanWithClamAV(file.buffer, file.originalname);
	if (!isSafe) {
		throw new BadRequestError("Malware detected in uploaded file");
	}

	// Generate random filename preserving extension
	const ext = format === "jpeg" ? "jpg" : format;
	const filename = `${randomUUID()}.${ext}`;

	// Build storage path - UPLOAD_DIR is outside web root in production
	const storageDir = path.resolve(env.UPLOAD_DIR, subdir);
	const filePath = path.join(storageDir, filename);

	// Ensure directory exists
	await fs.promises.mkdir(storageDir, { recursive: true });

	// Determine output mime type
	const outputMimeType =
		format === "webp" ? "image/webp" : format === "jpeg" ? "image/jpeg" : "image/png";

	try {
		// Process with Sharp: compress, resize, convert format
		const sharpInstance = sharp(file.buffer)
			.resize(maxWidth, maxHeight, {
				fit: "inside",
				withoutEnlargement: true,
			})
			.toFormat(format, { quality });

		// Get metadata after processing
		const metadata = await sharpInstance.clone().metadata();

		// Save to disk
		await pipeline(sharpInstance, fs.createWriteStream(filePath));

		log.info("File processed and saved", {
			filename,
			originalName: file.originalname,
			size: file.size,
			width: metadata.width,
			height: metadata.height,
			subdir,
		});

		return {
			filename,
			originalName: file.originalname,
			mimeType: outputMimeType,
			size: file.size,
			width: metadata.width,
			height: metadata.height,
			urlPath: `/uploads/${subdir}/${filename}`,
		};
	} catch (error) {
		// Clean up partial file on error
		try {
			await fs.promises.unlink(filePath);
		} catch (err: unknown) {
			if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
				throw err;
			}
		}
		throw error;
	}
}

/**
 * Validate that a resolved path stays within UPLOAD_DIR (path traversal protection)
 * DOC-04 §9: Prevent access to files outside the uploads directory
 */
function isPathSafe(resolvedPath: string): boolean {
	const uploadDir = path.resolve(env.UPLOAD_DIR).replace(/\\/g, "/");
	const normalizedPath = resolvedPath.replace(/\\/g, "/");
	return normalizedPath.startsWith(`${uploadDir}/`) || normalizedPath === uploadDir;
}

/**
 * Extract relative path from urlPath and resolve it safely
 */
function resolveUrlPath(urlPath: string): string {
	const relativePath = urlPath.replace(/^\/uploads\/?/, "");
	const fullPath = path.resolve(env.UPLOAD_DIR, relativePath);

	if (!isPathSafe(fullPath)) {
		throw new BadRequestError(`Path traversal blocked: "${urlPath}" resolves outside UPLOAD_DIR`);
	}

	return fullPath;
}

/**
 * Delete file from storage
 */
export async function deleteFile(urlPath: string): Promise<void> {
	const fullPath = resolveUrlPath(urlPath);

	try {
		await fs.promises.unlink(fullPath);
		log.info("File deleted", { urlPath, fullPath });
	} catch (err: unknown) {
		if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
			log.error("Failed to delete file", { urlPath, fullPath, error: (err as Error).message });
			throw err;
		}
		// ENOENT: file doesn't exist, nothing to delete — OK
	}
}

/**
 * Check if file exists (async version — avoids blocking the event loop)
 */
export async function fileExistsAsync(urlPath: string): Promise<boolean> {
	const fullPath = resolveUrlPath(urlPath);
	try {
		await fs.promises.access(fullPath);
		return true;
	} catch (err: unknown) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") {
			return false;
		}
		throw err;
	}
}
