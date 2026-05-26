const fs = require("node:fs");
const path = require("node:path");

// English → Spanish role mapping (only for code, not UI text)
const ROLE_MAP = {
	'"manager"': '"gerente"',
	"'manager'": "'gerente'",
	'"administrator"': '"administrativo"',
	"'administrator'": "'administrativo'",
	'"technician"': '"tecnico"',
	"'technician'": "'tecnico'",
	'"operator"': '"operador"',
	"'operator'": "'operador'",
	'"resident_engineer"': '"residente"',
	"'resident_engineer'": "'residente'",
	'"hse_coordinator"': '"hes"',
	"'hse_coordinator'": "'hes'",
	'"client"': '"cliente"',
	"'client'": "'cliente'",
};

// Paths to scan
const dirs = ["frontend/src", "frontend/tests", "backend/src", "backend/tests"];

const exts = [".ts", ".tsx"];

let totalFiles = 0;
let totalChanges = 0;

for (const dir of dirs) {
	if (!fs.existsSync(dir)) {
		continue;
	}
	const entries = fs.readdirSync(dir, { recursive: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry);
		if (!fs.statSync(fullPath).isFile()) {
			continue;
		}
		if (!exts.includes(path.extname(fullPath))) {
			continue;
		}

		let content = fs.readFileSync(fullPath, "utf8");
		let changed = false;
		let fileChanges = 0;

		for (const [eng, spa] of Object.entries(ROLE_MAP)) {
			// Use word boundary to avoid partial matches
			const regex = new RegExp(eng.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
			const matchCount = (content.match(regex) || []).length;
			if (matchCount > 0) {
				content = content.replace(regex, spa);
				changed = true;
				fileChanges += matchCount;
			}
		}

		if (changed) {
			fs.writeFileSync(fullPath, content, "utf8");
			totalFiles++;
			totalChanges += fileChanges;
			console.log(`Fixed ${fileChanges} roles in ${dir}/${entry}`);
		}
	}
}

console.log(`\nDone. Fixed ${totalChanges} role references across ${totalFiles} files.`);
