const fs = require("node:fs");
let c = fs.readFileSync("backend/src/index.ts", "utf8");
c = c.replace(
	'import resourceRoutes from "./resources/api/routes";\n\nconst app',
	'import resourceRoutes from "./resources/api/routes";\nimport workRequestRoutes from "./work-requests/api/routes";\n\nconst app',
);
c = c.replace(
	'app.use("/api/alerts", alertsRoutes);\n\nfunction',
	'app.use("/api/alerts", alertsRoutes);\napp.use("/api/work-requests", workRequestRoutes);\n\nfunction',
);
fs.writeFileSync("backend/src/index.ts", c);
console.log("Done");
