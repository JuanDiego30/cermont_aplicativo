"use client";

import { Bot, X } from "lucide-react";

interface CermontAIDrawerHeaderProps {
	isEnabled: boolean;
	onClose: () => void;
}

export function CermontAIDrawerHeader({ isEnabled, onClose }: CermontAIDrawerHeaderProps) {
	return (
		<div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[linear-gradient(135deg,rgba(58,120,216,0.16),rgba(15,23,41,0.03),transparent)] px-5 py-4">
			<div className="flex items-center gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-brand-blue)] to-[var(--color-info)] text-white shadow-[var(--shadow-brand)]">
					<Bot className="size-5" />
				</div>
				<div>
					<h2
						id="cermont-ai-title"
						className="text-sm font-semibold text-[var(--text-primary)]"
					>
						Cermont AI
					</h2>
					<p className={`mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-medium ${isEnabled ? "text-[var(--color-success)]" : "text-[var(--text-tertiary)]"}`}>
						<span className={`inline-block size-1.5 rounded-full ${isEnabled ? "animate-pulse bg-[var(--color-success)]" : "bg-[var(--text-tertiary)]"}`}></span>
						{isEnabled ? "Operativo" : "Configuración requerida"}
					</p>
				</div>
			</div>
			<button
				type="button"
				onClick={onClose}
				aria-label="Cerrar asistente Cermont AI"
				className="motion-button flex size-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
			>
				<X className="size-4" />
			</button>
		</div>
	);
}
