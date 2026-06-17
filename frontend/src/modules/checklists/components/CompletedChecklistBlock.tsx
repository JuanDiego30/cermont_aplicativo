import type { Checklist } from "@cermont/shared-types";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { formatChecklistDate, getSignaturePreview } from "./checklist-constants";

export function CompletedChecklistBlock({ checklist }: { checklist: Checklist }) {
	const signaturePreview = getSignaturePreview(checklist.signature);

	return (
		<section className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/10">
			<div className="flex items-start gap-3">
				<CheckCircle2
					className="mt-0.5 size-5 shrink-0 text-brand-annotate dark:text-brand-annotate"
					aria-hidden="true"
				/>
				<div>
					<p className="text-sm font-semibold text-brand-annotate dark:text-brand-annotate">
						Checklist completado
					</p>
					<p className="mt-1 text-xs text-brand-annotate dark:text-brand-annotate">
						Firmado por {checklist.completedBy ?? ","} el{" "}
						{formatChecklistDate(checklist.completedAt)}.
					</p>
				</div>
			</div>

			{signaturePreview ? (
				<div className="overflow-hidden rounded-2xl border border-emerald-200 bg-canvas p-3 dark:border-emerald-900/40 dark:bg-zinc-950">
					<p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-annotate dark:text-brand-annotate">
						Firma registrada
					</p>
					<div className="relative h-40 w-full overflow-hidden rounded-lg bg-canvas">
						<Image
							src={signaturePreview}
							alt="Firma del checklist"
							fill
							unoptimized
							sizes="100vw"
							className="object-contain"
						/>
					</div>
				</div>
			) : checklist.signature ? (
				<div className="rounded-2xl border border-emerald-200 bg-canvas px-4 py-3 text-sm text-brand-annotate dark:border-emerald-900/40 dark:bg-zinc-950 dark:text-brand-annotate">
					La firma fue almacenada como texto o hash y no puede previsualizarse.
				</div>
			) : null}

			{checklist.observations ? (
				<div className="rounded-2xl border border-emerald-200 bg-canvas px-4 py-3 text-sm text-brand-annotate dark:border-emerald-900/40 dark:bg-zinc-950 dark:text-brand-annotate">
					{checklist.observations}
				</div>
			) : null}
		</section>
	);
}
