"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { QrCode, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createLogger } from "@/lib/monitoring/logger";

const logger = createLogger("QRCodeButton");

type QrState =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "ready"; dataUrl: string }
	| { status: "error"; message: string };

interface QRCodeButtonProps {
	/** URL or text to encode in the QR code */
	data: string;
	/** Human-readable label for the QR content (e.g. asset name, order code) */
	label: string;
	/** Optional variant for the trigger button */
	variant?: "icon" | "button";
}

/**
 * QRCodeButton — Displays a QR code in a Radix UI dialog.
 * Uses the `qrcode` package to generate a canvas-based QR code.
 */
export function QRCodeButton({ data, label, variant = "icon" }: QRCodeButtonProps) {
	const [open, setOpen] = useState(false);
	const [qrState, setQrState] = useState<QrState>({ status: "idle" });

	const handleOpen = useCallback(() => {
		setOpen(true);
		setQrState({ status: "loading" });
	}, []);

	// Generate QR code when state transitions to loading
	useEffect(() => {
		if (qrState.status !== "loading") {
			return;
		}

		let cancelled = false;

		(async () => {
			try {
				const QRCode = await import("qrcode");
				const payload = data.startsWith("/")
					? new URL(data, window.location.origin).toString()
					: data;
				const url = await QRCode.toDataURL(payload, {
					width: 280,
					margin: 2,
					color: {
						dark: "#1a1a2e",
						light: "#ffffff",
					},
				});
				if (!cancelled) {
					setQrState({ status: "ready", dataUrl: url });
				}
			} catch (error) {
				logger.error("QR generation failed", {
					error: error instanceof Error ? error.message : String(error),
				});
				if (!cancelled) {
					setQrState({
						status: "error",
						message: "No se pudo generar el codigo QR.",
					});
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [qrState.status, data]);

	const handleDownload = useCallback(() => {
		if (qrState.status !== "ready") {
			return;
		}
		const a = document.createElement("a");
		a.href = qrState.dataUrl;
		a.download = `${label.replaceAll(/[^a-zA-Z0-9_-]+/g, "_")}_qr.png`;
		a.click();
	}, [qrState, label]);

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(isOpen) => {
				if (isOpen) {
					handleOpen();
				} else {
					setOpen(false);
					setQrState({ status: "idle" });
				}
			}}
		>
			<Dialog.Trigger asChild>
				{variant === "icon" ? (
					<button
						type="button"
						className="inline-flex items-center justify-center rounded-lg p-2 text-steel transition hover:bg-zinc-100 hover:text-charcoal dark:text-stone dark:hover:bg-zinc-800 dark:hover:text-stone"
						aria-label={`Código QR: ${label}`}
						title="Ver código QR"
					>
						<QrCode className="size-5" aria-hidden="true" />
					</button>
				) : (
					<button
						type="button"
						className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm font-medium text-charcoal transition hover:bg-surface dark:border-zinc-700 dark:bg-canvas dark:text-muted-text dark:hover:bg-zinc-800"
						aria-label={`Código QR: ${label}`}
					>
						<QrCode className="size-4" aria-hidden="true" />
						<span>QR</span>
					</button>
				)}
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
				<Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-hairline bg-canvas p-6 shadow-xl focus:outline-none dark:border-zinc-700 dark:bg-canvas">
					<Dialog.Close asChild>
						<button
							type="button"
							className="absolute right-3 top-3 rounded-lg p-1 text-stone transition hover:bg-zinc-100 hover:text-steel dark:hover:bg-zinc-800 dark:hover:text-muted-text"
							aria-label="Cerrar"
						>
							<X className="size-5" />
						</button>
					</Dialog.Close>

					<Dialog.Title className="text-center text-lg font-semibold text-ink dark:text-white">
						{label}
					</Dialog.Title>

					<div className="mt-5 flex justify-center">
						{qrState.status === "ready" ? (
							<Image
								src={qrState.dataUrl}
								alt={`Código QR: ${label}`}
								width={224}
								height={224}
								unoptimized
								className="h-56 w-56 rounded-lg"
							/>
						) : qrState.status === "error" ? (
							<div
								className="flex h-56 w-56 items-center justify-center rounded-lg bg-danger-bg p-5 text-center text-sm text-brand-error dark:bg-red-900/10 dark:text-brand-error"
								role="alert"
							>
								{qrState.message}
							</div>
						) : (
							<div className="flex h-56 w-56 items-center justify-center rounded-lg bg-surface dark:bg-surface">
								<QrCode className="size-12 animate-pulse text-muted-text dark:text-steel" />
							</div>
						)}
					</div>

					<p className="mt-4 text-center text-xs text-steel dark:text-stone">
						Escanee con su dispositivo móvil para ver los detalles
					</p>

					{qrState.status === "ready" ? (
						<div className="mt-4 flex justify-center">
							<button
								type="button"
								onClick={handleDownload}
								className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-brand-hover)]"
							>
								Descargar QR
							</button>
						</div>
					) : null}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
