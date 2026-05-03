export function getKitSummary(toolCount: number, equipmentCount: number): string {
	const toolLabel = toolCount === 1 ? "1 herramienta" : `${toolCount} herramientas`;
	const equipmentLabel = equipmentCount === 1 ? "1 equipo" : `${equipmentCount} equipos`;
	return `${toolLabel} · ${equipmentLabel}`;
}
