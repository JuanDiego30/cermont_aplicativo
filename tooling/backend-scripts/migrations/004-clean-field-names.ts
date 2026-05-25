/**
 * Migration 004: Clean field names
 *
 * Applies the clean-cut contract rename for orders and moves selected
 * persistence fields from snake_case to camelCase after the application code
 * has been deployed with the new schema names.
 *
 * Usage:
 *   npx tsx tooling/backend-scripts/migrations/004-clean-field-names.ts
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

type MigrationExpression =
	| string
	| number
	| boolean
	| MigrationExpression[]
	| { [key: string]: MigrationExpression };

type MigrationUpdate =
	| { [key: string]: MigrationExpression }
	| Array<{ [key: string]: MigrationExpression }>;

type MigrationResult = {
	matchedCount: number;
	modifiedCount: number;
};

type CollectionLike = {
	countDocuments(filter: { [key: string]: MigrationExpression }): Promise<number>;
	updateMany(
		filter: { [key: string]: MigrationExpression },
		update: MigrationUpdate,
	): Promise<MigrationResult>;
};

type FieldRename = {
	from: string;
	to: string;
};

const MONGO_URI = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/cermont";

const ORDER_RENAMES: FieldRename[] = [
	{ from: "costosBaseline", to: "costBaseline" },
	{ from: "executionPhase.preInicioCompletedAt", to: "executionPhase.preStartCompletedAt" },
	{ from: "executionPhase.enEjecucionCompletedAt", to: "executionPhase.inExecutionCompletedAt" },
	{ from: "executionPhase.cierreCompletedAt", to: "executionPhase.closureCompletedAt" },
];

const RESOURCE_RENAMES: FieldRename[] = [
	{ from: "purchase_date", to: "purchaseDate" },
	{ from: "maintenance_date", to: "maintenanceDate" },
];

const MAINTENANCE_KIT_RENAMES: FieldRename[] = [
	{ from: "last_reviewed_at", to: "lastReviewedAt" },
	{ from: "next_review_at", to: "nextReviewAt" },
];

function existsFilter(path: string): { [key: string]: MigrationExpression } {
	return { [path]: { $exists: true } };
}

function renameUpdate(rename: FieldRename): { $rename: { [key: string]: string } } {
	return { $rename: { [rename.from]: rename.to } };
}

async function renameFields(collection: CollectionLike, renames: FieldRename[]): Promise<number> {
	let modifiedCount = 0;

	for (const rename of renames) {
		const result = await collection.updateMany(existsFilter(rename.from), renameUpdate(rename));
		modifiedCount += result.modifiedCount;
	}

	return modifiedCount;
}

async function renameArrayItemField(
	collection: CollectionLike,
	arrayField: string,
	from: string,
	to: string,
): Promise<number> {
	const result = await collection.updateMany(existsFilter(`${arrayField}.${from}`), [
		{
			$set: {
				[arrayField]: {
					$map: {
						input: `$${arrayField}`,
						as: "item",
						in: {
							$mergeObjects: [
								{
									$arrayToObject: {
										$filter: {
											input: { $objectToArray: "$$item" },
											as: "field",
											cond: { $ne: ["$$field.k", from] },
										},
									},
								},
								{ [to]: `$$item.${from}` },
							],
						},
					},
				},
			},
		},
	]);

	return result.modifiedCount;
}

async function migrateCollection(
	name: string,
	renames: FieldRename[],
	arrayRenames: Array<{ arrayField: string; from: string; to: string }> = [],
): Promise<void> {
	const db = mongoose.connection.db;

	if (!db) {
		throw new Error("Database connection is not available");
	}

	const collection = db.collection(name) as CollectionLike;
	const beforeCount = await collection.countDocuments({
		$or: [
			...renames.map((rename) => existsFilter(rename.from)),
			...arrayRenames.map((rename) => existsFilter(`${rename.arrayField}.${rename.from}`)),
		],
	});
	let modifiedCount = await renameFields(collection, renames);

	for (const rename of arrayRenames) {
		modifiedCount += await renameArrayItemField(
			collection,
			rename.arrayField,
			rename.from,
			rename.to,
		);
	}

	console.log(`${name}: ${modifiedCount} updates applied from ${beforeCount} matching documents.`);
}

async function runMigration(): Promise<void> {
	await mongoose.connect(MONGO_URI, {
		family: 4,
		serverSelectionTimeoutMS: 5000,
	});

	try {
		await migrateCollection("orders", ORDER_RENAMES);
		await migrateCollection("resources", RESOURCE_RENAMES);
		await migrateCollection(
			"costcontrols",
			[],
			[{ arrayField: "actual_items", from: "is_budgeted", to: "isBudgeted" }],
		);
		await migrateCollection("maintenancekits", MAINTENANCE_KIT_RENAMES, [
			{ arrayField: "version_history", from: "changed_at", to: "changedAt" },
		]);
		await migrateCollection("kittipicos", MAINTENANCE_KIT_RENAMES, [
			{ arrayField: "version_history", from: "changed_at", to: "changedAt" },
		]);
	} finally {
		await mongoose.disconnect();
	}
}

void runMigration().catch((error: Error) => {
	console.error("Migration 004 failed:", error.message);
	process.exit(1);
});
