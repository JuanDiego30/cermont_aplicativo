/**
 * Migration 002: Evidence Label Spanish → English
 *
 * Renames Evidence.label field values from Spanish to English:
 *  - 'antes' → 'before'
 *  - 'durante' → 'during'
 *  - 'despues' → 'after'
 *  - 'final' → 'final' (unchanged)
 *
 * USAGE:
 *   npx tsx tooling/backend-scripts/migrations/002-evidence-spanish-to-english.ts
 */

import mongoose from "mongoose";
import { Evidence } from "../../models/Evidence";
import { createLogger } from "../../utils/logger";

const log = createLogger("migration-002");

async function up() {
	log.info("Starting Migration 002: Evidence label Spanish → English");

	const updates = [
		{ from: "antes", to: "before" },
		{ from: "durante", to: "during" },
		{ from: "despues", to: "after" },
		// 'final' stays 'final'
	];

	for (const { from, to } of updates) {
		const result = await Evidence.updateMany({ label: from }, { $set: { label: to } });
		log.info(`Updated label '${from}' → '${to}': ${result.modifiedCount} documents`);
	}

	log.info("Migration 002 completed successfully");
}

async function down() {
	log.info("Starting Migration 002 ROLLBACK: Evidence label English → Spanish");

	const updates = [
		{ from: "before", to: "antes" },
		{ from: "during", to: "durante" },
		{ from: "after", to: "despues" },
	];

	for (const { from, to } of updates) {
		const result = await Evidence.updateMany({ label: from }, { $set: { label: to } });
		log.info(`Rolled back label '${from}' → '${to}': ${result.modifiedCount} documents`);
	}

	log.info("Migration 002 rollback completed");
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
	try {
		const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cermont";
		await mongoose.connect(mongoUri, {
			family: 4,
			serverSelectionTimeoutMS: 5000,
		});
		log.info("Connected to MongoDB");

		const command = process.argv[2] || "up";

		if (command === "up") {
			await up();
		} else if (command === "down") {
			await down();
		} else {
			log.error(`Unknown command: ${command}. Use 'up' or 'down'.`);
			process.exit(1);
		}

		await mongoose.disconnect();
		log.info("Disconnected from MongoDB");
		process.exit(0);
	} catch (error) {
		log.error("Migration 002 failed", {
			error: error instanceof Error ? error.message : String(error),
		});
		process.exit(1);
	}
}

main();
