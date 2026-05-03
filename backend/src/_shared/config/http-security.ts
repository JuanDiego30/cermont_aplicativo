import { ipKeyGenerator } from "express-rate-limit";

type CorsOriginOptions = {
	frontendUrl?: string;
	nodeEnv: string;
};

const LOCAL_DEV_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"] as const;


export function resolveTrustProxySetting(nodeEnv: string): false | 1 {
	return nodeEnv === "production" ? 1 : false;
}

export function buildAllowedCorsOrigins({ frontendUrl, nodeEnv }: CorsOriginOptions): string[] {
	const origins = [frontendUrl, ...(nodeEnv === "production" ? [] : LOCAL_DEV_ORIGINS)].filter(
		(origin): origin is string => Boolean(origin),
	);

	return Array.from(new Set(origins));
}

export function resolveRateLimitKey(
	ip: string | undefined,
	remoteAddress: string | undefined,
): string {
	return ipKeyGenerator(resolveRateLimitSourceIp(ip, remoteAddress));
}

export function resolveRateLimitSourceIp(
	ip: string | undefined,
	remoteAddress: string | undefined,
): string {
	return ip ?? remoteAddress ?? "0.0.0.0";
}
