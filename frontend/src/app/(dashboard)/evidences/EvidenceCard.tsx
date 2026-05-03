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
		<article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
			<div className="flex items-center justify-between gap-3">
				<span
					className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getEvidenceStyle(stage)}`}
				>
					{getEvidenceLabel(stage)}
				</span>

				<time className="text-xs text-slate-500" dateTime={evidence.capturedAt}>
					{formatEvidenceDate(evidence.capturedAt)}
				</time>
			</div>

			<div className="mt-3 space-y-1">
				<p className="break-all text-sm font-medium text-slate-900">{fileName}</p>
				{evidence.description ? (
					<p className="text-xs text-slate-600">{evidence.description}</p>
				) : null}
				<p className="text-xs text-slate-600">
					Associated order:{" "}
					<span className="font-mono text-[11px] text-slate-500">{evidence.orderId}</span>
				</p>
			</div>

			<div className="mt-4 flex gap-2">
				<Button asChild variant="outline" size="sm">
					<a
						href={evidence.url}
						target="_blank"
						rel="noreferrer"
						aria-label={`View file ${fileName}`}
					>
						View file
					</a>
				</Button>

				<Button asChild variant="ghost" size="sm">
					<Link href={`/orders/${evidence.orderId}`}>View order</Link>
				</Button>
			</div>
		</article>
	);
}
