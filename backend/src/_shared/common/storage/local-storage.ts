/**
 * File Storage Abstraction — Local Filesystem
 *
 * Centralizes file persistence to enable future migration to S3
 * without refactoring the entire application.
 *
 * Currently implements local filesystem storage in /uploads
 */

import fs from "node:fs/promises";
import path from "node:path";
import { BadRequestError } from "../errors";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * Ensure upload directory exists
 */
export async function ensureUploadDirExists(): Promise<void> {
	await fs.mkdir(UPLOAD_DIR, { recursive: true, mode: 0o755 });
}

/**
 * Save file to local filesystem
 *
 * @param filename - Safe filename (sanitized)
 * @param buffer - File buffer
 * @returns URL path relative to /uploads
 */
export async function saveFile(filename: string, buffer: Buffer): Promise<string> {
	await ensureUploadDirExists();

	const filepath = path.join(UPLOAD_DIR, filename);

	// Security: prevent path traversal
	const resolved = path.resolve(filepath);
	if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
		throw new BadRequestError("Invalid file path");
	}

	await fs.writeFile(filepath, buffer);

	// Return relative URL path for API
	return `/uploads/${filename}`;
}

/**
 * Delete file from filesystem (soft delete semantics)
 *
 * For now, physically removes file if trazabilidad doesn't require archival.
 * Future: could move to archive directory instead.
 *
 * @param filename - Filename to delete
 */
export async function deleteFile(filename: string): Promise<void> {
	const filepath = path.join(UPLOAD_DIR, filename);

	// Security: prevent path traversal
	const resolved = path.resolve(filepath);
	if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
		throw new BadRequestError("Invalid file path");
	}

	try {
		await fs.unlink(filepath);
	} catch (err: unknown) {
		const error = err as NodeJS.ErrnoException;
		if (error.code !== "ENOENT") {
			throw err;
		}
		// File doesn't exist, no error
	}
}

/**
 * Get file stats (size, mtime, etc.)
 */
export async function getFileStats(
	filename: string,
): Promise<{ size: number; mtimeMs: number } | null> {
	const filepath = path.join(UPLOAD_DIR, filename);

	try {
		const stats = await fs.stat(filepath);
		return { size: stats.size, mtimeMs: stats.mtimeMs };
	} catch {
		return null;
	}
}

/**
 * List all files in upload directory
 */
export async function listFiles(): Promise<string[]> {
	try {
		await ensureUploadDirExists();
		return await fs.readdir(UPLOAD_DIR);
	} catch {
		return [];
	}
}
