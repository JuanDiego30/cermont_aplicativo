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
manifest.migrations[manifest.migrations.length - 1]!.toHash = hash;
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log("Updated manifest hash:", hash);
