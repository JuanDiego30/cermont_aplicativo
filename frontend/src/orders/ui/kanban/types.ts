import type { Order } from "@cermont/shared-types";

export interface GroupByStrategy {
	key: string;
	label: string;
	groups: (items: Order[]) => Map<string, Order[]>;
	groupLabel: (key: string) => string;
	columnOrder: string[];
	allowDragDrop: boolean;
}
