import type { GroupByStrategy } from "./types";

const UNASSIGNED = "unassigned";

export const groupByTechnician: GroupByStrategy = {
	key: "technician",
	label: "Técnico",
	groups: (items) => {
		const map = new Map<string, typeof items>();
		for (const item of items) {
			const key = item.assignedToName ?? UNASSIGNED;
			map.set(key, [...(map.get(key) ?? []), item]);
		}
		return map;
	},
	groupLabel: (key) => (key === UNASSIGNED ? "Sin asignar" : key),
	columnOrder: [],
	allowDragDrop: false,
};
