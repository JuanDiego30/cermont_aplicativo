import fs from "node:fs/promises";
import path from "node:path";

const uploadsDir =
	process.env.UPLOADS_DIR && process.env.UPLOADS_DIR.trim().length > 0
		? process.env.UPLOADS_DIR
		: path.join(process.cwd(), "uploads");

const retentionDays = Number(process.env.UPLOAD_RETENTION_DAYS ?? "180");
const dryRun = (process.env.CLEANUP_DRY_RUN ?? "true").toLowerCase() !== "false";
const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

async function walk(dir: string): Promise<string[]> {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const results: string[] = [];

	for (const entry of entries) {
		const absolutePath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			results.push(...(await walk(absolutePath)));
		} else {
			results.push(absolutePath);
		}
	}

	return results;
}

async function main() {
	try {
		const files = await walk(uploadsDir);
		let removed = 0;
		let scanned = 0;

		for (const file of files) {
			scanned += 1;
			const stat = await fs.stat(file);
			if (stat.mtimeMs < cutoffMs) {
				if (!dryRun) {
					await fs.unlink(file);
				}
				removed += 1;
			}
		}

		console.log(
			JSON.stringify(
				{
					uploadsDir,
					retentionDays,
					dryRun,
					scanned,
					removed,
				},
				null,
				2,
			),
		);
	} catch (error) {
		console.error("cleanup-uploads failed", error);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error("cleanup-uploads failed", error);
	process.exit(1);
});
