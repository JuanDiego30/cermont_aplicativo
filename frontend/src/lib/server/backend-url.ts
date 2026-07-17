import { env, isProduction } from "@cermont/config";

export function getBackendBaseUrl(): string {
	const configuredUrl = env.BACKEND_URL?.trim();
	if (configuredUrl) {
		return configuredUrl.replace(/\/+$/, "");
	}
	if (isProduction()) {
		throw new Error("BACKEND_URL is required in production");
	}
	return "http://localhost:4000";
}
