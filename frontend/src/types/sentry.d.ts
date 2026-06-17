/**
 * Ambient module declaration for the optional @sentry/nextjs dependency.
 *
 * Sentry is an optional runtime dependency in Cermont. The application
 * gracefully falls back when the module is not installed. This declaration
 * tells TypeScript that the module exists at the type level so we can use
 * a direct dynamic import without `new Function()` (which is flagged as a
 * security risk by React Doctor and CSP-aware linters).
 */
declare module "@sentry/nextjs" {
	interface SentryScope {
		setExtra: (key: string, value: unknown) => void;
	}

	interface SentryInitOptions {
		dsn: string;
		environment: string | undefined;
		tracesSampleRate: number;
		debug: boolean;
		enabled: boolean;
		ignoreErrors: string[];
	}

	interface SentryModule {
		init: (options: SentryInitOptions) => void;
		withScope: (callback: (scope: SentryScope) => void) => void;
		captureException: (error: unknown) => void;
	}

	export function init(options: SentryInitOptions): void;
	export function withScope(callback: (scope: SentryScope) => void): void;
	export function captureException(error: unknown): void;
}
