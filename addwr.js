const fs = require("node:fs");

const path = "backend/src/index.ts";
const lines = fs.readFileSync(path, "utf8").split("\n");

const importIdx = lines.findIndex((l) => l.includes("import resourceRoutes"));
const routeIdx = lines.findIndex((l) => l.includes('app.use("/api/alerts"'));

if (importIdx !== -1) {
	lines.splice(importIdx + 1, 0, 'import workRequestRoutes from "./work-requests/api/routes";');
}

if (routeIdx !== -1) {
	lines.splice(routeIdx + 1, 0, 'app.use("/api/work-requests", workRequestRoutes);');
}

fs.writeFileSync(path, lines.join("\n"));
console.log("Done - work-requests routes added");
console.log("Import at line:", importIdx + 1);
console.log("Route at line:", routeIdx + 1);
