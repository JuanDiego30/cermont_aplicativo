/**
 * Admin Backup Service — Tarea 6.1 / Módulo 4 (Observaciones anteproyecto)
 *
 * Exportación de datos para auditoría y respaldo: lista colecciones con
 * conteos y exporta su contenido como JSON descargable. La exportación
 * por mes soporta el portal de descarga de históricos.
 */

import mongoose from "mongoose";
import { AppError } from "../../common/errors";

const EXPORT_BATCH_LIMIT = 10_000;
const EXCLUDED_COLLECTIONS = new Set(["tokenblacklists", "idempotencyentries"]);

export interface CollectionSummary {
	name: string;
	documentCount: number;
}

function getDb() {
	const db = mongoose.connection.db;
	if (!db) {
		throw new AppError("La base de datos no está disponible", 503, "DATABASE_UNAVAILABLE");
	}
	return db;
}

export async function listCollections(): Promise<CollectionSummary[]> {
	const db = getDb();
	const collections = await db.listCollections().toArray();

	const summaries: CollectionSummary[] = [];
	for (const collection of collections) {
		if (EXCLUDED_COLLECTIONS.has(collection.name)) {
			continue;
		}
		const documentCount = await db.collection(collection.name).countDocuments();
		summaries.push({ name: collection.name, documentCount });
	}
	return summaries.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Export one collection as plain JSON documents. Supports optional
 * month/year filter over createdAt for historical exports.
 */
export async function exportCollection(
	collectionName: string,
	options: { year?: number; month?: number } = {},
) {
	if (EXCLUDED_COLLECTIONS.has(collectionName) || !/^[a-z0-9_]+$/i.test(collectionName)) {
		throw new AppError("Colección no exportable", 400, "BACKUP_COLLECTION_NOT_ALLOWED");
	}

	const db = getDb();
	const exists = await db.listCollections({ name: collectionName }).hasNext();
	if (!exists) {
		throw new AppError("Colección no encontrada", 404, "BACKUP_COLLECTION_NOT_FOUND");
	}

	const filter: Record<string, unknown> = {};
	if (options.year && options.month) {
		const from = new Date(Date.UTC(options.year, options.month - 1, 1));
		const to = new Date(Date.UTC(options.year, options.month, 1));
		filter.createdAt = { $gte: from, $lt: to };
	}

	const documents = await db
		.collection(collectionName)
		.find(filter)
		.limit(EXPORT_BATCH_LIMIT)
		.toArray();

	return {
		collection: collectionName,
		exportedAt: new Date().toISOString(),
		filter: options.year && options.month ? { year: options.year, month: options.month } : "all",
		count: documents.length,
		truncated: documents.length === EXPORT_BATCH_LIMIT,
		documents,
	};
}
