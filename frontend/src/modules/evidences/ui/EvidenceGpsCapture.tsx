"use client";

import { Loader2 } from "lucide-react";
import type { GpsCaptureState } from "../model/constants";

interface EvidenceGpsCaptureProps {
	gpsCapture: GpsCaptureState;
	onCapture: () => void;
}

export function EvidenceGpsCapture({ gpsCapture, onCapture }: EvidenceGpsCaptureProps) {
	return (
		<div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-700 dark:bg-zinc-900/40">
			<span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
				Geolocalización
			</span>
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-300">
					{gpsCapture.state === "fetching" && (
						<>
							<Loader2 className="size-3.5 animate-spin text-zinc-500" />
							<span>Capturando coordenadas&hellip;</span>
						</>
					)}
					{gpsCapture.state === "success" && (
						<>
							<span className="inline-flex size-2 animate-pulse rounded-full bg-emerald-500" />
							<span className="font-medium">
								Ubicación capturada: {gpsCapture.location.lat.toFixed(5)},{" "}
								{gpsCapture.location.lng.toFixed(5)}
							</span>
						</>
					)}
					{gpsCapture.state === "error" && (
						<>
							<span className="inline-flex size-2 rounded-full bg-rose-500" />
							<span className="text-rose-700 dark:text-rose-400">
								Falla de GPS (requerido para fotos de campo)
							</span>
						</>
					)}
					{gpsCapture.state === "idle" && <span>Sin capturar</span>}
				</div>
				{(gpsCapture.state === "error" ||
					gpsCapture.state === "idle" ||
					gpsCapture.state === "success") && (
					<button
						type="button"
						onClick={onCapture}
						className="whitespace-nowrap text-[11px] font-bold text-[var(--color-brand-blue-light)] hover:underline dark:text-[var(--color-cermont-blue-light)]"
					>
						{gpsCapture.state === "success" ? "Actualizar GPS" : "Capturar GPS"}
					</button>
				)}
			</div>
		</div>
	);
}
