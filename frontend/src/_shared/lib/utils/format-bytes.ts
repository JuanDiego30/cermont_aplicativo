export function formatBytes(value: number | null): string {
	if (!value) {
		return "—";
	}

	const units = ["B", "KB", "MB", "GB"];
	let size = value;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex += 1;
	}

	return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}
