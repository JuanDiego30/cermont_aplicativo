"use client";

import type { Evidence } from "@cermont/shared-types";
import { Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/core/ui/Button";
import {
	formatEvidenceDate,
	getEvidenceLabel,
	getEvidenceStyle,
	getFileName,
	normalizeEvidenceStage,
} from "./evidence-helpers";

interface EvidenceCardProps {
	evidence: Evidence;
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
	const fileName = getFileName(evidence.url);
	const stage = normalizeEvidenceStage(evidence.type);

	return (
		<article className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
			<div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-secondary)]">
				<Image
					src={evidence.url}
					alt={`Vista previa de ${fileName}`}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
					className="object-cover transition-transform duration-200 hover:scale-[1.03]"
				/>

				<div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-black/50 via-black/10 to-transparent p-3">
					<span
						className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset backdrop-blur ${getEvidenceStyle(stage)}`}
					>
						{getEvidenceLabel(stage)}
					</span>

					<time
						className="rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white"
						dateTime={evidence.capturedAt}
					>
						{formatEvidenceDate(evidence.capturedAt)}
					</time>
				</div>
			</div>

			<div className="space-y-3 p-4">
				<div className="space-y-1">
					<p className="line-clamp-2 break-all text-sm font-semibold text-[var(--text-primary)]">
						{fileName}
					</p>
					<p className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
						<Camera aria-hidden="true" className="size-3.5" />
						Imagen operativa vinculada a la orden
					</p>
				</div>

				{evidence.description ? (
					<p className="line-clamp-2 text-xs text-[var(--text-secondary)]">
						{evidence.description}
					</p>
				) : null}

				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)]/50 px-3 py-2">
					<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
						Orden asociada
					</p>
					<p className="mt-1 font-mono text-xs text-[var(--text-primary)]">{evidence.orderId}</p>
				</div>

				<div className="flex flex-wrap gap-2">
					<Button asChild variant="outline" size="sm">
						<a
							href={evidence.url}
							target="_blank"
							rel="noreferrer"
							aria-label={`Ver archivo ${fileName}`}
						>
							Abrir imagen
						</a>
					</Button>

					<Button asChild variant="ghost" size="sm">
						<Link href={`/orders/${evidence.orderId}`}>Ver orden</Link>
					</Button>
				</div>
			</div>
		</article>
	);
}
