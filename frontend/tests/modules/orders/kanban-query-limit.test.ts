import { MAX_PAGE_LIMIT } from "@cermont/shared-types";
import { describe, expect, it } from "vitest";

import { KANBAN_ORDER_QUERY_LIMIT } from "@/app/(dashboard)/orders/kanban/kanban-constants";

describe("orders kanban query limit", () => {
	it("uses the shared pagination ceiling", () => {
		expect(KANBAN_ORDER_QUERY_LIMIT).toBe(MAX_PAGE_LIMIT);
		expect(KANBAN_ORDER_QUERY_LIMIT).toBeLessThanOrEqual(MAX_PAGE_LIMIT);
	});
});
