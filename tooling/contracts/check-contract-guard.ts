import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
	buildApiContractSnapshot,
	createSnapshotHash,
	stringifyApiContractSnapshot,
} from "../../packages/shared-types/contracts/contractSnapshot";

type ContractMigration = {
	id: string;
	date: string;
	type: "baseline" | "non-breaking" | "breaking";
	description: string;
	toHash: string;
};

type ContractMigrationManifest = {
	currentSnapshotHash: string;
	migrations: ContractMigration[];
};

const snapshotPath = resolve(
	process.cwd(),
	"packages/shared-types/contracts/api-contract.snapshot.json",
);
const migrationManifestPath = resolve(
	process.cwd(),
	"packages/shared-types/contracts/contract-migrations.json",
);

const committedSnapshot = readFileSync(snapshotPath, "utf8");
const generatedSnapshot = stringifyApiContractSnapshot(buildApiContractSnapshot());

if (committedSnapshot !== generatedSnapshot) {
	console.error("❌ API contract snapshot is outdated.");
	console.error("   Run: npm run contracts:snapshot:update");
	process.exit(1);
}

const migrationManifest = JSON.parse(
	readFileSync(migrationManifestPath, "utf8"),
) as ContractMigrationManifest;

if (!migrationManifest.currentSnapshotHash) {
	console.error("❌ Missing currentSnapshotHash in contract migration manifest.");
	process.exit(1);
}

if (!Array.isArray(migrationManifest.migrations) || migrationManifest.migrations.length === 0) {
	console.error("❌ Missing migration declaration for current contract snapshot.");
	process.exit(1);
}

const snapshotHash = createSnapshotHash(committedSnapshot);
const latestMigration = migrationManifest.migrations[migrationManifest.migrations.length - 1];

if (migrationManifest.currentSnapshotHash !== snapshotHash) {
	console.error("❌ contract-migrations.json currentSnapshotHash does not match snapshot hash.");
	console.error(`   Expected: ${snapshotHash}`);
	console.error(`   Found:    ${migrationManifest.currentSnapshotHash}`);
	process.exit(1);
}

if (!latestMigration || latestMigration.toHash !== snapshotHash) {
	console.error(
		"❌ Latest migration declaration does not point to current contract snapshot hash.",
	);
	console.error(
		"   Add a migration entry in packages/shared-types/contracts/contract-migrations.json.",
	);
	process.exit(1);
}

console.log("✅ API contracts guard passed.");
console.log(`   Snapshot hash: ${snapshotHash}`);
console.log(`   Latest migration: ${latestMigration.id}`);
