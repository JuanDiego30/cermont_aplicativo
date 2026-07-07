import { spawnSync } from "node:child_process";

const commands = [
	// Type safety
	["npm", ["run", "typecheck"]],
	// Linting
	["npm", ["run", "lint"]],
	// Quick quality checks (routes and hardcoded roles)
	["npm", ["run", "quality:routes"]],
	["npm", ["run", "quality:hardcoded-roles"]],
	// Tests
	["npm", ["run", "test"]],
	// Staged file formatting
	["node", ["./node_modules/lint-staged/bin/lint-staged.js"]],
];

for (const [command, args] of commands) {
	const result = spawnSync(command, args, {
		cwd: process.cwd(),
		stdio: "inherit",
		shell: process.platform === "win32",
	});

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}
