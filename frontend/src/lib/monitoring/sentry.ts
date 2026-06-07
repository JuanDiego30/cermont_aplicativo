/**
 * Optional Sentry integration placeholder.
 *
 * The project currently does not install `@sentry/nextjs`. This module keeps
 * the `initSentry()` contract used by the app layout without triggering a
 * build-time module resolution warning. A future observability task can replace
 * this no-op with a real Sentry adapter after adding the dependency explicitly.
 */

import { env } from "@cermont/config";

const SENTRY_DSN = env.SENTRY_DSN ?? "";

export async function initSentry(): Promise<void> {
	if (SENTRY_DSN.length === 0) {
		return;
	}

	return;
}
