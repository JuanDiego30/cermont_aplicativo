"use client";

import { Download, Smartphone, Wifi, X } from "lucide-react";
import { useEffect, useMemo, useReducer, useState } from "react";
import { useHydrated } from "@/core/hooks/useHydrated";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "cermont:pwa-install-dismissed-at";
const DISMISS_BANNER_KEY = "pwa-banner-dismissed";
const DISMISS_WINDOW_MS = 1000 * 60 * 60 * 24 * 7;

interface PwaPromptState {
	deferredPrompt?: BeforeInstallPromptEvent;
	isDismissed: boolean;
}

type PwaPromptAction =
	| { type: "prompt-available"; prompt: BeforeInstallPromptEvent }
	| { type: "installed" }
	| { type: "dismissed" };

function isStandaloneMode(): boolean {
	if (typeof window === "undefined") {
		return false;
	}

	return window.matchMedia("(display-mode: standalone)").matches;
}

function getInitialDismissedState(): boolean {
	if (typeof window === "undefined") {
		return true;
	}

	const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) ?? "0");
	return Date.now() - dismissedAt < DISMISS_WINDOW_MS;
}

function pwaPromptReducer(state: PwaPromptState, action: PwaPromptAction): PwaPromptState {
	switch (action.type) {
		case "prompt-available":
			return { deferredPrompt: action.prompt, isDismissed: false };
		case "installed":
			return { deferredPrompt: undefined, isDismissed: true };
		case "dismissed":
			return { ...state, isDismissed: true };
	}
}

export function PwaInstallPrompt() {
	const isHydrated = useHydrated();
	const [state, dispatch] = useReducer(pwaPromptReducer, {
		deferredPrompt: undefined,
		isDismissed: getInitialDismissedState(),
	});
	const isIosSafari = useMemo(() => {
		if (typeof window === "undefined") {
			return false;
		}

		const userAgent = window.navigator.userAgent.toLowerCase();
		const isiOS = /iphone|ipad|ipod/.test(userAgent);
		const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios/.test(userAgent);
		return isiOS && isSafari;
	}, []);
	const [isStandalone, setIsStandalone] = useState(() => isStandaloneMode());
	const { deferredPrompt, isDismissed } = state;

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const handleBeforeInstallPrompt = (event: Event) => {
			event.preventDefault();
			dispatch({ type: "prompt-available", prompt: event as BeforeInstallPromptEvent });
		};

		const handleInstalled = () => {
			setIsStandalone(true);
			dispatch({ type: "installed" });
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		window.addEventListener("appinstalled", handleInstalled);

		return () => {
			window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
			window.removeEventListener("appinstalled", handleInstalled);
		};
	}, []);

const shouldRender = useMemo(() => {
	if (!isHydrated || isStandalone || isDismissed) {
		return false;
	}

	return !!deferredPrompt || isIosSafari;
}, [deferredPrompt, isDismissed, isHydrated, isIosSafari, isStandalone]);

	const dismiss = () => {
		if (typeof window !== "undefined") {
			window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
			window.localStorage.setItem(DISMISS_BANNER_KEY, "true");
		}
		dispatch({ type: "dismissed" });
	};

	const install = async () => {
		if (!deferredPrompt) {
			return;
		}

		await deferredPrompt.prompt();
		const choice = await deferredPrompt.userChoice;
		if (choice.outcome === "accepted") {
			dispatch({ type: "installed" });
			return;
		}

		dismiss();
	};

	if (!shouldRender) {
		return null;
	}

	return (
		<div className="motion-panel fixed inset-x-4 bottom-24 z-50 rounded-2xl border border-hairline bg-canvas/95 p-4 shadow-2xl backdrop-blur md:bottom-6 md:left-auto md:right-6 md:max-w-sm dark:border-zinc-700 dark:bg-zinc-950/90">
			<div className="flex items-start justify-between gap-3">
				<div className="flex gap-3">
					<div className="rounded-2xl bg-zinc-900 p-3 text-white dark:bg-zinc-100 dark:text-ink">
						{deferredPrompt ? (
							<Download aria-hidden="true" className="size-5" />
						) : (
							<Smartphone aria-hidden="true" className="size-5" />
						)}
					</div>
					<div>
						<p className="text-sm font-semibold text-ink dark:text-muted-text">
							Instalar Cermont Campo
						</p>
						<p className="mt-1 text-sm text-steel dark:text-muted-text">
							Acceso rápido, interfaz completa y mejor continuidad cuando la señal falla.
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={dismiss}
					className="motion-button rounded-full p-1 text-steel hover:bg-zinc-100 hover:text-ink dark:hover:bg-zinc-800 dark:hover:text-muted-text"
					aria-label="Cerrar aviso de instalación"
				>
					<X aria-hidden="true" className="size-4" />
				</button>
			</div>

			<div className="mt-4 rounded-xl bg-surface p-3 text-sm text-charcoal dark:bg-canvas dark:text-stone">
				{deferredPrompt ? (
					<div className="flex items-start gap-2">
						<Wifi aria-hidden="true" className="mt-0.5 size-4 text-brand-annotate" />
						<p>
							Instálala para abrir órdenes, evidencias e inspecciones con experiencia móvil más
							estable.
						</p>
					</div>
				) : (
					<p>
						En iPhone o iPad usa Compartir y luego Añadir a pantalla de inicio para dejar la app
						lista en terreno.
					</p>
				)}
			</div>

			<div className="mt-4 flex gap-2">
				{deferredPrompt ? (
					<button
						type="button"
						onClick={install}
						className="motion-button flex-1 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-ink dark:hover:bg-canvas"
					>
						Instalar ahora
					</button>
				) : null}
				<button
					type="button"
					onClick={dismiss}
					className="motion-button rounded-xl border border-hairline px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-surface dark:border-zinc-700 dark:text-stone dark:hover:bg-zinc-900"
				>
					Más tarde
				</button>
			</div>
		</div>
	);
}
