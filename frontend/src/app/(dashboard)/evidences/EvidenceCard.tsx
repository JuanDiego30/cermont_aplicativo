"use client";

import type { Evidence } from "@cermont/shared-types";
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
		<article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
			<div className="flex items-center justify-between gap-3">
				<span
					className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getEvidenceStyle(stage)}`}
				>
					{getEvidenceLabel(stage)}
				</span>

				<time className="text-xs text-zinc-500" dateTime={evidence.capturedAt}>
					{formatEvidenceDate(evidence.capturedAt)}
				</time>
			</div>

			<div className="mt-3 space-y-1">
				<p className="break-all text-sm font-medium text-zinc-900">{fileName}</p>
				{evidence.description ? (
					<p className="text-xs text-zinc-600">{evidence.description}</p>
				) : null}
				<p className="text-xs text-zinc-600">
					Orden asociada:{" "}
					<span className="font-mono text-[11px] text-zinc-500">{evidence.orderId}</span>
				</p>
			</div>

			<div className="mt-4 flex gap-2">
				<Button asChild variant="outline" size="sm">
					<a
						href={evidence.url}
						target="_blank"
						rel="noreferrer"
						aria-label={`Ver archivo ${fileName}`}
					>
						Ver archivo
					</a>
				</Button>

				<Button asChild variant="ghost" size="sm">
					<Link href={`/orders/${evidence.orderId}`}>Ver orden</Link>
				</Button>
			</div>
		</article>
	);
}
