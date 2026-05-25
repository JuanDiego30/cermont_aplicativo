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
		<tr className="hover:bg-zinc-50">
			<th scope="row" className="px-4 py-3 text-left">
				<span
					className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getEvidenceStyle(stage)}`}
				>
					{getEvidenceLabel(stage)}
				</span>
			</th>

			<td className="px-4 py-3">
				<p className="max-w-xs truncate font-medium text-zinc-900">{fileName}</p>
				{evidence.description ? (
					<p className="max-w-xs truncate text-xs text-zinc-500">{evidence.description}</p>
				) : null}
				<p className="max-w-xs truncate text-xs text-zinc-500">{evidence.url}</p>
			</td>

			<td className="px-4 py-3 text-zinc-700">
				<div>
					<p className="font-mono text-xs font-medium text-zinc-900">{evidence.orderId}</p>
					<p className="text-xs text-zinc-500">Orden asociada</p>
				</div>
			</td>

			<td className="px-4 py-3 text-zinc-700">
				<time dateTime={evidence.capturedAt}>{formatEvidenceDate(evidence.capturedAt)}</time>
			</td>

			<td className="px-4 py-3">
				<div className="flex items-center gap-2">
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
			</td>
		</tr>
	);
}
