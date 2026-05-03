export function getOrderInitials(value?: string | null): string {
	if (!value) {
		return "OT";
	}

	return value
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

export function formatOrderDate(dateStr: string | undefined): string {
	if (!dateStr) {
		return "—";
	}

	try {
		return new Date(dateStr).toLocaleDateString("es-CO", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	} catch {
		return "—";
	}
}

export function getOrderAssigneeLabel(assignedToName: string | null | undefined, location: string) {
	return assignedToName ? `Asignada a ${assignedToName}` : location;
}
