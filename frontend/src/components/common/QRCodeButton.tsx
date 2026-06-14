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
						className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
						aria-label={`Código QR: ${label}`}
						title="Ver código QR"
					>
						<QrCode className="size-5" aria-hidden="true" />
					</button>
				) : (
					<button
						type="button"
						className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
						aria-label={`Código QR: ${label}`}
					>
						<QrCode className="size-4" aria-hidden="true" />
						<span>QR</span>
					</button>
				)}
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
				<Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl focus:outline-none dark:border-zinc-700 dark:bg-zinc-900">
					<Dialog.Close asChild>
						<button
							type="button"
							className="absolute right-3 top-3 rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
							aria-label="Cerrar"
						>
							<X className="size-5" />
						</button>
					</Dialog.Close>

					<Dialog.Title className="text-center text-lg font-semibold text-zinc-900 dark:text-white">
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
								className="flex h-56 w-56 items-center justify-center rounded-lg bg-red-50 p-5 text-center text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400"
								role="alert"
							>
								{qrState.message}
							</div>
						) : (
							<div className="flex h-56 w-56 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800">
								<QrCode className="size-12 animate-pulse text-zinc-300 dark:text-zinc-600" />
							</div>
						)}
					</div>

					<p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
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
