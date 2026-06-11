"use client";

import { Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/core/ui/Button";

interface PlanningKitSuggestionBannerProps {
	activityType?: string;
	isLoading: boolean;
	hasSuggestion: boolean;
	kitName?: string;
	onApply: () => void;
	onDismiss: () => void;
}

export function PlanningKitSuggestionBanner({
	activityType,
	isLoading,
	hasSuggestion,
	kitName,
	onApply,
	onDismiss,
}: PlanningKitSuggestionBannerProps) {
	if (!activityType || isLoading) {
		return null;
	}

	if (!hasSuggestion) {
		return null;
	}

	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/5 p-4 shadow-sm">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3">
					<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)]/10">
						<Lightbulb className="size-4 text-[var(--color-brand)]" />
					</div>
					<div>
						<p className="text-sm font-medium text-[var(--text-primary)]">
							Kit sugerido disponible
						</p>
						<p className="mt-0.5 text-xs text-[var(--text-secondary)]">
							Se encontró el kit &ldquo;{kitName}&rdquo; para esta actividad. ¿Aplicarlo al plan?
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={onDismiss}>
						Ignorar
					</Button>
					<Button variant="primary" size="sm" onClick={onApply}>
						{isLoading ? <Loader2 className="size-3.5 animate-spin" /> : null}
						Aplicar kit
					</Button>
				</div>
			</div>
		</div>
	);
}
