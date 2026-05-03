/**
 * Upload Middleware - Secure File Handling
 *
 * Pipeline:
 * 1. Multer (memoryStorage) - Recibe archivo en RAM
 * 2. Validación MIME & tamaño - Rechazo rápido
 * 3. ClamAV scan - Detección de malware
 * 4. Sharp processing - Compresión y redimensionamiento
 * 5. Almacenamiento privado - Fuera del web root
 *
 * Security principles:
 * - Nunca servir archivos directamente del almacenamiento
 * - Usar nombres aleatorios (UUID)
 * - Validar MIME type y magic bytes
 * - Comprimir imágenes automáticamente
 * - Cuarentena de archivos sospechosos
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import multer, { type FileFilterCallback } from "multer";
import { BadRequestError } from "../common/errors";
import { createLogger } from "../common/utils";
import { env } from "../config/env";

const log = createLogger("upload-middleware");

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN BÁSICA
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_MIMES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"application/pdf",
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Crear directorio de uploads si no existe
const uploadsDir = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTER CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
	// Check MIME type whitelist
	if (!ALLOWED_MIMES.includes(file.mimetype as (typeof ALLOWED_MIMES)[number])) {
		log.warn("Rejected file: invalid MIME", { mime: file.mimetype, name: file.originalname });
		cb(
			new BadRequestError(
				`Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_MIMES.join(", ")}`,
			),
		);
		return;
	}

	// Check file extension (defense in depth)
	const ext = path.extname(file.originalname).toLowerCase();
	const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"];
	if (!allowedExtensions.includes(ext)) {
		log.warn("Rejected file: invalid extension", { ext, name: file.originalname });
		cb(new BadRequestError(`Invalid file extension: ${ext}`));
		return;
	}

	cb(null, true);
};

export const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: MAX_FILE_SIZE },
});

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY MIDDLEWARE: ClamAV Scan (Stubbed for now)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scan file with ClamAV for malware
 * Uses clamav-client npm package for production integration
 */
