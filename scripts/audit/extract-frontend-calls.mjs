/**
 * Phase 2 — Extract Frontend API Calls
 * Parses all frontend files that call apiClient and outputs a call matrix.
 * Usage: node scripts/audit/extract-frontend-calls.mjs
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const FRONTEND_SRC = join(ROOT, "frontend", "src");
const OUTPUT_DIR = join(__dirname, "output");

function walkDir(dir, results = []) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		try {
			const stat = statSync(full);
			if (stat.isDirectory()) {
				// Skip node_modules and .next
				if (name === "node_modules" || name === ".next") {
					continue;
				}
				walkDir(full, results);
			} else if (
				/\.(ts|tsx)$/.test(name) &&
				!name.endsWith(".test.ts") &&
				!name.endsWith(".test.tsx")
			) {
				results.push(full);
			}
		} catch {
			// ignore access errors
		}
	}
	return results;
}

/**
 * Extract balanced parentheses block starting at the `(` after `startIdx`.
 */
function extractBlock(source, startIdx) {
	const openIdx = source.indexOf("(", startIdx);
	if (openIdx === -1) {
		return null;
	}
	let depth = 1;
	let i = openIdx + 1;
	while (i < source.length && depth > 0) {
		// Skip string literals to avoid counting parens inside them
		if (source[i] === '"' || source[i] === "'" || source[i] === "`") {
			const q = source[i];
			i++;
			while (i < source.length && source[i] !== q) {
				if (source[i] === "\\" && q !== "`") {
					i++; // escape
				}
				if (q === "`" && source[i] === "$" && source[i + 1] === "{") {
					// template expression — skip nested braces
					i += 2;
					let bd = 1;
					while (i < source.length && bd > 0) {
						if (source[i] === "{") {
							bd++;
						} else if (source[i] === "}") {
							bd--;
						}
						i++;
					}
					continue;
				}
				i++;
			}
			i++; // closing quote
			continue;
		}
		if (source[i] === "(") {
			depth++;
		} else if (source[i] === ")") {
			depth--;
		}
		i++;
	}
	return source.slice(openIdx + 1, i - 1).trim();
}

/**
 * Extract the URL path from a call block (first argument).
 * Handles: '/literal', "/literal", `template-${var}`, `/path/${id}/sub`
 */
