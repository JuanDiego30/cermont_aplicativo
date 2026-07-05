"use client";

const STATUS_COLORS: Record<string, string> = {
	draft: "bg-gray-100 text-gray-700",
	pending: "bg-gray-100 text-gray-700",
	submitted: "bg-blue-100 text-blue-700",
	approved: "bg-[#4CAF50]/20 text-green-700",
	rejected: "bg-[#F44336]/20 text-red-700",
	paid: "bg-green-100 text-green-800",
	cancelled: "bg-red-100 text-red-800",
	not_created: "bg-gray-50 text-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
	not_created: "No creado",
	draft: "Borrador",
	pending: "Pendiente",
	submitted: "Enviado",
	approved: "Aprobado",
	rejected: "Rechazado",
	paid: "Pagado",
	cancelled: "Cancelado",
};

interface Props {
	status: string;
}

export function InvoiceStatusBadge({ status }: Props) {
	const color = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
	const label = STATUS_LABELS[status] ?? status;

	return (
		<span
			className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${color}`}
		>
			{label}
		</span>
	);
}
