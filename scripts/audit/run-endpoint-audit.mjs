/**
 * Phase 4 — Cross-Reference & Gap Analysis
 * Compares backend routes, frontend calls, and schema usage matrices.
 * Produces audit-report.json and audit-report.html.
 * Usage: node scripts/audit/run-endpoint-audit.mjs
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "output");

function loadJson(name) {
	const path = join(OUTPUT_DIR, name);
	if (!existsSync(path)) {
		console.error(
			`❌ Missing: ${path} — run Phase ${name.includes("backend") ? "1" : name.includes("frontend") ? "2" : "3"} first`,
		);
		process.exit(1);
	}
	return JSON.parse(readFileSync(path, "utf8"));
}

// ─── Normalisation helpers ──────────────────────────────────────────────────

/**
 * Normalize a path for comparison: collapse repeated slashes, lowercase,
 * unify param patterns (:id / {id} / ${id}) → {param}.
 */
function normalizePath(p) {
	return (
		p
			.toLowerCase()
			.replace(/\/+/g, "/")
			.replace(/:([a-z_][a-z0-9_]*)/gi, "{$1}")
			.replace(/\$\{[^}]+\}/g, "{param}")
			.replace(/\{[^}]+\}/g, "{param}") // collapse all named params to generic
			.replace(/\/$/, "") || "/"
	);
}

/**
 * Build a lookup key from method + normalized path.
 */
function routeKey(method, path) {
	return `${method.toUpperCase()} ${normalizePath(path)}`;
}

// ─── Findings ───────────────────────────────────────────────────────────────

const findings = [];
let findingId = 0;

function addFinding({
	category,
	severity,
	title,
	description,
	backendFile,
	frontendFile,
	details,
}) {
	findings.push({
		id: ++findingId,
		category,
		severity,
		title,
		description,
		backendFile: backendFile ?? null,
		frontendFile: frontendFile ?? null,
		details: details ?? {},
	});
}

// ─── Category A — Orphan Routes (backend route, no frontend call) ───────────

function checkOrphanRoutes(backendRoutes, frontendCallSet) {
	for (const route of backendRoutes) {
		// Skip internal / health / docs / sync routes — not expected to have frontend calls
		const skip = [
			"/api/observability",
			"/api/audit",
			"/api/admin/backups",
			"/api/docs",
			"/api/sync",
			"/api/metrics",
		];
		if (skip.some((s) => route.fullPath.startsWith(s))) {
			continue;
		}

		const key = routeKey(route.method, route.fullPath);
		if (!frontendCallSet.has(key)) {
			addFinding({
				category: "A",
				severity: "HIGH",
				title: `Orphan route: ${route.method} ${route.fullPath}`,
				description:
					"Backend route has no corresponding frontend apiClient call. May be a dead endpoint or a missing UI feature.",
				backendFile: route.routeFile,
				details: { method: route.method, path: route.fullPath, roles: route.roles },
			});
		}
	}
}

// ─── Category B — Missing Routes (frontend call, no backend route) ──────────

function checkMissingRoutes(frontendCalls, backendRouteSet) {
	for (const call of frontendCalls) {
		const key = routeKey(call.method, call.normalizedBackendPath);
		if (!backendRouteSet.has(key)) {
			addFinding({
				category: "B",
				severity: "HIGH",
				title: `Missing route: ${call.method} ${call.normalizedBackendPath}`,
				description:
					"Frontend calls an endpoint that has no corresponding backend route — will result in a 404 at runtime.",
				frontendFile: call.sourceFile,
				details: {
					method: call.method,
					path: call.normalizedBackendPath,
					relativePath: call.relativePath,
					functionName: call.functionName,
				},
			});
		}
	}
}

// ─── Category C — Method Mismatch ──────────────────────────────────────────

function checkMethodMismatches(backendRoutes, frontendCalls) {
	// Build map: normalizedPath → Set<method> (backend)
	const backendByPath = new Map();
	for (const r of backendRoutes) {
		const np = normalizePath(r.fullPath);
		if (!backendByPath.has(np)) {
			backendByPath.set(np, new Set());
		}
		backendByPath.get(np).add(r.method.toUpperCase());
	}

	// Build map: normalizedPath → Set<method> (frontend)
	const frontendByPath = new Map();
	for (const c of frontendCalls) {
		const np = normalizePath(c.normalizedBackendPath);
		if (!frontendByPath.has(np)) {
			frontendByPath.set(np, new Set());
		}
		frontendByPath.get(np).add(c.method.toUpperCase());
	}

	for (const [path, feMethods] of frontendByPath) {
		const beMethods = backendByPath.get(path);
		if (!beMethods) {
			continue; // handled by Cat B
		}

		for (const feMethod of feMethods) {
			if (!beMethods.has(feMethod)) {
				// Frontend uses a method not available on the backend for this path
				addFinding({
					category: "C",
					severity: "HIGH",
					title: `Method mismatch on ${path}`,
					description: `Frontend uses ${feMethod} but backend only has [${[...beMethods].join(", ")}] for this path.`,
					details: { path, frontendMethod: feMethod, backendMethods: [...beMethods] },
				});
			}
		}
	}
}

