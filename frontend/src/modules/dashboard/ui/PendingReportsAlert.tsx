import { FileClock } from "lucide-react";
import Link from "next/link";

interface Props {
	count: number;
}

export function PendingReportsAlert({ count }: Props) {
	if (count === 0) {
		return null;
	}

	return (
		<Link
			href="/reports"
			className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-orange-400 bg-orange-50 p-4 hover:bg-orange-100 transition"
		>
			<FileClock className="size-5 shrink-0 text-orange-600" aria-hidden="true" />
			<div className="min-w-0 flex-1">
				<p className="text-sm font-semibold text-orange-800">
					{count} informe{count !== 1 ? "s" : ""} técnico{count !== 1 ? "s" : ""} pendiente
					{count !== 1 ? "s" : ""}
				</p>
				<p className="text-xs text-orange-700">Requieren generación y aprobación</p>
			</div>
		</Link>
	);
}
