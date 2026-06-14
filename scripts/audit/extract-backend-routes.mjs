/**
 * Phase 1 — Extract Backend Routes
 * Parses all backend route files and outputs a complete route matrix.
 * Usage: node scripts/audit/extract-backend-routes.mjs
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const BACKEND_SRC = join(ROOT, "backend", "src");
const OUTPUT_DIR = join(__dirname, "output");

// Mount map derived from backend/src/index.ts API_MOUNTS array
// Key: route file basename (without extension), Value: mount prefix(es)
const MOUNT_MAP = {
	"auth.routes": ["/api/auth"],
	"order.routes": ["/api/orders"],
	"order-execution-session.routes": ["/api/orders"],
	"order-closure.routes": ["/api/orders"],
	"order-administrative-workflow.routes": ["/api/orders"],
	"user.routes": ["/api/users"],
	"evidence.routes": ["/api/evidences"],
	"evidence-collection.routes": ["/api/evidence-collections"],
	"execution-session.routes": ["/api/execution-sessions"],
	"execution-technical-report.routes": ["/api/execution-sessions"],
	"files.routes": ["/api/files"],
	"fleet.routes": ["/api/fleet"],
	"form-submission.routes": ["/api/form-submissions"],
	"checklist.routes": ["/api/checklists"],
	"client.routes": ["/api/clients"],
	"client-signature.routes": ["/api/signatures"],
	"cost.routes": ["/api/costs"],
	"custom-field.routes": ["/api/custom-fields"],
	"kit.routes": ["/api/kits"],
	"maintenance.routes": ["/api/maintenance"],
	"document.routes": ["/api/documents"],
	"document-import.routes": ["/api/documents"],
	"document-ingestion.routes": ["/api/documents"],
	"document-template.routes": ["/api/document-templates"],
	"template-draft.routes": ["/api/template-drafts"],
	"template-response.routes": ["/api/template-responses"],
	"proposal.routes": ["/api/proposals"],
	"purchase-order.routes": ["/api/purchase-orders"],
	"resource.routes": ["/api/resources"],
	"report.routes": ["/api/reports"],
	"technical-report.routes": ["/api/technical-reports"],
	"tool.routes": ["/api/tools"],
	"delivery-record.routes": ["/api/delivery-records"],
	"delivery-record-service-entry-sheet.routes": ["/api/delivery-records"],
	"service-entry-sheet.routes": ["/api/service-entry-sheets"],
	"service-entry-sheet-invoice.routes": ["/api/service-entry-sheets"],
	"invoice.routes": ["/api/invoices"],
	"invoice-payment.routes": ["/api/invoices"],
	"payment.routes": ["/api/payments"],
	"audit.routes": ["/api/audit"],
	"analytics.routes": ["/api/analytics"],
	"analytics-report.routes": ["/api/analytics"],
	"inspection.routes": ["/api/inspections"],
	"inventory.routes": ["/api/inventory"],
	"sync.routes": ["/api/sync"],
	"ai.routes": ["/api/ai"],
	"work-requests.routes": ["/api/work-requests"],
	"safety-analysis.routes": ["/api/asts"],
	"asset.routes": ["/api/assets"],
	"planning-packet.routes": ["/api/planning-packets"],
	"site-visit.routes": ["/api/site-visits"],
	"observability.routes": ["/api/observability"],
	"notifications.routes": ["/api/notifications"],
	"service-case.routes": ["/api/service-cases"],
	"dashboard.routes": ["/api/dashboard"],
	"metrics.routes": ["/api/metrics"],
	"portal.routes": ["/api/portal"],
	"dian.routes": ["/api/dian"],
	"sla.routes": ["/api/sla"],
	"dispatch.routes": ["/api/dispatch"],
	"system-config.routes": ["/api/system-config"],
	"admin-backup.routes": ["/api/admin/backups"],
};

function walkDir(dir, ext, results = []) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) {
			walkDir(full, ext, results);
		} else if (name.endsWith(ext)) {
			results.push(full);
		}
	}
	return results;
}

/**
 * Extract text of a block starting at `startIdx` in `source`,
 * counting balanced parentheses from the opening `(` found after startIdx.
 */
