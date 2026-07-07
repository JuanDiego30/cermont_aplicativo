interface AuditEvent {
	id: string;
	action: string;
	timestamp: string;
	entity: string;
	entityId: string;
	actor?: string;
}

interface Props {
	events: AuditEvent[];
}

export function AuditTimeline({ events }: Props) {
	if (events.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-[var(--text-secondary)]">
				Sin eventos registrados
			</p>
		);
	}

	return (
		<ol className="relative ml-4 border-l border-[var(--border-subtle)]">
			{events.map((event) => (
				<li key={event.id} className="mb-6 ml-6 last:mb-0">
					<span className="absolute -left-2 mt-1 flex size-4 items-center justify-center rounded-full bg-[var(--color-brand-blue)] ring-4 ring-[var(--surface-primary)]">
						<span className="size-1.5 rounded-full bg-white" aria-hidden="true" />
					</span>
					<time className="mb-1 block text-xs text-[var(--text-tertiary)]">
						{new Date(event.timestamp).toLocaleString("es-CO")}
					</time>
					<p className="text-sm font-medium text-[var(--text-primary)]">{event.action}</p>
					{event.actor && (
						<p className="mt-0.5 text-xs text-[var(--text-secondary)]">{event.actor}</p>
					)}
					<p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
						{event.entity} · {event.entityId}
					</p>
				</li>
			))}
		</ol>
	);
}