// ─── Category F — RBAC Drift (hardcoded role strings) ──────────────────────

function checkRbacDrift(backendRoutes) {
	const hardcoded = backendRoutes.filter((r) => r.hasHardcodedRoles);
	for (const route of hardcoded) {
		const literalRoles = route.roles.filter((r) => !r.startsWith("..."));
		addFinding({
			category: "F",
			severity: "MEDIUM",
			title: `Hardcoded roles on ${route.method} ${route.fullPath}`,
			description: `Route uses literal role strings ${JSON.stringify(literalRoles)} instead of constants from @cermont/domain — violates RBAC SSOT rule.`,
			backendFile: route.routeFile,
			details: { method: route.method, path: route.fullPath, hardcodedRoles: literalRoles },
		});
	}
}

// ─── Category J — Offline Support Gap ──────────────────────────────────────

function checkOfflineGaps(frontendCalls) {
	// Mutations (POST/PUT/PATCH/DELETE) that lack offline support are potential issues
	// Focus on field-execution paths
	const fieldPaths = [
		"/api/execution-sessions",
		"/api/evidences",
		"/api/form-submissions",
		"/api/checklists",
	];
	for (const call of frontendCalls) {
		if (!call.isMutation) {
			continue;
		}
		if (call.hasOfflineSupport) {
			continue;
		}
		if (!fieldPaths.some((p) => call.normalizedBackendPath.startsWith(p))) {
			continue;
		}

		addFinding({
			category: "J",
			severity: "LOW",
			title: `Offline gap: ${call.method} ${call.normalizedBackendPath}`,
			description:
				"Field-execution mutation has no offline queue support. Should use enqueue() pattern.",
			frontendFile: call.sourceFile,
			details: {
				method: call.method,
				path: call.normalizedBackendPath,
				functionName: call.functionName,
			},
		});
	}
}

// ─── Category E — Schema misalignment (backend uses schema not in frontend) ─

function checkSchemaAlignment(backendRoutes, schemas) {
	// For each backend route with validation schemas, check if frontend imports the same schemas
	const schemaMap = new Map(schemas.map((s) => [s.schemaName, s]));

	for (const route of backendRoutes) {
		for (const { validator, schema: schemaName } of route.validationSchemas) {
			const entry = schemaMap.get(schemaName);
			if (!entry) {
				continue;
			}

			// If the schema is used in validateBody but the frontend doesn't import it at all
			if (validator === "validateBody" && !entry.importedInFrontend) {
				addFinding({
					category: "E",
					severity: "MEDIUM",
					title: `Schema misalignment: ${schemaName} not imported by frontend`,
					description: `Backend validates request body with ${schemaName} but no frontend file imports this schema from @cermont/shared-types. Frontend may be sending an unvalidated payload.`,
					backendFile: route.routeFile,
					details: { schema: schemaName, route: `${route.method} ${route.fullPath}` },
				});
			}
		}
	}
}

// ─── Category G — Proxy routing issues ──────────────────────────────────────

function checkProxyRouting(frontendCalls) {
	// Frontend calls /api/backend/{path} → proxy → /api/{path}
	// Paths should start with a known backend prefix
	const knownPrefixes = new Set([
		"/api/auth",
		"/api/orders",
		"/api/users",
		"/api/evidences",
		"/api/evidence-collections",
		"/api/execution-sessions",
		"/api/files",
		"/api/fleet",
		"/api/form-submissions",
		"/api/checklists",
		"/api/clients",
		"/api/signatures",
		"/api/costs",
		"/api/custom-fields",
		"/api/kits",
		"/api/maintenance",
		"/api/documents",
		"/api/document-templates",
		"/api/template-drafts",
		"/api/template-responses",
		"/api/proposals",
		"/api/purchase-orders",
		"/api/resources",
		"/api/reports",
		"/api/technical-reports",
		"/api/tools",
		"/api/delivery-records",
		"/api/service-entry-sheets",
		"/api/invoices",
		"/api/payments",
		"/api/audit",
		"/api/analytics",
		"/api/inspections",
		"/api/inventory",
		"/api/sync",
		"/api/ai",
		"/api/work-requests",
		"/api/asts",
		"/api/assets",
		"/api/planning-packets",
		"/api/site-visits",
		"/api/observability",
		"/api/notifications",
		"/api/service-cases",
		"/api/dashboard",
		"/api/metrics",
		"/api/portal",
		"/api/dian",
		"/api/sla",
		"/api/dispatch",
		"/api/system-config",
		"/api/admin",
	]);

	for (const call of frontendCalls) {
		const path = call.normalizedBackendPath;
		const hasKnownPrefix = [...knownPrefixes].some((p) => path.startsWith(p));
		if (!hasKnownPrefix) {
			addFinding({
				category: "G",
				severity: "HIGH",
				title: `Proxy routing issue: ${call.method} ${path}`,
				description:
					"Frontend path does not match a known backend mount prefix — will be 404 at proxy layer.",
				frontendFile: call.sourceFile,
				details: { method: call.method, path, relativePath: call.relativePath },
			});
		}
	}
}

