import { spawnSync } from "node:child_process";

const commands = [
	["npm", ["run", "typecheck"]],
	["npm", ["run", "lint"]],
	["npm", ["run", "test"]],
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
