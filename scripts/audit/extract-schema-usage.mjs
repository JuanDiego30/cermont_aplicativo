/**
 * Phase 3 — Extract Shared-Types Schema Usage
 * Catalogs all Zod schemas and maps their usage in backend routes and frontend files.
 * Usage: node scripts/audit/extract-schema-usage.mjs
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const SHARED_SCHEMAS = join(ROOT, "packages", "shared-types", "src", "schemas");
const BACKEND_SRC = join(ROOT, "backend", "src");
const FRONTEND_SRC = join(ROOT, "frontend", "src");
const OUTPUT_DIR = join(__dirname, "output");

function walkDir(dir, ext, results = []) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		try {
			const stat = statSync(full);
			if (stat.isDirectory()) {
				if (name === "node_modules" || name === ".next") {
					continue;
				}
				walkDir(full, ext, results);
			} else if (ext.some((e) => name.endsWith(e))) {
				results.push(full);
			}
		} catch {
			// ignore
		}
	}
	return results;
}

/**
 * Parse a schema file to find all exported names.
 */
function extractSchemaExports(filePath) {
	const source = readFileSync(filePath, "utf8");
	const exports = new Set();

	// export const FooSchema = z.object(...)
	// export const FooInput = ...
	for (const [, name] of source.matchAll(
		/^export\s+(?:const|type|class|function|enum)\s+(\w+)/gm,
	)) {
		exports.add(name);
	}
	// export { Foo, Bar }
	for (const [, group] of source.matchAll(/^export\s+\{([^}]+)\}/gm)) {
		for (const part of group.split(",")) {
			const name = part
				.trim()
				.split(/\s+as\s+/)
				.pop()
				?.trim();
			if (name) {
				exports.add(name);
			}
		}
	}

	return [...exports];
}

/**
 * Parse the shared-types index.ts to get all re-exported schema names.
 */
function extractIndexExports(indexPath) {
	const source = readFileSync(indexPath, "utf8");
	const exports = new Set();

	// export * from './schemas/foo.schema'
	// All symbols from those files are re-exported
	for (const [, schemaFile] of source.matchAll(/export\s+\*\s+from\s+["']([^"']+)["']/g)) {
		const resolved = join(dirname(indexPath), `${schemaFile}.ts`);
		try {
			const names = extractSchemaExports(resolved);
			for (const n of names) {
				exports.add(n);
			}
		} catch {
			// file may not exist with .ts suffix or may be directory index
		}
	}
	// export { Foo } from './schemas/...'
	for (const [, group] of source.matchAll(/export\s+\{([^}]+)\}\s+from/g)) {
		for (const part of group.split(",")) {
			const name = part
				.trim()
				.split(/\s+as\s+/)
				.pop()
				?.trim();
			if (name && name !== "*") {
				exports.add(name);
			}
		}
	}

	return [...exports];
}

/**
 * Find all files in a directory that import a given symbol from @cermont/shared-types.
 */