// ─── HTML Report Generator ──────────────────────────────────────────────────

function renderHtml(findings, meta) {
	const bySeverity = { HIGH: [], MEDIUM: [], LOW: [] };
	for (const f of findings) {
		bySeverity[f.severity]?.push(f);
	}

	const byCategory = {};
	for (const f of findings) {
		if (!byCategory[f.category]) {
			byCategory[f.category] = [];
		}
		byCategory[f.category].push(f);
	}

	const catLabels = {
		A: "Orphan Routes",
		B: "Missing Routes",
		C: "Method Mismatch",
		D: "Path Mismatch",
		E: "Schema Misalignment",
		F: "RBAC Drift",
		G: "Proxy Routing",
		H: "Doc Drift",
		I: "Catch-All Gap",
		J: "Offline Gap",
	};

	const severityColor = { HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#3b82f6" };
	const severityBg = { HIGH: "#fef2f2", MEDIUM: "#fffbeb", LOW: "#eff6ff" };

	function renderFinding(f) {
		const color = severityColor[f.severity] ?? "#6b7280";
		const bg = severityBg[f.severity] ?? "#f9fafb";
		return `
      <div style="border:1px solid ${color};border-radius:8px;margin:12px 0;padding:16px;background:${bg}">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
          <span style="background:${color};color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600">${f.severity}</span>
          <span style="background:#e5e7eb;color:#374151;padding:2px 8px;border-radius:4px;font-size:12px">CAT-${f.category}: ${catLabels[f.category] ?? f.category}</span>
          <span style="font-size:12px;color:#6b7280">#${f.id}</span>
        </div>
        <div style="font-weight:600;font-size:14px;margin-bottom:6px">${f.title}</div>
        <div style="font-size:13px;color:#374151;margin-bottom:8px">${f.description}</div>
        ${f.backendFile ? `<div style="font-size:12px;color:#6b7280">Backend: <code>${f.backendFile}</code></div>` : ""}
        ${f.frontendFile ? `<div style="font-size:12px;color:#6b7280">Frontend: <code>${f.frontendFile}</code></div>` : ""}
        ${Object.keys(f.details ?? {}).length ? `<details style="margin-top:8px"><summary style="cursor:pointer;font-size:12px;color:#6b7280">Details</summary><pre style="font-size:11px;background:#f3f4f6;padding:8px;border-radius:4px;overflow:auto;margin-top:4px">${JSON.stringify(f.details, null, 2)}</pre></details>` : ""}
      </div>
    `;
	}

	const summaryRows = Object.entries(byCategory)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([cat, items]) => {
			const high = items.filter((i) => i.severity === "HIGH").length;
			const med = items.filter((i) => i.severity === "MEDIUM").length;
			const low = items.filter((i) => i.severity === "LOW").length;
			return `<tr>
        <td style="padding:8px 12px"><strong>CAT-${cat}</strong></td>
        <td style="padding:8px 12px">${catLabels[cat] ?? cat}</td>
        <td style="padding:8px 12px;text-align:center">${items.length}</td>
        <td style="padding:8px 12px;text-align:center;color:${severityColor.HIGH}">${high}</td>
        <td style="padding:8px 12px;text-align:center;color:${severityColor.MEDIUM}">${med}</td>
        <td style="padding:8px 12px;text-align:center;color:${severityColor.LOW}">${low}</td>
      </tr>`;
		})
		.join("");

	const allHtml = findings.map(renderFinding).join("");

	return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cermont — Endpoint Audit Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f9fafb; color: #111827; line-height: 1.5; }
    .container { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    h2 { font-size: 18px; font-weight: 600; margin: 32px 0 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .meta { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
    .stats { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 32px; }
    .stat { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 24px; text-align: center; min-width: 120px; }
    .stat .value { font-size: 28px; font-weight: 700; }
    .stat .label { font-size: 13px; color: #6b7280; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    th { background: #f3f4f6; padding: 10px 12px; text-align: left; font-size: 13px; font-weight: 600; }
    td { border-top: 1px solid #e5e7eb; font-size: 13px; }
    code { background: #f3f4f6; padding: 1px 4px; border-radius: 3px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Cermont — Full-Stack Endpoint Audit Report</h1>
    <div class="meta">
      Generated: ${new Date().toISOString()} &nbsp;|&nbsp;
      Backend routes scanned: ${meta.backendRoutes} &nbsp;|&nbsp;
      Frontend API calls: ${meta.frontendCalls} &nbsp;|&nbsp;
      Schemas analyzed: ${meta.schemas}
    </div>

    <div class="stats">
      <div class="stat"><div class="value" style="color:#ef4444">${bySeverity.HIGH.length}</div><div class="label">HIGH findings</div></div>
      <div class="stat"><div class="value" style="color:#f59e0b">${bySeverity.MEDIUM.length}</div><div class="label">MEDIUM findings</div></div>
      <div class="stat"><div class="value" style="color:#3b82f6">${bySeverity.LOW.length}</div><div class="label">LOW findings</div></div>
      <div class="stat"><div class="value">${findings.length}</div><div class="label">Total findings</div></div>
    </div>

    <h2>Summary by Category</h2>
    <table>
      <thead><tr>
        <th>Category</th><th>Name</th><th>Total</th>
        <th style="color:#ef4444">HIGH</th><th style="color:#f59e0b">MED</th><th style="color:#3b82f6">LOW</th>
      </tr></thead>
      <tbody>${summaryRows}</tbody>
    </table>

    <h2>All Findings</h2>
    ${allHtml || '<p style="color:#6b7280;font-size:14px">No findings — all checks passed.</p>'}
  </div>
</body>
</html>`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
	console.log("🔍 Phase 4: Loading matrices...");

	const backendData = loadJson("backend-routes.json");
	const frontendData = loadJson("frontend-calls.json");
	const schemaData = loadJson("schema-usage.json");

	const backendRoutes = backendData.routes;
	const frontendCalls = frontendData.calls;
	const schemas = schemaData.schemas;

	console.log(`   Backend routes:   ${backendRoutes.length}`);
	console.log(`   Frontend calls:   ${frontendCalls.length}`);
	console.log(`   Schema entries:   ${schemas.length}`);

	// Build lookup sets
	const backendRouteSet = new Set(backendRoutes.map((r) => routeKey(r.method, r.fullPath)));
	const frontendCallSet = new Set(
		frontendCalls.map((c) => routeKey(c.method, c.normalizedBackendPath)),
	);

	console.log("   Running gap analysis...");

	checkOrphanRoutes(backendRoutes, frontendCallSet);
	checkMissingRoutes(frontendCalls, backendRouteSet);
	checkMethodMismatches(backendRoutes, frontendCalls);
	checkRbacDrift(backendRoutes);
	checkOfflineGaps(frontendCalls);
	checkSchemaAlignment(backendRoutes, schemas);
	checkProxyRouting(frontendCalls);

	const bySeverity = { HIGH: 0, MEDIUM: 0, LOW: 0 };
	for (const f of findings) {
		bySeverity[f.severity] = (bySeverity[f.severity] ?? 0) + 1;
	}

	const output = {
		generatedAt: new Date().toISOString(),
		summary: {
			totalFindings: findings.length,
			bySeverity,
			byCategory: Object.fromEntries(
				Object.entries(
					findings.reduce((acc, f) => {
						acc[f.category] = (acc[f.category] ?? 0) + 1;
						return acc;
					}, {}),
				).sort(),
			),
		},
		findings,
	};

	writeFileSync(join(OUTPUT_DIR, "audit-report.json"), JSON.stringify(output, null, 2));

	const html = renderHtml(findings, {
		backendRoutes: backendRoutes.length,
		frontendCalls: frontendCalls.length,
		schemas: schemas.length,
	});
	writeFileSync(join(OUTPUT_DIR, "audit-report.html"), html);

	console.log(`\n✅ Phase 4 complete`);
	console.log(`   Total findings:   ${findings.length}`);
	console.log(`   HIGH:   ${bySeverity.HIGH}`);
	console.log(`   MEDIUM: ${bySeverity.MEDIUM}`);
	console.log(`   LOW:    ${bySeverity.LOW}`);
	console.log(`\n📄 Reports saved to scripts/audit/output/`);
	console.log(`   audit-report.json`);
	console.log(`   audit-report.html`);

	if (bySeverity.HIGH > 0) {
		console.log(`\n⚠️  ${bySeverity.HIGH} HIGH-severity findings require attention before deploy.`);
		process.exitCode = 1;
	}
}

main();
