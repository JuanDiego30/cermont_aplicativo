import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createSerwistRoute } from "@serwist/turbopack";

const gitRevision = spawnSync("git", ["rev-parse", "HEAD"], {
	encoding: "utf-8",
}).stdout.trim();

const revision = gitRevision || randomUUID();

const serwistRoute = createSerwistRoute({
	swSrc: "src/app/sw.ts",
	useNativeEsbuild: true,
	rebuildOnChange: true,
	globPatterns: [".next/static/**/*.js", ".next/static/**/*.css"],
	additionalPrecacheEntries: [{ url: "/~offline", revision }],
});

export const { dynamic, dynamicParams, revalidate, generateStaticParams } = serwistRoute;

type SerwistRouteContext = Parameters<typeof serwistRoute.GET>[1];

export async function GET(request: Request, context: SerwistRouteContext): Promise<Response> {
	const response = await serwistRoute.GET(request, context);
	response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
	response.headers.set("Pragma", "no-cache");
	response.headers.set("Expires", "0");
	return response;
}
