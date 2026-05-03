import type { OrderPriority } from "@cermont/shared-types";
import type { GroupByStrategy } from "./types";

const PRIORITY_LABELS: Record<OrderPriority, string> = {
	low: "Baja",
	medium: "Media",
	high: "Alta",
	critical: "Crítica",
};

export const groupByPriority: GroupByStrategy = {
	key: "priority",
	label: "Prioridad",
	groups: (items) => {
		const map = new Map<string, typeof items>([
			["critical", []],
			["high", []],
			["medium", []],
			["low", []],
		]);
		for (const item of items) {
			map.get(item.priority)?.push(item);
		}
		return map;
	},
	groupLabel: (key) => PRIORITY_LABELS[key as OrderPriority] ?? key,
	columnOrder: ["critical", "high", "medium", "low"],
	allowDragDrop: false,
};
