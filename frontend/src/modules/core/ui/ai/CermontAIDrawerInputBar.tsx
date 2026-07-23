"use client";

import { Send } from "lucide-react";

interface CermontAIDrawerInputBarProps {
	input: string;
	onInputChange: (value: string) => void;
	onSend: () => void;
	onKeyDown: (e: React.KeyboardEvent) => void;
	isPending: boolean;
	currentModule: string | null;
	isEnabled: boolean;
}

export function CermontAIDrawerInputBar({
	input,
	onInputChange,
	onSend,
	onKeyDown,
	isPending,
	currentModule,
	isEnabled,
}: CermontAIDrawerInputBarProps) {
	return (
		<div className="border-t border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
			<div className="relative flex items-end gap-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-2 transition-all focus-within:border-[var(--border-focus)] focus-within:bg-[var(--surface-primary)] focus-within:ring-1 focus-within:ring-[var(--color-brand-blue)]/20">
				<textarea
					rows={1}
					value={input}
					onChange={(e) => onInputChange(e.target.value)}
					onKeyDown={onKeyDown}
					placeholder={
						currentModule ? `Pregunta sobre ${currentModule}` : "Hazme una pregunta…"
					}
					aria-label="Pregunta a la IA de Cermont"
					className="max-h-32 min-h-10 w-full resize-none bg-transparent px-3 py-2 text-sm text-(--text-primary) outline-none placeholder:text-(--text-tertiary)"
				/>
				<button
					type="button"
					onClick={onSend}
					disabled={!input.trim() || isPending}
					aria-label="Enviar pregunta"
					className="motion-button flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--color-brand-blue) text-white hover:bg-(--color-brand-blue-hover) disabled:opacity-50 disabled:hover:bg-(--color-brand-blue)"
				>
					<Send className="size-4" />
				</button>
			</div>
			<p className="mt-2 text-center text-[10px] text-(--text-tertiary)">
				{isEnabled
					? "Cermont AI puede cometer errores. Verifica la info."
					: "Usa los comandos para obtener información del caso."}
			</p>
		</div>
	);
}
