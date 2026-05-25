import path from "node:path";
import { isProduction, validateEnv } from "@cermont/config";
import type { NextConfig } from "next";

const monorepoRoot = path.resolve(__dirname, "../..");
const env = validateEnv();
// Backend runs on port 4000 (see backend/package.json scripts)
const defaultBackendUrl = isProduction() ? "http://backend:4000" : "http://localhost:4000";
const backendUrl = (env.BACKEND_URL || defaultBackendUrl).replace(/\/+$/, "");
const isWindowsBuild = process.platform === "win32";
const localDevOrigins = ["127.0.0.1", "localhost", "192.168.56.1"] as const;

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
				source: "/api/backend/:path*",
				destination: `${backendUrl}/api/:path*`,
			},
		];
	},
};

export default nextConfig;
