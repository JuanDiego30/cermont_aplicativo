const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	minimumFractionDigits: 0,
	maximumFractionDigits: 0,
});

const COP_COMPACT_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	notation: "compact",
	minimumFractionDigits: 0,
	maximumFractionDigits: 1,
});

export function formatCOP(value: number): string {
	return COP_FORMATTER.format(value);
}

export function formatCOPCompact(value: number): string {
	return COP_COMPACT_FORMATTER.format(value);
}
