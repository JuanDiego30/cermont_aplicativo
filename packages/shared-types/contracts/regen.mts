import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type ContractSnapshotModule = typeof import("./contractSnapshot.ts");
type ContractSnapshotImport = ContractSnapshotModule & { default?: ContractSnapshotModule };

const importedContractSnapshot = (await import("./contractSnapshot.ts")) as ContractSnapshotImport;
const { buildApiContractSnapshot, createSnapshotHash, stringifyApiContractSnapshot } =
	importedContractSnapshot.default ?? importedContractSnapshot;

const __dirname = dirname(fileURLToPath(import.meta.url));

const snapshot = buildApiContractSnapshot();
const generated = stringifyApiContractSnapshot(snapshot);

writeFileSync(resolve(__dirname, "api-contract.snapshot.json"), generated, "utf8");

const hash = createSnapshotHash(generated);
process.stdout.write(`HASH:${hash}\n`);
