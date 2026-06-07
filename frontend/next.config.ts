import path from "node:path";
import { isProduction, validateEnv } from "@cermont/config";
import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const monorepoRoot = path.resolve(__dirname, "../..");
const env = validateEnv();
// Backend runs on port 4000 (see backend/package.json scripts)
const defaultBackendUrl = isProduction() ? "http://backend:4000" : "http://localhost:4000";
const backendUrl = (env.BACKEND_URL || defaultBackendUrl).replace(/\/+$/, "");
const isWindowsBuild = process.platform === "win32";
const localDevOrigins = ["127.0.0.1", "localhost", "192.168.56.1"] as const;
const swFlag = process.env.NEXT_PUBLIC_ENABLE_SW;
const swDisabledByFlag = swFlag === "false" || swFlag === "0";
// Kept for compatibility with layout/SerwistProvider. The Service Worker is
// available only in production builds; offline QA must use `next build/start`.
export const enableServiceWorker = !swDisabledByFlag && process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
	...(isWindowsBuild
		? {}
		: {
				output: "standalone" as const,
				outputFileTracingRoot: monorepoRoot,
			}),
	transpilePackages: ["@cermont/shared-types"],
	experimental: {
		serverActions: {
			bodySizeLimit: "4mb",
		},
		optimizePackageImports: ["lucide-react", "date-fns"],
	},
	poweredByHeader: false,
	images: {
		minimumCacheTTL: 60,
		formats: ["image/webp"],
	},
	allowedDevOrigins: [...localDevOrigins],
	async rewrites() {
		return [
			{
				source: "/uploads/:path*",
				destination: `${backendUrl}/uploads/:path*`,
			},
		];
	},
};

// `withSerwist` from `@serwist/turbopack` is a thin wrapper that wires esbuild
// into the build pipeline so the Route Handler at `src/app/serwist/route.ts`
// can compile and serve the service worker at `/serwist/sw.js`.
// It does NOT take legacy options (swSrc, swDest, swUrl, etc.) — those moved
// to the Route Handler and `sw.ts` itself.
export default withSerwist(nextConfig);
