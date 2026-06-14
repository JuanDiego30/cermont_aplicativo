import type { DashboardRecentActivity } from "@cermont/shared-types";
import { Clock3 } from "lucide-react";

interface ActivityTimelineProps {
	items: DashboardRecentActivity["items"];
}

const EVENT_LABELS: Record<string, string> = {
	ORDER_CREATED: "Orden creada",
	ORDER_UPDATED: "Orden actualizada",
	PROPOSAL_APPROVED: "Propuesta aprobada",
	PAYMENT_RECEIVED: "Pago recibido",
};

function formatOccurredAt(value: string) {
	return new Intl.DateTimeFormat("es-CO", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
	return (
		<section
			data-dash="panel"
			aria-labelledby="recent-activity-title"
			className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]"
		>
			<div className="flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-xl bg-[var(--color-cermont-blue-bg)] text-[var(--color-cermont-blue)]">
					<Clock3 aria-hidden="true" />
				</div>
				<div>
					<h3
						id="recent-activity-title"
						className="text-lg font-semibold text-[var(--text-primary)]"
					>
						Actividad reciente
					</h3>
					<p className="text-sm text-[var(--text-secondary)]">Eventos operativos confirmados</p>
				</div>
			</div>

			{items.length === 0 ? (
				<p className="mt-6 rounded-xl bg-[var(--surface-secondary)] px-4 py-6 text-center text-sm text-[var(--text-secondary)]">
					No hay actividad reciente.
				</p>
			) : (
				<ol className="mt-6 space-y-0">
					{items.map((item, index) => (
						<li
							key={`${item.event}:${item.entityCode ?? item.entityType}:${item.occurredAt}`}
							className="relative grid grid-cols-[20px_1fr] gap-3 pb-5 last:pb-0"
						>
							<span
								className="mt-1.5 size-2.5 rounded-full bg-[var(--color-cermont-green)] ring-4 ring-[var(--color-cermont-green-bg)]"
								aria-hidden="true"
							/>
							{index < items.length - 1 ? (
								<span
									className="absolute left-[4px] top-5 h-[calc(100%-12px)] w-px bg-[var(--border-default)]"
									aria-hidden="true"
								/>
							) : null}
							<div>
								<p className="text-sm font-semibold text-[var(--text-primary)]">
									{EVENT_LABELS[item.event] ?? item.event}
								</p>
								<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
									{item.entityCode ?? item.entityType}
								</p>
								<time
									dateTime={item.occurredAt}
									className="mt-1 block text-xs text-[var(--text-tertiary)]"
								>
									{formatOccurredAt(item.occurredAt)}
								</time>
							</div>
						</li>
					))}
				</ol>
			)}
		</section>
	);
}
