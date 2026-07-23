"use client";

import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { formatLocaleDate } from "@/lib/utils/format-date";
import type { NextExpectedAction } from "../model/cockpit.types";

const URGENCY_STYLES: Record<string, string> = {
	normal: "border-[var(--color-brand-blue)] bg-blue-50",
	urgent: "border-orange-400 bg-orange-50",
	overdue: "border-[#F44336] bg-red-50",
};

interface Props {
	action: NextExpectedAction;
}

export function NextActionCard({ action }: Props) {
	const style = URGENCY_STYLES[action.urgency] ?? URGENCY_STYLES.normal;

	return (
		<div className={`rounded-[var(--radius-lg)] border-2 p-5 ${style}`}>
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
						⚠️ Próxima acción requerida
					</p>
					<p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
						Paso {action.stepNumber}: {action.description}
					</p>
					<div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
						<span>Roles: {action.assignedRoles.join(", ")}</span>
						{action.deadline && (
						<span className="inline-flex items-center gap-1">
							<Clock className="size-3" aria-hidden="true" />
							{formatLocaleDate(action.deadline, { dateStyle: "medium" })}
						</span>
						)}
					</div>
				</div>
				<Link
					href={action.deepLink}
					className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--color-brand-blue)] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition"
				>
					Ir ahora
					<ArrowRight className="size-4" aria-hidden="true" />
				</Link>
			</div>
		</div>
	);
}
