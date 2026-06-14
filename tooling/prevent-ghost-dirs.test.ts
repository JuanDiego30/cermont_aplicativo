import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const scriptPath = path.resolve("tooling/prevent-ghost-dirs.ts");
const tsxCliPath = path.resolve("node_modules/tsx/dist/cli.mjs");
const temporaryDirectories: string[] = [];

afterEach(() => {
	for (const directory of temporaryDirectories.splice(0)) {
		rmSync(directory, { recursive: true, force: true });
	}
});

describe("prevent-ghost-dirs", () => {
	it("preserves the stabilization plan directory", () => {
		const workspace = mkdtempSync(path.join(tmpdir(), "cermont-ghost-check-"));
		temporaryDirectories.push(workspace);

		const planDirectory = path.join(workspace, ".sisyphus", "plans");
		mkdirSync(planDirectory, { recursive: true });
		writeFileSync(
			path.join(planDirectory, "cermont-production-stabilization.md"),
			"# Stabilization plan\n",
		);
		writeFileSync(
			path.join(workspace, "package.json"),
			JSON.stringify({ workspaces: ["backend", "frontend", "packages/*"] }),
		);
		writeFileSync(path.join(workspace, "turbo.json"), JSON.stringify({ tasks: {} }));

		const result = spawnSync(process.execPath, [tsxCliPath, scriptPath], {
			cwd: workspace,
			encoding: "utf8",
		});

		expect(result.status).toBe(0);
		expect(existsSync(planDirectory)).toBe(true);
	});
});
