import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";
import { AppError } from "../../common/errors";

export interface ManifestEntry {
	name: string;
	documentCount: number;
	checksum: string;
}

export interface BackupManifest {
	backupId: string;
	generatedAt: string;
	version: string;
	dbName: string;
	collections: ManifestEntry[];
	totalDocuments: number;
	archiveSizeBytes: number;
}

export interface VerifyResult {
	manifest: BackupManifest;
	results: Array<{
		collection: string;
		expectedCount: number;
		actualCount: number;
		checksumMatch: boolean;
		status: "ok" | "mismatch" | "missing";
	}>;
	allMatch: boolean;
	verifiedAt: string;
}

/**
 * Verify a backup manifest by comparing document counts against the live DB.
 */
export async function verifyBackupManifest(manifestPath: string): Promise<VerifyResult> {
	const raw = await readFile(manifestPath, "utf-8");
	const manifest: BackupManifest = JSON.parse(raw) as BackupManifest;

	const db = mongoose.connection.db;
	if (!db) {
		throw new AppError("Base de datos no disponible", 503, "DATABASE_UNAVAILABLE");
	}

	const results: VerifyResult["results"] = [];

	for (const entry of manifest.collections) {
		const exists = await db.listCollections({ name: entry.name }).hasNext();
		if (!exists) {
			results.push({
				collection: entry.name,
				expectedCount: entry.documentCount,
				actualCount: 0,
				checksumMatch: false,
				status: "missing",
			});
			continue;
		}

		const actualCount = await db.collection(entry.name).countDocuments();
		const countMatch = actualCount === entry.documentCount;

		results.push({
			collection: entry.name,
			expectedCount: entry.documentCount,
			actualCount,
			checksumMatch: countMatch,
			status: countMatch ? "ok" : "mismatch",
		});
	}

	const allMatch = results.every((r) => r.status === "ok");

	return {
		manifest,
		results,
		allMatch,
		verifiedAt: new Date().toISOString(),
	};
}

/**
 * Compute SHA-256 checksum of a file.
 */
export async function computeChecksum(filePath: string): Promise<string> {
	const hash = createHash("sha256");
	const buffer = await readFile(filePath);
	hash.update(buffer);
	return hash.digest("hex");
}
