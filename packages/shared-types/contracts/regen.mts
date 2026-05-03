import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	buildApiContractSnapshot,
	createSnapshotHash,
	stringifyApiContractSnapshot,
} from "./contractSnapshot.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const snapshot = buildApiContractSnapshot();
const generated = stringifyApiContractSnapshot(snapshot);

writeFileSync(resolve(__dirname, "api-contract.snapshot.json"), generated, "utf8");

const hash = createSnapshotHash(generated);
process.stdout.write(`HASH:${hash}\n`);
