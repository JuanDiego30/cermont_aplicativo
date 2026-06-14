"use client";

import { Camera, CameraOff, ScanLine, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createLogger } from "@/lib/monitoring/logger";

const logger = createLogger("BarcodeScanner");

interface BarcodeScannerProps {
	/** Called when a barcode is successfully scanned or entered manually */
	onDetected: (value: string) => void;
	/** Optional label for the scan area */
	label?: string;
	/** Optional placeholder for manual input */
	placeholder?: string;
}

type ScanState = "idle" | "scanning" | "detected" | "error" | "unsupported";
type DetectorSupport = "checking" | "supported" | "unsupported";
type NativeBarcodeDetector = InstanceType<NonNullable<Window["BarcodeDetector"]>>;

/**
 * BarcodeScanner — Uses the browser's BarcodeDetector API (Chromium) to scan
 * barcodes via the device camera. Falls back to manual text input when the API
 * is unavailable (Firefox, Safari).
 */
export function BarcodeScanner({
	onDetected,
	label = "Escanear código",
	placeholder = "Ingrese el código manualmente",
}: BarcodeScannerProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const detectorRef = useRef<NativeBarcodeDetector | null>(null);
	const [scanState, setScanState] = useState<ScanState>(() => {
		if (typeof window === "undefined" || !window.BarcodeDetector) {
			return "unsupported";
		}
		return "idle";
	});
	const [manualValue, setManualValue] = useState("");
	const [detectorSupport, _setDetectorSupport] = useState<DetectorSupport>(() => {
		if (typeof window === "undefined") {
			return "checking";
		}
		if (window.BarcodeDetector) {
			detectorRef.current = new window.BarcodeDetector({
				formats: [
					"qr_code",
					"ean_13",
					"ean_8",
					"code_128",
					"code_39",
					"data_matrix",
					"upc_a",
					"upc_e",
				],
			});
			return "supported";
		}
		return "unsupported";
	});
	const [errorMessage, setErrorMessage] = useState("");

	const releaseCamera = useCallback(() => {
		if (streamRef.current) {
			for (const track of streamRef.current.getTracks()) {
				track.stop();
			}
			streamRef.current = null;
		}
	}, []);

	const startCamera = useCallback(async () => {
		try {
			setScanState("scanning");
			setErrorMessage("");
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
			});
			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				await videoRef.current.play();
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Error al acceder a la cámara";
			setErrorMessage(msg);
			setScanState("error");
		}
	}, []);

	const stopCamera = useCallback(() => {
		releaseCamera();
		setScanState("idle");
	}, [releaseCamera]);

	// Use refs to avoid effect re-subscribing on callback changes
	const onDetectedRef = useRef(onDetected);
	onDetectedRef.current = onDetected;
	const releaseCameraRef = useRef(releaseCamera);
	releaseCameraRef.current = releaseCamera;

	// Continuous scanning loop
	useEffect(() => {
		if (scanState !== "scanning" || !detectorRef.current || !videoRef.current) {
			return;
		}

		let active = true;
		let frameErrorLogged = false;
		const scan = async () => {
			if (!active || !videoRef.current || !detectorRef.current) {
				return;
			}
			if (videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
				requestAnimationFrame(scan);
				return;
			}
			try {
				const barcodes = await detectorRef.current.detect(videoRef.current);
				if (!active) {
					return;
				}
				const firstBarcode = barcodes[0];
				if (firstBarcode?.rawValue) {
					onDetectedRef.current(firstBarcode.rawValue);
					releaseCameraRef.current();
					setScanState("detected");
					return;
				}
			} catch (error) {
				if (!frameErrorLogged) {
					logger.warn("Barcode frame detection failed", {
						error: error instanceof Error ? error.message : String(error),
					});
					frameErrorLogged = true;
				}
			}
			if (active) {
				requestAnimationFrame(scan);
			}
		};
		void scan();
		return () => {
			active = false;
		};
	}, [scanState]);

	// Cleanup on unmount
	useEffect(() => {
		return releaseCamera;
	}, [releaseCamera]);

	const handleManualSubmit = () => {
		const trimmed = manualValue.trim();
		if (trimmed) {
			onDetected(trimmed);
			setScanState("detected");
		}
	};

	const isScanning = scanState === "scanning";
	const isDetected = scanState === "detected";
	const hasError = scanState === "error";

	return (
		<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
			<div className="mb-3 flex items-center justify-between">
				<span className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white">
					<ScanLine className="size-4 text-[#2154A6]" aria-hidden="true" />
					{label}
				</span>
				{isScanning && (
					<button
						type="button"
						onClick={stopCamera}
						className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
						aria-label="Detener escaneo"
						title="Detener escaneo"
					>
						<X className="size-4" />
					</button>
				)}
			</div>

			{/* Camera view */}
			{isScanning && (
				<div className="relative overflow-hidden rounded-lg bg-black">
					<video
						ref={videoRef}
						autoPlay
						playsInline
						muted
						className="h-48 w-full object-cover"
						aria-label="Vista de la cámara para escaneo de código"
					/>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="size-36 rounded-lg border-2 border-white/60" />
					</div>
					<p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/70">
						Alinee el código de barras en el recuadro
					</p>
				</div>
			)}

			{/* Manual input (shown when not scanning or when unsupported) */}
			{!isScanning && !isDetected && (
				<div className="space-y-2">
					{detectorSupport === "supported" ? (
						<button
							type="button"
							onClick={startCamera}
							className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 px-4 py-8 text-sm text-zinc-500 transition hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] dark:border-zinc-600 dark:hover:border-[var(--color-cermont-blue-light)]"
							aria-label="Abrir cámara para escanear código"
						>
							<Camera className="size-6" aria-hidden="true" />
							<span>Abrir cámara</span>
						</button>
					) : (
						<p className="text-xs text-amber-600 dark:text-amber-400">
							Escáner por cámara no disponible en este navegador. Ingrese el código manualmente.
						</p>
					)}
					<div className="flex gap-2">
						<label htmlFor="barcode-manual-input" className="sr-only">
							Codigo manual
						</label>
						<input
							id="barcode-manual-input"
							type="text"
							value={manualValue}
							onChange={(e) => setManualValue(e.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									handleManualSubmit();
								}
							}}
							placeholder={placeholder}
							className="block flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
						/>
						<button
							type="button"
							onClick={handleManualSubmit}
							disabled={!manualValue.trim()}
							className="rounded-lg bg-[#2154A6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1a4390] disabled:opacity-50"
							aria-label="Aceptar código ingresado manualmente"
						>
							Aceptar
						</button>
					</div>
				</div>
			)}

			{/* Detected state */}
			{isDetected && (
				<div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 dark:bg-green-900/10">
					<ScanLine className="size-5 text-green-500" aria-hidden="true" />
					<span className="text-sm text-green-700 dark:text-green-400">
						Código escaneado correctamente
					</span>
				</div>
			)}

			{/* Error state */}
			{hasError && (
				<div className="rounded-lg bg-red-50 px-4 py-3 dark:bg-red-900/10">
					<p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
						<CameraOff className="size-4" aria-hidden="true" />
						{errorMessage || "Error al acceder a la cámara"}
					</p>
					<button
						type="button"
						onClick={() => setScanState("idle")}
						className="mt-2 text-xs text-zinc-500 underline hover:text-zinc-700"
					>
						Volver e ingresar manualmente
					</button>
				</div>
			)}
		</div>
	);
}
