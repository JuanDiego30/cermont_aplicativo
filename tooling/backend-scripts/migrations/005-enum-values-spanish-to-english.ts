/**
 * Migration: Spanish Enum Values to English
 *
 * Renames Spanish enum values stored in MongoDB collections to their
 * English equivalents. This covers all enum domains that were migrated
 * from Spanglish to English-only identifiers.
 *
 * Collections and fields affected:
 *
 * 1. kittipicos.activity_type
 *    electrico          → electrical
 *    mecanico           → mechanical
 *    telecomunicaciones → telecommunications
 *    (civil, hse unchanged)
 *
 * 2. inspections.inspection_type
 *    pulidora  → grinder
 *    arnes     → harness
 *    electrico → electrical
 *    extintor  → extinguisher
 *    vehiculo  → vehicle
 *    generico  → generic
 *
 * 3. orders.execution_phase
 *    PRE_INICIO    → PRE_START
 *    EN_EJECUCION  → IN_EXECUTION
 *    CIERRE        → CLOSURE
 *
 * 4. orders.status (if legacy Spanish values exist)
 *    abierta   → open
 *    asignada  → assigned
 *    en_progreso → in_progress
 *    en_pausa  → on_hold
 *    completada → completed
 *    cerrada   → closed
 *    cancelada → cancelled
 *
 * Run with: npx tsx tooling/backend-scripts/migrations/005-enum-values-spanish-to-english.ts
 *
 * Safety: All updates use { multi: true } with specific match criteria.
 * Dry-run mode available via DRY_RUN=true env var.
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cermont";
const DRY_RUN = process.env.DRY_RUN === "true";

// ── Enum mapping definitions ────────────────────────────────────────────────

const ACTIVITY_TYPE_MAP: Record<string, string> = {
	electrico: "electrical",
	mecanico: "mechanical",
	telecomunicaciones: "telecommunications",
};

const INSPECTION_TYPE_MAP: Record<string, string> = {
	pulidora: "grinder",
	arnes: "harness",
	electrico: "electrical",
	extintor: "extinguisher",
	vehiculo: "vehicle",
	generico: "generic",
};

const EXECUTION_PHASE_MAP: Record<string, string> = {
	PRE_INICIO: "PRE_START",
	EN_EJECUCION: "IN_EXECUTION",
	CIERRE: "CLOSURE",
};

const ORDER_STATUS_MAP: Record<string, string> = {
	abierta: "open",
	asignada: "assigned",
	en_progreso: "in_progress",
	en_pausa: "on_hold",
	completada: "completed",
	cerrada: "closed",
	cancelada: "cancelled",
};

// ── Migration logic ─────────────────────────────────────────────────────────

interface MigrationResult {
	collection: string;
	field: string;
	oldValue: string;
	newValue: string;
	matched: number;
	modified: number;
}

async function migrateEnumField(
	db: mongoose.mongo.Db,
	collectionName: string,
	fieldName: string,
	mapping: Record<string, string>,
): Promise<MigrationResult[]> {
	const collection = db.collection(collectionName);
	const results: MigrationResult[] = [];

	for (const [oldValue, newValue] of Object.entries(mapping)) {
		const filter = { [fieldName]: oldValue };
		const update = { $set: { [fieldName]: newValue } };

		const matched = await collection.countDocuments(filter);

		if (matched === 0) {
			results.push({
				collection: collectionName,
				field: fieldName,
				oldValue,
				newValue,
				matched: 0,
				modified: 0,
			});
			continue;
		}

		let modified = 0;
		if (!DRY_RUN) {
			const result = await collection.updateMany(filter, update);
			modified = result.modifiedCount;
		} else {
			modified = matched; // assume all would be modified in dry run
		}

		results.push({
			collection: collectionName,
			field: fieldName,
			oldValue,
			newValue,
			matched,
			modified,
		});
	}

	return results;
}

async function migrate() {
	const modeLabel = DRY_RUN ? "DRY RUN" : "LIVE";
	console.log(`🔄 Connecting to MongoDB... (${modeLabel})`);
	await mongoose.connect(MONGO_URI, { family: 4 });
	console.log("✅ Connected to MongoDB");

	const db = mongoose.connection.db;
	if (!db) {
		throw new Error("Database connection not established");
	}

	const allResults: MigrationResult[] = [];

	// 1. Activity type enum values in kittipicos
	console.log("\n📋 Migrating kittipicos.activity_type...");
	const activityResults = await migrateEnumField(
		db,
		"kittipicos",
		"activity_type",
		ACTIVITY_TYPE_MAP,
	);
	allResults.push(...activityResults);

	// 2. Inspection type enum values in inspections
	console.log("📋 Migrating inspections.inspection_type...");
	const inspectionResults = await migrateEnumField(
		db,
		"inspections",
		"inspection_type",
		INSPECTION_TYPE_MAP,
	);
	allResults.push(...inspectionResults);

	// 3. Execution phase enum values in orders
	console.log("📋 Migrating orders.execution_phase...");
	const phaseResults = await migrateEnumField(db, "orders", "execution_phase", EXECUTION_PHASE_MAP);
	allResults.push(...phaseResults);

	// 4. Order status enum values (legacy Spanish, if any)
	console.log("📋 Migrating orders.status (legacy Spanish)...");
	const statusResults = await migrateEnumField(db, "orders", "status", ORDER_STATUS_MAP);
	allResults.push(...statusResults);

	// ── Summary ─────────────────────────────────────────────────────────────

	console.log("");
	console.log("═══════════════════════════════════════════════════════════════");
	console.log(`  Migration Summary (${modeLabel})`);
	console.log("═══════════════════════════════════════════════════════════════");

	let totalMatched = 0;
	let totalModified = 0;
	let hasChanges = false;

	for (const r of allResults) {
		if (r.matched > 0) {
			hasChanges = true;
			totalMatched += r.matched;
			totalModified += r.modified;
			console.log(
				`  ${r.collection}.${r.field}: "${r.oldValue}" → "${r.newValue}" | matched: ${r.matched}, modified: ${r.modified}`,
			);
		}
	}

	if (!hasChanges) {
		console.log("  ✅ No documents needed migration — all enum values already in English");
	} else {
		console.log("");
		console.log(`  Total matched:  ${totalMatched}`);
		console.log(`  Total modified: ${totalModified}`);
	}

	console.log("═══════════════════════════════════════════════════════════════");

	await mongoose.disconnect();
	console.log("🔌 Disconnected from MongoDB");
}

migrate().catch((error: unknown) => {
	console.error("❌ Migration failed:", error);
	process.exit(1);
});
