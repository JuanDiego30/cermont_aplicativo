"use client";

interface Props {
	status:
		| "draft"
		| "ready"
		| "in_progress"
		| "paused"
		| "completed"
		| "cancelled"
		| "sync_pending"
		| "sync_failed";
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
	draft: { label: "Borrador", className: "bg-gray-100 text-gray-700" },
	ready: { label: "Listo", className: "bg-blue-100 text-blue-700" },
	in_progress: { label: "En ejecución", className: "bg-[#FFC107]/20 text-amber-700" },
	paused: { label: "Pausado", className: "bg-orange-100 text-orange-700" },
	completed: { label: "Completado", className: "bg-[#4CAF50]/20 text-green-700" },
	cancelled: { label: "Cancelado", className: "bg-[#F44336]/20 text-red-700" },
	sync_pending: { label: "Sync pendiente", className: "bg-purple-100 text-purple-700" },
	sync_failed: { label: "Sync fallida", className: "bg-[#F44336]/20 text-red-700" },
};

export function ExecutionStatusBadge({ status }: Props) {
	const item = STATUS_MAP[status] ?? STATUS_MAP.draft;
	return (
		<span
			className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${item.className}`}
		>
			{item.label}
		</span>
	);
}
