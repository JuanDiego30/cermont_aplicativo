/**
 * Migration: KitTipico Spanish to English field names
 *
 * Renames the following fields in the kittipicos collection:
 * - nombre → name
 * - tipoActividad → activity_type
 * - herramientas → tools (array)
 *   - herramientas.$.nombre → tools.$.name
 *   - herramientas.$.cantidad → tools.$.quantity
 *   - herramientas.$.especificaciones → tools.$.specifications
 * - equipos → equipment (array)
 *   - equipos.$.nombre → equipment.$.name
 *   - equipos.$.cantidad → equipment.$.quantity
 *   - equipos.$.certificadoRequerido → equipment.$.certificate_required
 *
 * Run with: npx tsx tooling/backend-scripts/migrations/001-kittipico-spanish-to-english.ts
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cermont";

interface OldTool {
	nombre: string;
	cantidad: number;
	especificaciones?: string;
}

interface OldEquipment {
	nombre: string;
	cantidad: number;
	certificadoRequerido: boolean;
}

interface OldKitTipico {
	_id: mongoose.Types.ObjectId;
	nombre: string;
	tipoActividad: string;
	herramientas: OldTool[];
	equipos: OldEquipment[];
	is_active: boolean;
	created_by: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

async function migrate() {
	console.log("🔄 Connecting to MongoDB...");
	await mongoose.connect(MONGO_URI, { family: 4 });
	console.log("✅ Connected to MongoDB");

	const db = mongoose.connection.db;
	if (!db) {
		throw new Error("Database connection not established");
	}

	const collection = db.collection("kittipicos");

	// Check if migration is needed by looking for old field names
	const oldDocCount = await collection.countDocuments({ nombre: { $exists: true } });
	const newDocCount = await collection.countDocuments({ name: { $exists: true } });

	console.log(`📊 Found ${oldDocCount} documents with old schema (nombre)`);
	console.log(`📊 Found ${newDocCount} documents with new schema (name)`);

	if (oldDocCount === 0) {
		console.log("✅ No migration needed - all documents already use new schema");
		await mongoose.disconnect();
		return;
	}

	console.log("🔄 Starting migration...");

	// Fetch all documents with old schema
	const oldDocs = (await collection
		.find({ nombre: { $exists: true } })
		.toArray()) as unknown as OldKitTipico[];

	let migratedCount = 0;
	let errorCount = 0;

	for (const doc of oldDocs) {
		try {
			// Transform tools array
			const tools = (doc.herramientas || []).map((h: OldTool) => ({
				name: h.nombre,
				quantity: h.cantidad,
				specifications: h.especificaciones,
			}));

			// Transform equipment array
			const equipment = (doc.equipos || []).map((e: OldEquipment) => ({
				name: e.nombre,
				quantity: e.cantidad,
				certificate_required: e.certificadoRequerido,
			}));

			// Update document with new field names
			await collection.updateOne(
				{ _id: doc._id },
				{
					$set: {
						name: doc.nombre,
						activity_type: doc.tipoActividad,
						tools,
						equipment,
					},
					$unset: {
						nombre: "",
						tipoActividad: "",
						herramientas: "",
						equipos: "",
					},
				},
			);

			migratedCount++;
			console.log(`  ✅ Migrated: ${doc.nombre} → ${doc.nombre}`);
		} catch (error) {
			errorCount++;
			console.error(`  ❌ Failed to migrate ${doc._id}: ${(error as Error).message}`);
		}
	}

	console.log("");
	console.log("═══════════════════════════════════════");
	console.log(`✅ Migration complete!`);
	console.log(`   Migrated: ${migratedCount}`);
	console.log(`   Errors: ${errorCount}`);
	console.log("═══════════════════════════════════════");

	await mongoose.disconnect();
	console.log("🔌 Disconnected from MongoDB");
}

migrate().catch((error) => {
	console.error("❌ Migration failed:", error);
	process.exit(1);
});