function extractBlock(source, startIdx) {
	const openIdx = source.indexOf("(", startIdx);
	if (openIdx === -1) {
		return null;
	}
	let depth = 1;
	let i = openIdx + 1;
	while (i < source.length && depth > 0) {
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
 * Parse a route call block to extract its arguments.
 * Block looks like: `"/path", mw1, validate(Schema), Controller.fn`
 */
function parseRouteBlock(block) {
	// Extract path: first string argument (single or double quoted, or template literal)
	const pathMatch = block.match(/^[\s\n]*(?:`([^`]*)`|"([^"]*)"|'([^']*)')/);
	const routePath = pathMatch ? (pathMatch[1] ?? pathMatch[2] ?? pathMatch[3]) : "";

	// Extract authorize() call and its arguments
	const authorizeMatch = block.match(/authorize\s*\(\s*([\s\S]*?)\s*\)/);
	let roles = [];
	if (authorizeMatch) {
		const argsRaw = authorizeMatch[1];
		// Spread operator patterns like ...INTERNAL_ROLES
		const spreadMatches = [...argsRaw.matchAll(/\.\.\.(\w+)/g)].map((m) => m[1]);
		// Literal string roles like "gerente", 'residente'
		const literalMatches = [...argsRaw.matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
		roles = [...spreadMatches.map((s) => `...${s}`), ...literalMatches];
	}

	// Check whether roles come from @cermont/domain imports or hardcoded strings
	const hasHardcodedRoles = roles.some((r) => !r.startsWith("..."));

	// Extract validate*() schema names
	const validationSchemas = [];
	for (const [, fn, schema] of block.matchAll(
		/\b(validateBody|validateQuery|validateParams)\s*\(\s*(\w+)/g,
	)) {
		validationSchemas.push({ validator: fn, schema });
	}

	// Extract middleware names (everything that isn't the path, body, or controller)
	const middlewareNames = [];
	if (/\bauthenticate\b/.test(block)) {
		middlewareNames.push("authenticate");
	}
	if (authorizeMatch) {
		middlewareNames.push(`authorize(${roles.join(", ")})`);
	}
	for (const { validator, schema } of validationSchemas) {
		middlewareNames.push(`${validator}(${schema})`);
	}

	// Extract controller: last identifier before end of block (Controller.method pattern)
	const controllerMatch = block.match(/(\w+(?:\.\w+)?)\s*[,\n]?\s*$/);
	const controller = controllerMatch ? controllerMatch[1] : "";

	return { routePath, roles, hasHardcodedRoles, validationSchemas, middlewareNames, controller };
}

function normalizePath(mountPrefix, routePath) {
	const clean = routePath.replace(/\/+$/, "") || "/";
	if (clean === "/") {
		return mountPrefix;
	}
	// Convert Express :param to {param}
	return (mountPrefix + clean).replace(/:([^/]+)/g, "{$1}");
}

function parseRoutesFile(filePath) {
	const source = readFileSync(filePath, "utf8");
	const fileBase = basename(filePath).replace(/\.ts$/, "");
	const prefixes = MOUNT_MAP[fileBase] ?? ["UNKNOWN"];
	const routes = [];

	// Check for module-level authenticate (router.use(authenticate))
	const hasModuleLevelAuth = /router\.use\s*\(\s*authenticate\s*\)/.test(source);

	const methodPattern = /\brouter\.(get|post|put|patch|delete)\s*\(/g;

	for (const match of source.matchAll(methodPattern)) {
		const method = match[1].toUpperCase();
		const block = extractBlock(source, match.index);
		if (!block) {
			continue;
		}

		const parsed = parseRouteBlock(block);
		if (!parsed.routePath && !block.includes("/")) {
			continue; // skip router.use() calls that slipped through
		}

		for (const prefix of prefixes) {
			const fullPath = normalizePath(prefix, parsed.routePath);
			routes.push({
				method,
				fullPath,
				routeFile: filePath.replace(`${ROOT}\\`, "").replace(/\\/g, "/"),
				mountPrefix: prefix,
				routePath: parsed.routePath,
				controller: parsed.controller,
				roles: parsed.roles,
				hasHardcodedRoles: parsed.hasHardcodedRoles,
				validationSchemas: parsed.validationSchemas,
				middlewareChain: parsed.middlewareNames,
				hasModuleLevelAuth,
			});
		}
	}

	return routes;
}

function main() {
	const routeFiles = walkDir(join(BACKEND_SRC, "modules"), ".routes.ts");
	const allRoutes = [];
	const errors = [];

	for (const file of routeFiles) {
		try {
			const routes = parseRoutesFile(file);
			allRoutes.push(...routes);
		} catch (err) {
			errors.push({ file: file.replace(`${ROOT}\\`, ""), error: err.message });
		}
	}

	const output = {
		generatedAt: new Date().toISOString(),
		totalRoutes: allRoutes.length,
		totalFiles: routeFiles.length,
		errors,
		routes: allRoutes,
	};

	writeFileSync(join(OUTPUT_DIR, "backend-routes.json"), JSON.stringify(output, null, 2));

	console.log(`✅ Phase 1 complete`);
	console.log(`   Route files scanned: ${routeFiles.length}`);
	console.log(`   Routes extracted:    ${allRoutes.length}`);
	if (errors.length > 0) {
		console.log(`   Errors:              ${errors.length}`);
		for (const e of errors) {
			console.log(`     - ${e.file}: ${e.error}`);
		}
	}

	// Quick RBAC summary
	const hardcoded = allRoutes.filter((r) => r.hasHardcodedRoles);
	if (hardcoded.length > 0) {
		console.log(`   ⚠️  Routes with hardcoded role strings: ${hardcoded.length}`);
	}
}

main();
