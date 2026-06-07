"use client";

import { useEffect, useState } from "react";
import { useConnectivity } from "@/lib/offline/connectivity";

const RECONNECT_INTERVAL_MS = 5_000;
const INITIAL_SECONDS_UNTIL_RETRY = Math.ceil(RECONNECT_INTERVAL_MS / 1000);

function reloadPage(): void {
	if (typeof window !== "undefined") {
		window.location.reload();
	}
}

export function OfflinePageClient() {
	const { isOnline } = useConnectivity();
	const [secondsUntilRetry, setSecondsUntilRetry] = useState(INITIAL_SECONDS_UNTIL_RETRY);

	useEffect(() => {
		if (isOnline) {
			reloadPage();
			return;
		}

		const interval = setInterval(() => {
			setSecondsUntilRetry((prev) => {
				if (prev <= 1) {
					return Math.ceil(RECONNECT_INTERVAL_MS / 1000);
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [isOnline]);

	return (
		<main className="flex min-h-screen items-center justify-center bg-[var(--surface-page)] px-6 py-12 text-[var(--foreground)]">
			<section
				className="w-full max-w-xl rounded-lg border border-border-default bg-background p-6 text-center shadow-[var(--shadow-2)]"
				aria-labelledby="offline-title"
			>
				<div
					className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-blue)]/10"
					aria-hidden="true"
				>
					<svg
						className="h-6 w-6 text-brand"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						role="presentation"
					>
						<title>Sin conexión</title>
						<path d="M2 8.82a15 15 0 0 1 20 0" />
						<path d="M5 12.86a10 10 0 0 1 14 0" />
						<path d="M8.5 16.43a5 5 0 0 1 7 0" />
						<line x1="12" y1="20" x2="12.01" y2="20" />
					</svg>
				</div>
				<p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Cermont Campo</p>
				<h1 id="offline-title" className="mt-3 text-2xl font-semibold">
					Sin conexión a internet
				</h1>
				<p className="mt-4 text-sm leading-6 text-muted-foreground">
					Puedes consultar información cargada previamente y continuar trabajando con borradores
					locales. Los cambios pendientes se sincronizarán cuando vuelva la conexión.
				</p>
				<output
					className="mt-6 flex items-center justify-center gap-2 rounded-md border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/5 px-3 py-2 text-xs text-muted-foreground"
					aria-live="polite"
				>
					<span
						className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--color-brand-green)]"
						aria-hidden="true"
					/>
					<span>
						Reintentando automáticamente en {secondsUntilRetry}
						{secondsUntilRetry === 1 ? " segundo" : " segundos"}...
					</span>
				</output>
				<button
					type="button"
					onClick={reloadPage}
					className="mt-6 inline-flex h-11 min-w-[160px] items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2"
				>
					Reintentar
				</button>
			</section>
		</main>
	);
}
