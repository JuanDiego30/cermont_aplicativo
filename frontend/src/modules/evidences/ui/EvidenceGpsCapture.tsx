"use client";

import { Loader2 } from "lucide-react";
import type { GpsCaptureState } from "../model/constants";

interface EvidenceGpsCaptureProps {
	gpsCapture: GpsCaptureState;
	onCapture: () => void;
}

export function EvidenceGpsCapture({ gpsCapture, onCapture }: EvidenceGpsCaptureProps) {
	return (
		<div className="space-y-2 rounded-lg border border-[var(--border-medium)] bg-[var(--surface-secondary)] p-3.5">
			<span className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
				Geolocalización
			</span>
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
					{gpsCapture.state === "fetching" && (
						<>
							<Loader2 className="size-3.5 animate-spin text-[var(--text-tertiary)]" />
							<span>Capturando coordenadas&hellip;</span>
						</>
					)}
					{gpsCapture.state === "success" && (
						<>
							<span className="inline-flex size-2 animate-pulse rounded-full bg-[var(--color-success)]" />
							<span className="font-medium">
								Ubicación capturada: {gpsCapture.location.lat.toFixed(5)},{" "}
								{gpsCapture.location.lng.toFixed(5)}
							</span>
						</>
					)}
					{gpsCapture.state === "error" && (
						<>
							<span className="inline-flex size-2 rounded-full bg-[var(--color-danger)]" />
							<span className="text-[var(--color-danger)]">
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
						className="whitespace-nowrap text-[11px] font-bold text-[var(--color-brand)] hover:underline"
					>
						{gpsCapture.state === "success" ? "Actualizar GPS" : "Capturar GPS"}
					</button>
				)}
			</div>
		</div>
	);
}
