"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/core/ui/Button";

interface DraftRestoreBannerProps {
	onRestore: () => void;
	onDiscard: () => void;
}

export function DraftRestoreBanner({ onRestore, onDiscard }: DraftRestoreBannerProps) {
	return (
		<section className="flex flex-col gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-brand-green dark:border-sky-900/40 dark:bg-sky-900/10 dark:text-brand-green sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-start gap-3">
				<RotateCcw className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
				<div>
					<p className="text-sm font-semibold">Se detecto un borrador guardado</p>
					<p className="text-xs text-brand-green dark:text-brand-green">
						Puedes restaurarlo o descartarlo para continuar con la captura actual.
					</p>
				</div>
			</div>
			<div className="flex flex-wrap gap-2">
				<Button type="button" variant="outline" size="sm" onClick={onDiscard}>
					Descartar
				</Button>
				<Button type="button" size="sm" onClick={onRestore}>
					Restaurar borrador
				</Button>
			</div>
		</section>
	);
}
