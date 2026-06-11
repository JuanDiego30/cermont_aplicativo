import path from "node:path";
import { validateEnv } from "@cermont/config";
import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const monorepoRoot = path.resolve(__dirname, "..");
const env = validateEnv();
// Backend runs on port 4000 (see backend/package.json scripts)
// BACKEND_URL es la única fuente de verdad. El fallback localhost:4000 funciona
// para desarrollo local y npm run start. Docker Compose inyecta explícitamente
// BACKEND_URL=http://backend:4000 en el contenedor frontend.
const defaultBackendUrl = "http://localhost:4000";
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
		// All public images are already optimized (WebP/AVIF via sharp in the
		// backend, manually optimized for landing/login assets). Disabling
		// the built-in optimizer avoids 400 errors from re-optimizing
		// already-processed files and reduces server CPU load.
		unoptimized: true,
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
//
// SAFETY: images.unoptimized se re-aplica DESPUÉS de withSerwist para
// garantizar que ningún wrapper sobreescriba esta bandera. Next.js sin
// unoptimized=true genera URL /_next/image que rompen assets estáticos.
export default withSerwist({
	...nextConfig,
	images: {
		unoptimized: true,
	},
});