function extractPath(block) {
	// Template literal with interpolations
	const blockWithoutConditionalQuery = block.replace(
		/\$\{\s*([A-Za-z_$][\w$]*)\s*\?\s*`\?\$\{\s*\1\s*\}`\s*:\s*""\s*\}/g,
		"",
	);
	const tplMatch = blockWithoutConditionalQuery.match(/^`([^`]*)`/);
	if (tplMatch) {
		// Replace interpolations with {param} placeholders
		return tplMatch[1]
			.replace(/\$\{\s*(?:encodeURIComponent\(\s*)?([A-Za-z_$][\w$]*)(?:\s*\))?\s*\}/g, "{$1}")
			.replace(/\$\{[^}]+\}/g, "{param}");
	}
	// Double-quoted
	const dqMatch = block.match(/^"([^"]*)"/);
	if (dqMatch) {
		return dqMatch[1];
	}
	// Single-quoted
	const sqMatch = block.match(/^'([^']*)'/);
	if (sqMatch) {
		return sqMatch[1];
	}

	return null;
}

/**
 * Detect offline support patterns in file content.
 */
function detectOfflinePatterns(source) {
	return /\benqueue\b|\bofflineFirst\b|\bnetworkMode\s*:\s*["']?offlineFirst/i.test(source);
}

/**
 * Detect if the call is inside a useMutation / mutationFn block.
 */
function detectMutation(source, callIdx) {
	// Look back 300 chars for useMutation context
	const ctx = source.slice(Math.max(0, callIdx - 300), callIdx);
	return /useMutation|mutationFn/i.test(ctx);
}

/**
 * Extract the enclosing function name for a call at `callIdx`.
 */
function getEnclosingFn(source, callIdx) {
	// Walk backwards looking for function/const/async declarations
	const ctx = source.slice(Math.max(0, callIdx - 600), callIdx);
	const fnMatches = [
		...ctx.matchAll(
			/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\())/g,
		),
	];
	if (fnMatches.length === 0) {
		return "";
	}
	const last = fnMatches[fnMatches.length - 1];
	return last[1] ?? last[2] ?? "";
}

function parseFile(filePath) {
	const source = readFileSync(filePath, "utf8");
	if (!source.includes("apiClient")) {
		return [];
	}

	const calls = [];
	const relPath = relative(ROOT, filePath).replace(/\\/g, "/");
	const hasOffline = detectOfflinePatterns(source);
	const methodPattern = /\bapiClient\.(get|post|put|patch|delete)\s*(?:<[^>]*>)?\s*\(/g;

	for (const match of source.matchAll(methodPattern)) {
		const method = match[1].toUpperCase();
		const block = extractBlock(source, match.index);
		if (!block) {
			continue;
		}

		const rawPath = extractPath(block);
		if (!rawPath) {
			continue;
		}

		// Build full API path: frontend relative path → backend /api/{path}
		// Frontend calls: /kits → backend /api/kits (proxy strips /api/backend prefix)
		const normalizedPath = `/api${rawPath.startsWith("/") ? rawPath : `/${rawPath}`}`;
		// Strip query strings from path for comparison purposes
		const pathWithoutQs = normalizedPath.split("?")[0];

		const isMutation =
			detectMutation(source, match.index) || ["POST", "PUT", "PATCH", "DELETE"].includes(method);
		const fnName = getEnclosingFn(source, match.index);
		const hasDynamicRouteSelector = /\{(?:action|endpoint|path|route)\}/i.test(rawPath);

		calls.push({
			sourceFile: relPath,
			method,
			relativePath: rawPath,
			normalizedBackendPath: pathWithoutQs,
			pathTemplate: rawPath.includes("${") || rawPath.includes("{") ? rawPath : null,
			functionName: fnName,
			isMutation,
			hasOfflineSupport: hasOffline,
			hasDynamicRouteSelector,
		});
	}

	return calls;
}

function main() {
	const tsFiles = walkDir(FRONTEND_SRC);
	const allCalls = [];
	const errors = [];
	let filesWithCalls = 0;

	for (const file of tsFiles) {
		try {
			const calls = parseFile(file);
			if (calls.length > 0) {
				filesWithCalls++;
				allCalls.push(...calls);
			}
		} catch (err) {
			errors.push({ file: relative(ROOT, file).replace(/\\/g, "/"), error: err.message });
		}
	}

	const output = {
		generatedAt: new Date().toISOString(),
		totalCalls: allCalls.length,
		filesScanned: tsFiles.length,
		filesWithCalls,
		errors,
		calls: allCalls,
	};

	writeFileSync(join(OUTPUT_DIR, "frontend-calls.json"), JSON.stringify(output, null, 2));

	console.log(`✅ Phase 2 complete`);
	console.log(`   TS/TSX files scanned:   ${tsFiles.length}`);
	console.log(`   Files with apiClient:   ${filesWithCalls}`);
	console.log(`   API calls extracted:    ${allCalls.length}`);
	if (errors.length > 0) {
		console.log(`   Errors: ${errors.length}`);
		for (const e of errors) {
			console.log(`     - ${e.file}: ${e.error}`);
		}
	}

	// Method breakdown
	const byMethod = {};
	for (const c of allCalls) {
		byMethod[c.method] = (byMethod[c.method] ?? 0) + 1;
	}
	console.log(
		`   By method: ${Object.entries(byMethod)
			.map(([k, v]) => `${k}=${v}`)
			.join(" | ")}`,
	);
}

main();
