"use client";

import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface QRScannerProps {
	onScan: (data: string) => void;
	onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [error, setError] = useState<string | null>(null);
	const [scannerReady, setScannerReady] = useState(false);

	// Stable refs for callbacks — effect depends only on stable refs
	const onScanRef = useRef(onScan);
	const onCloseRef = useRef(onClose);
	useEffect(() => {
		onScanRef.current = onScan;
		onCloseRef.current = onClose;
	}, [onScan, onClose]);

	useEffect(() => {
		let active = true;
		let scannerInstance: Html5Qrcode | null = null;
		const start = async () => {
			try {
				const scanner = new Html5Qrcode("qr-reader-container");
				scannerInstance = scanner;
				scannerRef.current = scanner;
				if (!active) {
					return;
				}
				setScannerReady(true);
				await scanner.start(
					{ facingMode: "environment" },
					{ fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.7777 },
					(decodedText) => {
						if (active) {
							onScanRef.current(decodedText);
							onCloseRef.current();
						}
					},
					() => {},
				);
			} catch {
				if (active) {
					setError("No se pudo iniciar la cámara para escanear.");
				}
			}
		};
		start();
		return () => {
			active = false;
			const cleanup = async () => {
				try {
					if (scannerInstance) {
						await scannerInstance.stop();
					}
				} catch {
					// ignore cleanup errors
				}
				try {
					if (scannerInstance) {
						await scannerInstance.clear();
					}
				} catch {
					// ignore cleanup errors
				}
			};
			cleanup();
		};
	}, []);

	return (
		<div className="fixed inset-0 z-50 flex flex-col bg-black">
			<div className="flex items-center justify-between p-4">
				<h2 className="text-white text-lg font-semibold">Escanear código QR</h2>
				<button type="button" onClick={onClose} className="text-white" aria-label="Cerrar escáner">
					<X className="size-6" />
				</button>
			</div>
			<div className="flex flex-1 items-center justify-center">
				<div className="relative w-full max-w-md">
					{/* QR container — MUST remain mounted for scanner instance. Hide via CSS only. */}
					<div
						id="qr-reader-container"
						ref={containerRef}
						className="w-full"
						style={scannerReady && !error ? {} : { display: "none" }}
					/>
					{/* Error overlay — shown on top of scanner container, never unmounts it */}
					{error && (
						<div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-8">
							<p className="text-brand-error mb-4">{error}</p>
							<button
								type="button"
								onClick={onClose}
								className="text-[var(--color-brand)] underline"
							>
								Cerrar
							</button>
						</div>
					)}
				</div>
			</div>
			<p className="text-center text-stone pb-8 text-sm">
				Apunta la cámara al código QR del equipo
			</p>
		</div>
	);
}
