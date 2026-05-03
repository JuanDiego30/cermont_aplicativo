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
					className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300"
					aria-hidden="true"
				/>
				<div>
					<p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
						Checklist completado
					</p>
					<p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-200/75">
						Firmado por {checklist.completedBy ?? "—"} el{" "}
						{formatChecklistDate(checklist.completedAt)}.
					</p>
				</div>
			</div>

			{signaturePreview ? (
				<div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white p-3 dark:border-emerald-900/40 dark:bg-slate-950">
					<p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
						Firma registrada
					</p>
					<div className="relative h-40 w-full overflow-hidden rounded-lg bg-white">
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
				<div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-slate-950 dark:text-emerald-200">
					La firma fue almacenada como texto o hash y no puede previsualizarse.
				</div>
			) : null}

			{checklist.observations ? (
				<div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-slate-950 dark:text-emerald-200">
					{checklist.observations}
				</div>
			) : null}
		</section>
	);
}