function _findUsages(dir, schemaName) {
	const usedInValidation = [];
	const usedInApiCalls = [];

	const files = walkDir(dir, [".ts", ".tsx"]);

	for (const file of files) {
		try {
			const source = readFileSync(file, "utf8");
			if (!source.includes("@cermont/shared-types")) {
				continue;
			}

			const relPath = relative(ROOT, file).replace(/\\/g, "/");

			// Check if schema is imported
			const isImported =
				new RegExp(`\\b${schemaName}\\b`).test(source) && source.includes("@cermont/shared-types");

			if (!isImported) {
				continue;
			}

			// In backend: check if used in validate*()
			if (dir === BACKEND_SRC && /validate(?:Body|Query|Params)\s*\(\s*\w/.test(source)) {
				const inValidate = new RegExp(
					`validate(?:Body|Query|Params)\\s*\\(\\s*${schemaName}\\b`,
				).test(source);
				if (inValidate) {
					usedInValidation.push(relPath);
				} else {
					// Just imported but not in validate — still track
				}
			}

			// In frontend: check if used in apiClient calls or type inference
			if (dir === FRONTEND_SRC) {
				usedInApiCalls.push(relPath);
			}
		} catch {
			// ignore read errors
		}
	}

	return { usedInValidation, usedInApiCalls };
}

function main() {
	console.log("🔍 Phase 3: Scanning schema files...");

	// Collect all schema files
	const schemaFiles = walkDir(SHARED_SCHEMAS, [".ts"]).filter((f) => !f.endsWith("index.ts"));

	// Get all exported names from each schema file
	const schemaEntries = [];
	for (const file of schemaFiles) {
		const relFile = relative(ROOT, file).replace(/\\/g, "/");
		try {
			const names = extractSchemaExports(file);
			for (const name of names) {
				schemaEntries.push({ schemaName: name, schemaFile: relFile });
			}
		} catch (err) {
			console.error(`Error reading ${relFile}: ${err.message}`);
		}
	}

	// Also get from the index (catches re-exports)
	const indexPath = join(SHARED_SCHEMAS, "index.ts");
	let indexNames = [];
	try {
		indexNames = extractIndexExports(indexPath);
	} catch (err) {
		console.warn(`Could not parse schema index: ${err.message}`);
	}

	// De-duplicate schema entries — keep unique schema names
	const uniqueSchemas = new Map();
	for (const entry of schemaEntries) {
		if (!uniqueSchemas.has(entry.schemaName)) {
			uniqueSchemas.set(entry.schemaName, entry);
		}
	}

	// For schema names only in index (re-exports), add them too
	for (const name of indexNames) {
		if (!uniqueSchemas.has(name)) {
			uniqueSchemas.set(name, {
				schemaName: name,
				schemaFile: "packages/shared-types/src/schemas/index.ts",
			});
		}
	}

	// Now find usages — focus on *Schema and *Input/*Output names
	const relevantSchemas = [...uniqueSchemas.values()].filter((s) =>
		/Schema$|Input$|Output$|Params$/.test(s.schemaName),
	);

	console.log(`   Found ${relevantSchemas.length} relevant schemas (Schema/Input/Output/Params)`);
	console.log("   Scanning backend usages...");

	// For performance, scan all backend and frontend files once
	const backendFiles = walkDir(BACKEND_SRC, [".ts"]);
	const frontendFiles = walkDir(FRONTEND_SRC, [".ts", ".tsx"]).filter(
		(f) => !f.endsWith(".test.ts") && !f.endsWith(".test.tsx"),
	);

	// Build an index: schema name → files that reference it
	const backendRefs = new Map(); // schemaName → Set<relPath>
	const frontendRefs = new Map();

	for (const file of backendFiles) {
		try {
			const source = readFileSync(file, "utf8");
			if (!source.includes("@cermont/shared-types") && !source.includes("@cermont")) {
				continue;
			}
			const relPath = relative(ROOT, file).replace(/\\/g, "/");
			// Find which schemas this file references
			for (const schema of relevantSchemas) {
				if (new RegExp(`\\b${schema.schemaName}\\b`).test(source)) {
					if (!backendRefs.has(schema.schemaName)) {
						backendRefs.set(schema.schemaName, new Set());
					}
					backendRefs.get(schema.schemaName).add(relPath);
				}
			}
		} catch {
			// ignore
		}
	}

	console.log("   Scanning frontend usages...");
	for (const file of frontendFiles) {
		try {
			const source = readFileSync(file, "utf8");
			if (!source.includes("@cermont/shared-types") && !source.includes("cermont")) {
				continue;
			}
			const relPath = relative(ROOT, file).replace(/\\/g, "/");
			for (const schema of relevantSchemas) {
				if (new RegExp(`\\b${schema.schemaName}\\b`).test(source)) {
					if (!frontendRefs.has(schema.schemaName)) {
						frontendRefs.set(schema.schemaName, new Set());
					}
					frontendRefs.get(schema.schemaName).add(relPath);
				}
			}
		} catch {
			// ignore
		}
	}

	// Assemble output
	const schemaUsages = relevantSchemas.map((s) => {
		const bRefs = [...(backendRefs.get(s.schemaName) ?? [])];
		const fRefs = [...(frontendRefs.get(s.schemaName) ?? [])];
		const routeFiles = bRefs.filter((f) => f.includes(".routes."));
		return {
			schemaName: s.schemaName,
			schemaFile: s.schemaFile,
			importedInBackend: bRefs.length > 0,
			importedInFrontend: fRefs.length > 0,
			usedInValidation: routeFiles,
			usedInApiCalls: fRefs,
		};
	});

	const orphanSchemas = schemaUsages.filter((s) => !s.importedInBackend && !s.importedInFrontend);
	const backendOnly = schemaUsages.filter((s) => s.importedInBackend && !s.importedInFrontend);
	const frontendOnly = schemaUsages.filter((s) => !s.importedInBackend && s.importedInFrontend);

	const output = {
		generatedAt: new Date().toISOString(),
		totalSchemas: schemaUsages.length,
		orphanSchemas: orphanSchemas.length,
		backendOnlySchemas: backendOnly.length,
		frontendOnlySchemas: frontendOnly.length,
		schemas: schemaUsages,
	};

	writeFileSync(join(OUTPUT_DIR, "schema-usage.json"), JSON.stringify(output, null, 2));

	console.log(`✅ Phase 3 complete`);
	console.log(`   Total schemas analyzed: ${schemaUsages.length}`);
	console.log(
		`   Used in both layers:    ${schemaUsages.filter((s) => s.importedInBackend && s.importedInFrontend).length}`,
	);
	console.log(`   Backend only:           ${backendOnly.length}`);
	console.log(`   Frontend only:          ${frontendOnly.length}`);
	console.log(`   Unused (orphan):        ${orphanSchemas.length}`);
}

main();
