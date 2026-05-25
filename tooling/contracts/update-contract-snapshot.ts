import { readFileSync, writeFileSync } from "node:fs";
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

const snapshotContent = stringifyApiContractSnapshot(buildApiContractSnapshot());
const snapshotHash = createSnapshotHash(snapshotContent);

writeFileSync(snapshotPath, snapshotContent, "utf8");

const migrationManifest = JSON.parse(
	readFileSync(migrationManifestPath, "utf8"),
) as ContractMigrationManifest;
migrationManifest.currentSnapshotHash = snapshotHash;

if (migrationManifest.migrations.length === 0) {
	migrationManifest.migrations.push({
		id: "000-initial-baseline",
		date: "2026-04-06",
		type: "baseline",
		description: "Baseline inicial de contratos API y schemas Zod.",
		toHash: snapshotHash,
	});
}

writeFileSync(
	`${migrationManifestPath}`,
	`${JSON.stringify(migrationManifest, null, 2)}\n`,
	"utf8",
);
console.log(`✅ Snapshot actualizado: ${snapshotPath}`);
console.log(`✅ Hash actual: ${snapshotHash}`);
