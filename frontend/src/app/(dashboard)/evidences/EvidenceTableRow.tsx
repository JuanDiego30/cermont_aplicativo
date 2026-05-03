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

interface EvidenceTableRowProps {
	evidence: Evidence;
}

export function EvidenceTableRow({ evidence }: EvidenceTableRowProps) {
	const fileName = getFileName(evidence.url);
	const stage = normalizeEvidenceStage(evidence.type);

	return (
		<tr className="hover:bg-slate-50">
			<th scope="row" className="px-4 py-3 text-left">
				<span
					className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getEvidenceStyle(stage)}`}
				>
					{getEvidenceLabel(stage)}
				</span>
			</th>

			<td className="px-4 py-3">
				<p className="max-w-xs truncate font-medium text-slate-900">{fileName}</p>
				{evidence.description ? (
					<p className="max-w-xs truncate text-xs text-slate-500">{evidence.description}</p>
				) : null}
				<p className="max-w-xs truncate text-xs text-slate-500">{evidence.url}</p>
			</td>

			<td className="px-4 py-3 text-slate-700">
				<div>
					<p className="font-mono text-xs font-medium text-slate-900">{evidence.orderId}</p>
					<p className="text-xs text-slate-500">Associated order</p>
				</div>
			</td>

			<td className="px-4 py-3 text-slate-700">
				<time dateTime={evidence.capturedAt}>{formatEvidenceDate(evidence.capturedAt)}</time>
			</td>

			<td className="px-4 py-3">
				<div className="flex items-center gap-2">
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
			</td>
		</tr>
	);
}
