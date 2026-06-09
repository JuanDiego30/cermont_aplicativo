import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	buildApiContractSnapshot,
	createSnapshotHash,
	stringifyApiContractSnapshot,
} from "../packages/shared-types/contracts/contractSnapshot.js";

const snap = stringifyApiContractSnapshot(buildApiContractSnapshot());
const hash = createSnapshotHash(snap);
console.log("New hash:", hash);

const snapPath = resolve(
	process.cwd(),
	"packages/shared-types/contracts/api-contract.snapshot.json",
);
writeFileSync(snapPath, snap);
console.log("Snapshot written to:", snapPath);

const readSnap = readFileSync(snapPath, "utf8");
const readHash = createSnapshotHash(readSnap);
console.log("Read back hash:", readHash);

const manifestPath = resolve(
	process.cwd(),
	"packages/shared-types/contracts/contract-migrations.json",
);
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.currentSnapshotHash = hash;
manifest.migrations.push({
	id: "038-evidence-title-field",
	date: new Date().toISOString().split("T")[0],
	type: "non-breaking",
	description:
		"Add title field to CreateEvidenceSchema and EvidenceSchema for per-photo descriptive titles.",
	toHash: hash,
});
writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t"));
console.log("Manifest updated");
