"use client";

import type { Evidence } from "@cermont/shared-types";
import { Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/core/ui/Button";
import { formatEvidenceDate, getEvidenceSubtitle, getEvidenceTitle } from "./evidence-helpers";

interface EvidenceCardProps {
	evidence: Evidence;
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
	const title = getEvidenceTitle(evidence);
	const subtitle = getEvidenceSubtitle(evidence);

	return (
		<article className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)] transition-shadow hover:shadow-[var(--shadow-3)]">
			<div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-secondary)]">
				<Image
					src={evidence.url}
					alt={title}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
					className="object-cover transition-transform duration-200 hover:scale-[1.03]"
				/>

				<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3">
					<time className="text-[11px] font-medium text-white/80" dateTime={evidence.capturedAt}>
						{formatEvidenceDate(evidence.capturedAt)}
					</time>
				</div>
			</div>

			<div className="space-y-3 p-4">
				{/* Title — the primary label for this evidence */}
				<div className="space-y-1">
					<h3 className="line-clamp-2 text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
					{/* Show filename as secondary metadata */}
					<p className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
						<Camera aria-hidden="true" className="size-3.5" />
						<span className="truncate max-w-[200px]">
							{getEvidenceSubtitle(evidence) ||
							getEvidenceTitle(evidence) !== evidence.url.split("/").pop()
								? evidence.url.split("/").pop()
								: ""}
						</span>
					</p>
				</div>

				{/* Extended description when title is separate from description */}
				{subtitle ? (
					<p className="line-clamp-2 text-xs text-[var(--text-secondary)]">{subtitle}</p>
				) : null}

				{/* Link to order */}
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)]/50 px-3 py-2">
					<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
						Orden asociada
					</p>
					<p className="mt-1 font-mono text-xs text-[var(--text-primary)]">{evidence.orderId}</p>
				</div>

				{/* Actions */}
				<div className="flex flex-wrap gap-2">
					<Button asChild variant="outline" size="sm">
						<a
							href={evidence.url}
							target="_blank"
							rel="noreferrer"
							aria-label={`Ver imagen: ${title}`}
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
