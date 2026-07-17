/**
 * ensure-indexes.ts — Bootstrap MongoDB indexes for all collections.
 *
 * Production disables Mongoose auto-indexing for performance.
 * This script ensures all compound indexes exist before the API starts.
 *
 * Usage:
 *   npx tsx backend/scripts/ensure-indexes.ts          # create indexes
 *   npx tsx backend/scripts/ensure-indexes.ts --dry-run # preview only
 *
 * Design:
 *   - Idempotent: safe to run on every deploy
 *   - Reads indexes from Mongoose models (SSOT)
 *   - Skips indexes that already exist
 *   - Reports current vs expected per collection
 */

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/cermont";
const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
	console.log(`MongoDB Indexes: ensuring all model indexes${DRY_RUN ? " (DRY RUN)" : ""}`);
	console.log(`  URI: ${MONGO_URI.replace(/\/\/.*@/, "//***@")}\n`);

	await mongoose.connect(MONGO_URI, {
		family: 4,
		serverSelectionTimeoutMS: 10_000,
	});

	// Register all Mongoose models by importing the barrel index
	// This triggers Schema.index() registration for each model
	await import("../src/models/index");

	const modelNames = mongoose.modelNames();
	console.log(`Found ${modelNames.length} Mongoose models:\n`);

	let totalCreated = 0;
	let totalSkipped = 0;

	for (const name of modelNames) {
		const model = mongoose.model(name);
		try {
			// Ensure the collection exists
			if (!DRY_RUN) {
				await model.createCollection();
			}

			// List existing indexes
			const existing = DRY_RUN ? [] : await model.collection.indexes();
			const existingNames = new Set(existing.map((idx: { name: string }) => idx.name));

			// Get indexes defined in the schema
			const schemaIndexes = model.schema.indexes();

			let created = 0;
			let skipped = 0;

			for (const [fields, options] of schemaIndexes) {
				// Generate a stable index name from the fields
				const keyEntries = Object.entries(fields) as [string, number | string][];
				const indexName =
					options.name ??
					keyEntries.map(([k, v]) => `${k}_${String(v).replace(/-/g, "neg")}`).join("_");

				if (existingNames.has(indexName) || existingNames.has(indexName.replace(/_neg/g, "_-1"))) {
					skipped++;
					continue;
				}

				if (DRY_RUN) {
					console.log(`  [DRY] ${name}.${indexName}`);
				} else {
					await model.collection.createIndex(fields, {
						...options,
						background: true,
						name: indexName,
					});
					console.log(`  [CREATE] ${name}.${indexName}`);
				}
				created++;
			}

			if (created === 0 && skipped > 0) {
				console.log(`  ${name}: all ${skipped} indexes exist ✓`);
			} else if (created > 0) {
				console.log(`  ${name}: created ${created}, skipped ${skipped}`);
			}

			totalCreated += created;
			totalSkipped += skipped;
		} catch (err) {
			console.error(`  ${name}: ERROR —`, (err as Error).message);
		}
	}

	console.log(`\nDone. Total created: ${totalCreated}, skipped: ${totalSkipped}`);
	if (DRY_RUN) {
		console.log("(dry run — no indexes were modified)");
	}

	await mongoose.disconnect();
	process.exit(0);
}

main().catch((err) => {
	console.error("Index script failed:", err);
	process.exit(1);
});
