import type { Evidence } from "@cermont/shared-types";
import Link from "next/link";
import { Button } from "@/core/ui/Button";
import { formatEvidenceDate, getEvidenceTitle } from "./evidence-helpers";

interface EvidenceTableRowProps {
	evidence: Evidence;
}

export function EvidenceTableRow({ evidence }: EvidenceTableRowProps) {
	const title = getEvidenceTitle(evidence);

	return (
		<tr className="hover:bg-zinc-50">
			<th scope="row" className="px-4 py-3 text-left">
				<p className="max-w-xs truncate font-medium text-zinc-900" title={title}>
					{title}
				</p>
				{evidence.description && getEvidenceTitle(evidence) !== evidence.description ? (
					<p className="max-w-xs truncate text-xs text-zinc-500">{evidence.description}</p>
				) : null}
			</th>

			<td className="px-4 py-3 text-zinc-700">
				<p className="font-mono text-xs font-medium text-zinc-900">{evidence.orderId}</p>
				<p className="text-xs text-zinc-500">Orden asociada</p>
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
							aria-label={`Ver imagen: ${title}`}
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
