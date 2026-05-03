/**
 * Sentry error tracking configuration for Cermont S.A.S.
 *
 * To enable Sentry:
 * 1. Sign up at https://sentry.io
 * 2. Create a Next.js project
 * 3. Add `SENTRY_DSN` to your `.env`
 * 4. Run: `npm install @sentry/nextjs`
 * 5. Import this module in `app/layout.tsx`
 *
 * @module lib/monitoring/sentry
 */

import { env, isProduction } from "@cermont/shared-types/config";

/** Sentry DSN from environment — empty disables tracking */
const SENTRY_DSN = env.SENTRY_DSN ?? "";

/** Whether Sentry is configured */
export const isSentryEnabled = SENTRY_DSN.length > 0;

interface SentryScope {
	setExtra: (key: string, value: unknown) => void;
}

interface SentryModule {
	init: (options: {
		dsn: string;
		environment: string | undefined;
		tracesSampleRate: number;
		debug: boolean;
		enabled: boolean;
		ignoreErrors: string[];
	}) => void;
	withScope: (callback: (scope: SentryScope) => void) => void;
	captureException: (error: unknown) => void;
}

let sentryModule: SentryModule | null = null;
let sentryModuleLoaded = false;

async function loadSentryModule(): Promise<SentryModule | null> {
	// Cache the result to avoid re-importing
	if (sentryModuleLoaded) {
		return sentryModule;
	}

	sentryModuleLoaded = true;

	// Don't try to load Sentry if it's not enabled
	if (!isSentryEnabled) {
		sentryModule = null;
		return null;
	}

	try {
		// Dynamically construct the module path to avoid static analysis
		const prefix = "@sentry";
		const suffix = "nextjs";
		const modulePath = `${prefix}/${suffix}`;

		// Use runtime dynamic import so Sentry remains an optional dependency
		const dynamicImport = new Function("target", "return import(target);") as (
			target: string,
		) => Promise<unknown>;
		const mod = (await dynamicImport(modulePath)) as SentryModule;
		sentryModule = mod;
		return sentryModule;
	} catch {
		// @sentry/nextjs is optional - silently skip if not installed
		if (!isProduction()) {
			console.debug("[monitoring] @sentry/nextjs not installed. Sentry tracking disabled.");
		}
		sentryModule = null;
		return null;
	}
}

/**
 * Initialize Sentry for server-side error tracking.
 *
 * Call this once from `instrumentation.ts` or `app/layout.tsx`.
 */
export async function initSentry(): Promise<void> {
	if (!isSentryEnabled) {
		return;
	}

	const Sentry = await loadSentryModule();
	if (!Sentry) {
		// @sentry/nextjs not installed — silently skip
		return;
	}

	Sentry.init({
		dsn: SENTRY_DSN,
		environment: env.NODE_ENV,
		tracesSampleRate: isProduction() ? 0.1 : 1.0,
		debug: !isProduction(),
		enabled: env.NODE_ENV !== "test",

		// Filter out noisy events
		ignoreErrors: ["AbortError", "NEXT_NOT_FOUND", "NEXT_REDIRECT", "ResizeObserver loop"],
	});
}

/**
 * Capture an exception with optional context.
 */
export async function captureException(
	error: unknown,
	context?: Record<string, unknown>,
): Promise<void> {
	if (!isSentryEnabled) {
		return;
	}

	const Sentry = await loadSentryModule();
	if (!Sentry) {
		return;
	}

	if (context) {
		Sentry.withScope((scope) => {
			for (const [key, value] of Object.entries(context)) {
				scope.setExtra(key, value);
			}
			Sentry.captureException(error);
		});
	} else {
		Sentry.captureException(error);
	}
}
