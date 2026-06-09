import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createSerwistRoute } from "@serwist/turbopack";

// Git revision is used for service worker cache busting.
// In Docker builds there's no .git directory, so we fall back to a random UUID.
const revision = (() => {
	try {
		const result = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" });
		return (result.stdout || "").trim() || randomUUID();
	} catch {
		return randomUUID();
	}
})();

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
