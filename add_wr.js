const fs = require("node:fs");
const path = "backend/src/index.ts";
let c = fs.readFileSync(path, "utf8");

// First replacement: add import after resourceRoutes
c = c.replace(
	'import resourceRoutes from "./resources/api/routes";\n\nconst app',
	'import resourceRoutes from "./resources/api/routes";\nimport workRequestRoutes from "./work-requests/api/routes";\n\nconst app',
);

// Second replacement: add route before getBackendVersion function
c = c.replace(
	'app.use("/api/alerts", alertsRoutes);\n\nfunction getBackendVersion',
	'app.use("/api/alerts", alertsRoutes);\napp.use("/api/work-requests", workRequestRoutes);\n\nfunction getBackendVersion',
);

fs.writeFileSync(path, c);
console.log("Successfully added work-requests routes to index.ts");
