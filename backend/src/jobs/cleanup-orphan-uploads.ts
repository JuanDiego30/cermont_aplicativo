import path from "node:path";
import { deleteFile, getFileStats, listFiles } from "../common/storage/local-storage";
import { createLogger } from "../common/utils/logger";
import { Document, Evidence, User, WorkReport } from "../models";

const log = createLogger("cleanup-orphan-uploads");
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface CleanupOrphanUploadsOptions {
	maxAgeMs?: number;
	dryRun?: boolean;
}

export interface CleanupOrphanUploadsOutcome {
	scannedCount: number;
	referencedCount: number;
	orphanedCount: number;
	deletedCount: number;
	retainedRecentCount: number;
	dryRun: boolean;
	orphanedFiles: string[];
}

function normalizeUploadReference(value?: string): string {
	if (typeof value !== "string") {
		return "";
	}

	const trimmed = value.trim();
	if (!trimmed) {
		return "";
	}

	return path.basename(trimmed);
}

async function collectReferencedUploads(): Promise<Set<string>> {
	const [evidences, documents, users, reports] = await Promise.all([
		Evidence.find().select("filename").lean(),
		Document.find().select("file_url").lean(),
		User.find().select("avatarUrl").lean(),
		WorkReport.find().select("pdfPath").lean(),
	]);

	const references = new Set<string>();

	for (const evidence of evidences) {
		const filename = normalizeUploadReference(evidence.filename);
		if (filename) {
			references.add(filename);
		}
	}

	for (const document of documents) {
		const filename = normalizeUploadReference(document.file_url);
		if (filename) {
			references.add(filename);
		}
	}

	for (const user of users) {
		const filename = normalizeUploadReference(user.avatarUrl);
		if (filename) {
			references.add(filename);
		}
	}

	for (const report of reports) {
		const filename = normalizeUploadReference(report.pdfPath);
		if (filename) {
			references.add(filename);
		}
	}

	return references;
}

export async function cleanupOrphanUploads(
	options: CleanupOrphanUploadsOptions = {},
): Promise<CleanupOrphanUploadsOutcome> {
	const maxAgeMs = options.maxAgeMs ?? DEFAULT_MAX_AGE_MS;
	const dryRun = options.dryRun ?? false;

	const [files, referencedUploads] = await Promise.all([listFiles(), collectReferencedUploads()]);

	const orphanedFiles: string[] = [];
	let deletedCount = 0;
	let retainedRecentCount = 0;

	for (const filename of files) {
		const stats = await getFileStats(filename);
		if (!stats) {
			continue;
		}

		const isRecent = Date.now() - stats.mtimeMs < maxAgeMs;
		if (isRecent) {
			retainedRecentCount += 1;
			continue;
		}

		if (referencedUploads.has(filename)) {
			continue;
		}

		orphanedFiles.push(filename);

		if (!dryRun) {
			await deleteFile(filename);
			deletedCount += 1;
		}
	}

	const result: CleanupOrphanUploadsOutcome = {
		scannedCount: files.length,
		referencedCount: referencedUploads.size,
		orphanedCount: orphanedFiles.length,
		deletedCount,
		retainedRecentCount,
		dryRun,
		orphanedFiles,
	};

	log.info("Orphan upload cleanup completed", { ...result });
	return result;
}
