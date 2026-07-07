import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	buildApiContractSnapshot,
	createSnapshotHash,
	stringifyApiContractSnapshot,
} from "../contracts/contractSnapshot";

const snapshot = stringifyApiContractSnapshot(buildApiContractSnapshot());
const snapshotPath = resolve(__dirname, "../contracts/api-contract.snapshot.json");
writeFileSync(snapshotPath, snapshot);
console.log("Wrote snapshot:", snapshot.length, "bytes");

const hash = createSnapshotHash(snapshot);
const manifestPath = resolve(__dirname, "../contracts/contract-migrations.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as {
	currentSnapshotHash: string;
	migrations: Array<{ toHash: string }>;
};
manifest.currentSnapshotHash = hash;
const latestMigration = manifest.migrations.at(-1);
if (!latestMigration) {
	throw new Error("Contract migration manifest must contain at least one migration");
}
latestMigration.toHash = hash;
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log("Updated manifest hash:", hash);
