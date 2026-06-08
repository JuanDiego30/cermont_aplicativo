import { writeFileSync } from "node:fs";
import {
	buildApiContractSnapshot,
	createSnapshotHash,
	stringifyApiContractSnapshot,
} from "../../packages/shared-types/contracts/contractSnapshot";

const snapshot = stringifyApiContractSnapshot(buildApiContractSnapshot());
const hash = createSnapshotHash(snapshot);

writeFileSync("packages/shared-types/contracts/api-contract.snapshot.json", snapshot);

console.log("HASH:" + hash);
console.log("SNAPSHOT UPDATED");
