import path from "node:path";
import {
	type Finding,
	lineColumnAt,
	listTextFiles,
	readBaseline,
	readText,
	repoRoot,
	reportWithBaseline,
	toPosix,
} from "./shared";

const ROUTE_PATTERN = /router\.(get|post|patch|put|delete)\s*\(([\s\S]*?)\);/g;
const OPEN_AUTH_ROUTES = [
	"/login",
	"/refresh",
	"/forgot-password",
	"/reset-password",
	"/passkeys/login/options",
	"/passkeys/login/verify",
];

const findings: Finding[] = [];

for (const filePath of listTextFiles(["backend/src"])) {
	const relative = toPosix(path.relative(repoRoot(), filePath));
	if (!relative.endsWith("routes.ts")) {
		continue;
	}

	const text = readText(filePath);
	const usesRouterAuth = /router\.use\s*\(\s*authenticate\s*\)/.test(text);
	const usesRouterAuthz = /router\.use\s*\(\s*authorize\s*\(/.test(text);
	for (const match of text.matchAll(ROUTE_PATTERN)) {
		const routeBlock = match[0];
		const routePath = getRoutePath(routeBlock);
		const location = lineColumnAt(text, match.index);
		const isOpen = routePath !== "" && OPEN_AUTH_ROUTES.includes(routePath);
		const hasAuth = usesRouterAuth || /\bauthenticate\b/.test(routeBlock);
		const hasAuthz =
			usesRouterAuthz ||
			/\bauthorize\s*\(/.test(routeBlock) ||
			/\bauthorizeAllAuthenticated\s*\(/.test(routeBlock) ||
			/All roles|all authenticated|Todos/.test(routeBlock);

		const needsBodyValidation = /router\.(post|patch|put)\s*\(/.test(routeBlock) && !isOpen;
		const hasValidation =
			/\bvalidate(Body|Query|Params)?\s*\(/.test(routeBlock) ||
			/No body validation needed/.test(routeBlock);

		if (!isOpen && !hasAuth) {
			findings.push({
				rule: "route-missing-authentication",
				file: relative,
				line: location.line,
				column: location.column,
				message: "Route does not declare authentication",
			});
		}

		if (!isOpen && !hasAuthz) {
			findings.push({
				rule: "route-missing-authorization-policy",
				file: relative,
				line: location.line,
				column: location.column,
				message: "Route does not declare an authorization policy",
			});
		}

		if (needsBodyValidation && !hasValidation) {
			findings.push({
				rule: "route-missing-validation",
				file: relative,
				line: location.line,
				column: location.column,
				message: "Mutating route does not declare validation",
			});
		}
	}
}

reportWithBaseline(
	"Backend route quality check",
	findings,
	readBaseline("tooling/quality/baseline.json"),
);

function getRoutePath(routeBlock: string): string {
	const match = routeBlock.match(/router\.(?:get|post|patch|put|delete)\s*\(\s*["']([^"']+)["']/);
	return match?.[1] ?? "";
}
