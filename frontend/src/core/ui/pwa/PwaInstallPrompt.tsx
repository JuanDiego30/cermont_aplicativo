"use client";

import { Download, Smartphone, Wifi, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "cermont:pwa-install-dismissed-at";
const DISMISS_WINDOW_MS = 1000 * 60 * 60 * 24 * 7;

function isStandaloneMode(): boolean {
	if (typeof window === "undefined") {
		return false;
	}

	return window.matchMedia("(display-mode: standalone)").matches;
}

export function PwaInstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
	const [isIosSafari] = useState(() => {
		if (typeof window === "undefined") {
			return false;
		}

		const userAgent = window.navigator.userAgent.toLowerCase();
		const isiOS = /iphone|ipad|ipod/.test(userAgent);
		const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios/.test(userAgent);
		return isiOS && isSafari;
	});
	const [isStandalone, setIsStandalone] = useState(() => isStandaloneMode());
	const [isDismissed, setIsDismissed] = useState(() => {
		if (typeof window === "undefined") {
			return true;
		}

		const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) ?? "0");
		return Date.now() - dismissedAt < DISMISS_WINDOW_MS;
	});

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const handleBeforeInstallPrompt = (event: Event) => {
			event.preventDefault();
			setDeferredPrompt(event as BeforeInstallPromptEvent);
			setIsDismissed(false);
		};

		const handleInstalled = () => {
			setDeferredPrompt(null);
			setIsStandalone(true);
			setIsDismissed(true);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		window.addEventListener("appinstalled", handleInstalled);

		return () => {
			window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
			window.removeEventListener("appinstalled", handleInstalled);
		};
	}, []);

	const shouldRender = useMemo(() => {
		if (isStandalone || isDismissed) {
			return false;
		}

		return Boolean(deferredPrompt) || isIosSafari;
	}, [deferredPrompt, isDismissed, isIosSafari, isStandalone]);

	const dismiss = () => {
		if (typeof window !== "undefined") {
			window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
		}
		setIsDismissed(true);
	};

	const install = async () => {
		if (!deferredPrompt) {
			return;
		}

		await deferredPrompt.prompt();
		const choice = await deferredPrompt.userChoice;
		if (choice.outcome === "accepted") {
			setDeferredPrompt(null);
			setIsDismissed(true);
			return;
		}

		dismiss();
	};

	if (!shouldRender) {
		return null;
	}

	return (
		<div className="fixed inset-x-4 bottom-24 z-50 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur md:bottom-6 md:left-auto md:right-6 md:max-w-sm dark:border-slate-700 dark:bg-slate-950/90">
			<div className="flex items-start justify-between gap-3">
				<div className="flex gap-3">
					<div className="rounded-2xl bg-slate-900 p-3 text-white dark:bg-slate-100 dark:text-slate-900">
						{deferredPrompt ? (
							<Download aria-hidden="true" className="h-5 w-5" />
						) : (
							<Smartphone aria-hidden="true" className="h-5 w-5" />
						)}
					</div>
					<div>
						<p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
							Install Cermont Field
						</p>
						<p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
							Quick access, full interface, and better continuity when signal drops.
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={dismiss}
					className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
					aria-label="Close install prompt"
				>
					<X aria-hidden="true" className="h-4 w-4" />
				</button>
			</div>

			<div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
				{deferredPrompt ? (
					<div className="flex items-start gap-2">
						<Wifi aria-hidden="true" className="mt-0.5 h-4 w-4 text-emerald-600" />
						<p>
							Install it to open work orders, evidence, and inspections with a steadier mobile
							experience.
						</p>
					</div>
				) : (
					<p>
						On iPhone or iPad, use Share and then Add to Home Screen to keep the app ready in the
						field.
					</p>
				)}
			</div>

			<div className="mt-4 flex gap-2">
				{deferredPrompt ? (
					<button
						type="button"
						onClick={install}
						className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
					>
						Install now
					</button>
				) : null}
				<button
					type="button"
					onClick={dismiss}
					className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
				>
					Later
				</button>
			</div>
		</div>
	);
}
