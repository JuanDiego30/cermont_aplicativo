type CleanMigrationScalar = string | number | boolean | Date;

export type CleanMigrationValue =
	| CleanMigrationScalar
	| CleanMigrationValue[]
	| { [key: string]: CleanMigrationValue };

export type CleanMigrationDocument = { [key: string]: CleanMigrationValue };

type FieldRename = {
	from: string;
	to: string;
};

const ORDER_EXECUTION_PHASE_RENAMES: FieldRename[] = [
	{ from: "preInicioCompletedAt", to: "preStartCompletedAt" },
	{ from: "enEjecucionCompletedAt", to: "inExecutionCompletedAt" },
	{ from: "cierreCompletedAt", to: "closureCompletedAt" },
];

function isCleanRecord(value: CleanMigrationValue): value is CleanMigrationDocument {
	return typeof value === "object" && !Array.isArray(value) && !(value instanceof Date);
}

function renameField(record: CleanMigrationDocument, rename: FieldRename): CleanMigrationDocument {
	const next: CleanMigrationDocument = { ...record };

	if (rename.from in next && !(rename.to in next)) {
		next[rename.to] = next[rename.from];
	}
	delete next[rename.from];

	return next;
}

function renameFields(
	record: CleanMigrationDocument,
	renames: FieldRename[],
): CleanMigrationDocument {
	return renames.reduce((current, rename) => renameField(current, rename), record);
}

function renameArrayItemFields(
	value: CleanMigrationValue,
	renames: FieldRename[],
): CleanMigrationValue {
	if (!Array.isArray(value)) {
		return value;
	}

	return value.map((entry) => (isCleanRecord(entry) ? renameFields(entry, renames) : entry));
}

export function migrateOrderFieldNames(document: CleanMigrationDocument): CleanMigrationDocument {
	const next = renameField(document, { from: "costosBaseline", to: "costBaseline" });
	const executionPhase = next.executionPhase;

	if (executionPhase && isCleanRecord(executionPhase)) {
		next.executionPhase = renameFields(executionPhase, ORDER_EXECUTION_PHASE_RENAMES);
	}

	return next;
}

export function migrateResourceFieldNames(
	document: CleanMigrationDocument,
): CleanMigrationDocument {
	return renameFields(document, [
		{ from: "purchase_date", to: "purchaseDate" },
		{ from: "maintenance_date", to: "maintenanceDate" },
	]);
}

export function migrateCostControlFieldNames(
	document: CleanMigrationDocument,
): CleanMigrationDocument {
	const next: CleanMigrationDocument = { ...document };
	const actualItems = next.actual_items;

	if (actualItems) {
		next.actual_items = renameArrayItemFields(actualItems, [
			{ from: "is_budgeted", to: "isBudgeted" },
		]);
	}

	return next;
}

export function migrateMaintenanceKitFieldNames(
	document: CleanMigrationDocument,
): CleanMigrationDocument {
	const next = renameFields(document, [
		{ from: "last_reviewed_at", to: "lastReviewedAt" },
		{ from: "next_review_at", to: "nextReviewAt" },
	]);
	const versionHistory = next.version_history;

	if (versionHistory) {
		next.version_history = renameArrayItemFields(versionHistory, [
			{ from: "changed_at", to: "changedAt" },
		]);
	}

	return next;
}
