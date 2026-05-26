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

const SOURCE_ROOTS = [
	"backend/src",
	"backend/tests",
	"frontend/src",
	"frontend/tests",
	"packages/shared-types/src",
	"packages/shared-types/tests",
	"tooling",
	"scripts",
	".github",
];

const SPANISH_TERMS = [
	"administrativo",
	"arnes",
	"cargando",
	"cliente",
	"configuracion",
	"costos",
	"ejecucion",
	"evidencia",
	"evidencias",
	"gerente",
	"mantenimiento",
	"nombre",
	"observaciones",
	"orden",
	"propuesta",
	"residente",
	"tecnico",
	"validacion",
];

const findings: Finding[] = [];

for (const filePath of listTextFiles(SOURCE_ROOTS)) {
	const relative = toPosix(path.relative(repoRoot(), filePath));
	if (relative === "tooling/quality/baseline.json") {
		continue;
	}

	const text = stripAccents(readText(filePath).toLowerCase());
	for (const term of SPANISH_TERMS) {
		const pattern = new RegExp(`\\b${term}\\b`, "g");
		for (const match of text.matchAll(pattern)) {
			const location = lineColumnAt(text, match.index);
			findings.push({
				rule: "spanish-source-token",
				file: relative,
				line: location.line,
				column: location.column,
				message: `Spanish source token "${term}"`,
			});
		}
	}
}

reportWithBaseline(
	"Language quality check",
	findings,
	readBaseline("tooling/quality/baseline.json"),
);

function stripAccents(value: string): string {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