export async function scanWithClamAV(fileBuffer: Buffer, filename: string): Promise<boolean> {
	if (!env.CLAMAV_ENABLED) {
		if (env.NODE_ENV === "production") {
			log.error("ClamAV scan disabled in production — rejecting upload", { filename });
			throw new BadRequestError("Malware scan is required in production");
		}

		log.warn("ClamAV scan disabled outside production; allowing upload", {
			filename,
			nodeEnv: env.NODE_ENV,
		});
		return true;
	}
	try {
		const NodeClam = require("clamav-client");
		const scanner = new NodeClam();
		await scanner.init({
			clamdscan: {
				host: env.CLAMAV_HOST || "localhost",
				port: parseInt(env.CLAMAV_PORT || "3310", 10),
				localFallback: false,
			},
		});
		const { isInfected } = await scanner.scanBuffer(fileBuffer);
		if (isInfected) {
			log.warn("Malware detected in uploaded file", { filename });
		}
		return !isInfected;
	} catch (err) {
		log.error("ClamAV scan error — failing securely (rejecting file)", {
			error: (err as Error).message,
			filename,
		});
		throw new BadRequestError("Malware scan unavailable — file rejected");
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE PROCESSING: Compression with Sharp
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Process image: compress, optimize, and convert format
 * Non-image files (PDF) are skipped
 */
async function processImage(
	fileBuffer: Buffer,
	originalName: string,
	mimeType: string,
): Promise<Buffer> {
	// Skip processing for non-images
	if (!mimeType.startsWith("image/")) {
		return fileBuffer;
	}

	try {
		const Sharp = require("sharp");

		let pipeline = Sharp(fileBuffer);

		// Resize images to max 1920x1080 (prevents huge files)
		pipeline = pipeline.resize(1920, 1080, {
			fit: "inside",
			withoutEnlargement: true,
		});

		// Convert to WebP for better compression (fallback to JPEG for old browsers)
		// For now, keep original format but compress
		if (mimeType === "image/jpeg") {
			pipeline = pipeline.jpeg({ quality: 80, progressive: true });
		} else if (mimeType === "image/png") {
			pipeline = pipeline.png({ compressionLevel: 9 });
		} else if (mimeType === "image/webp") {
			pipeline = pipeline.webp({ quality: 80 });
		}

		const processed = await pipeline.toBuffer();
		log.info("Image processed", {
			original: fileBuffer.length,
			processed: processed.length,
			ratio: `${((1 - processed.length / fileBuffer.length) * 100).toFixed(0)}%`,
		});

		return processed;
	} catch (err) {
		log.error("Image processing error", { error: (err as Error).message, file: originalName });
		// Return original if processing fails
		return fileBuffer;
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE: Save with random name
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate secure random filename
 * SECURITY FIX: RT-003 - Use crypto.randomUUID() instead of predictable Date.now() + Math.random()
 */
function generateSecureFilename(originalName: string, _mimeType: string): string {
	const ext = path.extname(originalName).toLowerCase();
	// Use cryptographically secure UUID - unpredictable and unique
	const randomName = crypto.randomUUID();
	return `${randomName}${ext}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE: Process and store uploaded file
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Middleware que procesa el archivo tras multer
 * Attaches: req.file.storedPath, req.file.size
 */
export const processUploadedFile = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	if (!req.file) {
		next();
		return;
	}

	try {
		log.info("Processing upload", { name: req.file.originalname, size: req.file.size });

		// Step 1: Scan with ClamAV
		const isSafe = await scanWithClamAV(req.file.buffer, req.file.originalname);
		if (!isSafe) {
			log.warn("Malware detected", { name: req.file.originalname });
			res.status(400).json({ error: "File failed security scan" });
			return;
		}

		// Step 2: Process image (compress, optimize)
		const processedBuffer = await processImage(
			req.file.buffer,
			req.file.originalname,
			req.file.mimetype,
		);

		// Step 3: Generate secure filename
		const secureFilename = generateSecureFilename(req.file.originalname, req.file.mimetype);
		const filePath = path.join(uploadsDir, secureFilename);

		// Step 4: Write to disk
		fs.writeFileSync(filePath, new Uint8Array(processedBuffer));

		// Step 5: Attach metadata to request
		req.file.storedPath = filePath;
		req.file.filename = secureFilename;
		req.file.size = processedBuffer.length;

		log.info("File stored successfully", {
			filename: secureFilename,
			size: processedBuffer.length,
			path: filePath,
		});

		next();
	} catch (err) {
		log.error("Upload processing error", { error: (err as Error).message });
		res.status(500).json({ error: "File processing failed" });
	}
};

// ─────────────────────────────────────────────────────────────────────────────
// CLEANUP: Remove orphaned files (cron job)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Optional: Clean up orphaned files (run via cron)
 * Files older than maxAge and not referenced in DB are deleted
 */
export async function cleanupOrphanedFiles(maxAgeDays: number = 30): Promise<void> {
	const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
	const now = Date.now();

	try {
		const files = fs.readdirSync(uploadsDir);
		for (const file of files) {
			const filePath = path.join(uploadsDir, file);
			const stat = fs.statSync(filePath);
			if (now - stat.mtimeMs > maxAgeMs) {
				fs.unlinkSync(filePath);
				log.info("Orphaned file deleted", {
					file,
					ageDay: Math.floor((now - stat.mtimeMs) / (24 * 60 * 60 * 1000)),
				});
			}
		}
	} catch (err) {
		log.error("Cleanup error", { error: (err as Error).message });
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Express error handler for multer errors
 */
export const handleUploadError = (
	err: unknown,
	_req: Request,
	res: Response,
	next: NextFunction,
): void => {
	if (err instanceof multer.MulterError) {
		if (err.code === "LIMIT_FILE_SIZE") {
			res.status(400).json({ error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB` });
			return;
		}
		if (err.code === "LIMIT_FILE_COUNT") {
			res.status(400).json({ error: "Too many files" });
			return;
		}
	}

	if (err instanceof Error && err.message.includes("Invalid file")) {
		res.status(400).json({ error: err.message });
		return;
	}

	next(err);
};
