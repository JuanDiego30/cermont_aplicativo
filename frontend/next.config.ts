import path from "node:path";
import { isProduction, validateEnv } from "@cermont/shared-types/config";
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const monorepoRoot = path.resolve(__dirname, "..");
const env = validateEnv();
const defaultBackendUrl = isProduction() ? "http://backend:4000" : "http://127.0.0.1:5000";
const backendUrl = (env.BACKEND_URL || defaultBackendUrl).replace(/\/+$/, "");

// NOTE: standalone output disabled on Windows due to Next.js file tracing
// issues on NTFS. Docker builds run on Alpine Linux where this works correctly.
const isWindowsBuild = process.platform === "win32";

const withSerwist = withSerwistInit({
	swSrc: "src/sw.ts",
	swDest: "public/sw.js",
	disable: process.env.NODE_ENV === "development",
	register: true,
	reloadOnOnline: true,
	scope: "/",
	swUrl: "/sw.js",
	additionalPrecacheEntries: [
		{ url: "/offline", revision: Date.now().toString() },
		{ url: "/login", revision: Date.now().toString() },
	],
	globPublicPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
	exclude: [/\.map$/, /^manifest.*\.js$/],
});

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
	// Allow dev origins for HMR WebSocket connections
	// This fixes WebSocket connection errors for _next/webpack-hmr
	allowedDevOrigins: ["127.0.0.1", "localhost", "10.0.2.2", "192.168.56.1"],
	async rewrites() {
		return [
			{
				source: "/api/backend/:path*",
				destination: `${backendUrl}/api/:path*`,
			},
		];
	},
};

export default withSerwist(nextConfig);
