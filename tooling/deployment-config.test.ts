import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateEnv } from "../packages/config/src/env";

const repoRoot = path.resolve(import.meta.dirname, "..");

function read(relativePath: string): string {
	return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("production deployment configuration", () => {
	it("uses port 4000 as the backend default", () => {
		expect(validateEnv({}).PORT).toBe(4000);
		expect(read("ecosystem.config.cjs")).toContain('PORT: "4000"');
	});

	it("fails closed when production secrets are absent", () => {
		const compose = read("docker-compose.yml");

		expect(compose).toContain("${MONGO_ROOT_USER:?");
		expect(compose).toContain("${MONGO_ROOT_PASSWORD:?");
		expect(compose).toContain("${JWT_SECRET:?");
		expect(compose).toContain("${REFRESH_TOKEN_SECRET:?");
		expect(compose).not.toContain("cermont_demo");
		expect(compose).not.toContain("Cermont2026!");
		expect(compose).not.toContain("SEED_ON_START");
	});

	it("passes public URLs at frontend image build time", () => {
		const compose = read("docker-compose.yml");
		const dockerfile = read("frontend/Dockerfile");
		const publicAppUrlAssignment = ["NEXT_PUBLIC_APP_URL=", "$", "{NEXT_PUBLIC_APP_URL}"].join("");

		expect(compose).toMatch(
			/dockerfile: frontend\/Dockerfile[\s\S]*?args:[\s\S]*?NEXT_PUBLIC_APP_URL:/,
		);
		expect(dockerfile).toContain("ARG NEXT_PUBLIC_APP_URL");
		expect(dockerfile).toContain(publicAppUrlAssignment);
	});

	it("uses readiness probes for backend dependencies and smoke checks", () => {
		expect(read("docker-compose.yml")).toContain("http://localhost:4000/api/health/ready");
		expect(read("backend/Dockerfile")).toContain("http://localhost:4000/api/health/ready");
		expect(read("scripts/smoke-docker-runtime.mjs")).toContain("/api/health/ready");
		expect(read("docker-compose.dev.yml")).toContain("image: mongo:7.0");
		expect(read("docker-compose.dev.yml")).not.toContain("mongo:7.0-alpine");
	});

	it("keeps CI and deployment workflows executable and non-duplicated", () => {
		expect(existsSync(path.join(repoRoot, ".github/workflows/ci-cd.yml"))).toBe(false);

		const deploy = read(".github/workflows/deploy.yml");
		const staging = read(".github/workflows/staging.yml");

		expect(deploy).toContain("docker compose config --quiet");
		expect(deploy).toContain("docker compose up -d --build --remove-orphans");
		expect(deploy).toContain("/api/health/ready");
		expect(deploy).not.toContain("pm2 reload cermont");

		expect(staging).toContain("docker compose config --quiet");
		expect(staging).toContain("docker compose up -d --build --remove-orphans");
		expect(staging).toContain("/api/health/ready");
		expect(staging).not.toContain("pm2 reload cermont-staging");
	});

	it("does not permit a known or missing seed password", () => {
		const seed = read("backend/src/scripts/seed.ts");
		const invalidSeedEnv = Object.fromEntries([["SEED_DEFAULT_PASSWORD", "too-short"]]);

		expect(() => validateEnv(invalidSeedEnv)).toThrow(
			"SEED_DEFAULT_PASSWORD must be at least 16 characters",
		);
		expect(seed).not.toContain('|| "Cermont2026!"');
		expect(seed).not.toContain('passwordOverride: "Cermont2026!"');
		expect(seed).toContain("SEED_DEFAULT_PASSWORD is required");
	});

	it("keeps one canonical VPS guide without embedded credentials", () => {
		const canonicalGuide = "docs/deploy/PRODUCTION_DEPLOYMENT.md";

		expect(existsSync(path.join(repoRoot, canonicalGuide))).toBe(true);
		expect(existsSync(path.join(repoRoot, "docs/deploy/DEPLOY_CONTABO_QEMU.md"))).toBe(false);
		expect(existsSync(path.join(repoRoot, "docs/deploy/DEPLOY_MANUAL_VPS.md"))).toBe(false);
		expect(existsSync(path.join(repoRoot, "docs/deploy/DEPLOY_VPS_CONTABO_GUIDE.md"))).toBe(false);

		const guide = read(canonicalGuide);
		expect(guide).toContain("Rollback");
		expect(guide).toContain("Backup");
		expect(guide).toContain("SEED_DEFAULT_PASSWORD");
		expect(guide).not.toContain("Cermont2026!");
		expect(guide).not.toContain("13.140.161.225");
		expect(guide).not.toContain("ssh root@");
		expect(read("docs/deploy/VARIABLES_ENTORNO.md")).not.toContain("SEED_ON_START");
	});
});
