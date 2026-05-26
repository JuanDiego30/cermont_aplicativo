/**
 * Migration 003: Maintenance Kit Enterprise Defaults
 *
 * Idempotently assigns enterprise metadata to legacy kits without inventing
 * operational content.
 *
 * USAGE:
 *   npx tsx tooling/backend-scripts/migrations/003-maintenance-kit-enterprise-defaults.ts
 */

import mongoose from "mongoose";
import { MaintenanceKit } from "../../../backend/src/maintenance/infrastructure/model";

async function nextKitCode(yearMonth: string, sequence: number): Promise<string> {
	return `KIT-${yearMonth}-${String(sequence).padStart(4, "0")}`;
}

async function up() {
	const yearMonth = new Date().toISOString().slice(0, 7).replace("-", "");
	const kits = await MaintenanceKit.find({
		$or: [{ code: { $exists: false } }, { version: { $exists: false } }],
	}).sort({ createdAt: 1 });

	let sequence = 1;

	for (const kit of kits) {
		if (!kit.code) {
			kit.code = await nextKitCode(yearMonth, sequence);
			sequence += 1;
		}

		if (!kit.version) {
			kit.version = "v1.0";
		}

		if (!kit.version_history?.length) {
			kit.version_history = [
				{
					version: kit.version,
					changedAt: kit.createdAt ?? new Date(),
					changed_by: kit.created_by,
					reason: "Backfill de metadatos enterprise para kit legacy",
				},
			];
		}

		kit.base_material_cost = kit.base_material_cost ?? 0;
		await kit.save();
	}

	console.log(`Migration 003 completed. Updated ${kits.length} kits.`);
}

async function main() {
	const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cermont";
	await mongoose.connect(mongoUri, {
		family: 4,
		serverSelectionTimeoutMS: 5000,
	});

	try {
		await up();
	} finally {
		await mongoose.disconnect();
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
