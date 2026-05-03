export type CsvCellValue = string | number | boolean | Date | null;

export interface CsvColumn<TRow> {
	header: string;
	value: (row: TRow) => CsvCellValue;
}

function serializeCsvCell(value: CsvCellValue): string {
	if (value === null) {
		return "";
	}

	const rawValue = value instanceof Date ? value.toISOString() : String(value);
	const escaped = rawValue.replaceAll('"', '""');

	return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
}

export function exportToCsv<TRow>(
	filename: string,
	columns: CsvColumn<TRow>[],
	rows: TRow[],
): void {
	const header = columns.map((column) => serializeCsvCell(column.header)).join(",");
	const body = rows
		.map((row) => columns.map((column) => serializeCsvCell(column.value(row))).join(","))
		.join("\n");
	const csv = [header, body].filter(Boolean).join("\n");
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");

	anchor.href = url;
	anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
	anchor.click();
	URL.revokeObjectURL(url);
}
