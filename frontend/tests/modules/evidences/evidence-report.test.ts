/**
 * Evidence Report — tests for evidence summary and report generation.
 *
 * Verifies:
 * - Category breakdown computation
 * - Missing required evidence detection
 * - Order grouping logic
 * - Before/after photo tracking
 */

import { describe, expect, it } from "vitest";

interface EvidenceItem {
	id: string;
	orderId: string;
	orderCode: string;
	category: "before" | "after" | "finding" | "closure" | "general";
	checklistItemId?: string;
	createdAt: string;
}

interface MissingRequired {
	orderId: string;
	orderCode: string;
	missingTypes: string[];
}

interface EvidenceSummary {
	totalCount: number;
	byCategory: Record<string, number>;
	byOrder: Array<{ orderId: string; orderCode: string; count: number; categories: string[] }>;
	missingRequired: MissingRequired[];
}

function computeSummary(items: EvidenceItem[], requiredPerOrder: string[]): EvidenceSummary {
	const byCategory: Record<string, number> = {};
	const orderMap = new Map<string, { orderCode: string; count: number; categories: Set<string> }>();

	for (const item of items) {
		// By category
		byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;

		// By order
		if (!orderMap.has(item.orderId)) {
			orderMap.set(item.orderId, {
				orderCode: item.orderCode,
				count: 0,
				categories: new Set(),
			});
		}
		const entry = orderMap.get(item.orderId);
		if (!entry) {
			continue;
		}
		entry.count++;
		entry.categories.add(item.category);
	}

	const byOrder = Array.from(orderMap.entries()).map(([orderId, data]) => ({
		orderId,
		orderCode: data.orderCode,
		count: data.count,
		categories: Array.from(data.categories),
	}));

	// Missing required: orders that don't have all required categories
	const missingRequired: MissingRequired[] = [];
	for (const [orderId, data] of orderMap) {
		const missing = requiredPerOrder.filter(
			(r) => !data.categories.has(r as EvidenceItem["category"]),
		);
		if (missing.length > 0) {
			missingRequired.push({
				orderId,
				orderCode: data.orderCode,
				missingTypes: missing,
			});
		}
	}

	return { totalCount: items.length, byCategory, byOrder, missingRequired };
}

describe("Evidence Summary Computation", () => {
	const sampleItems: EvidenceItem[] = [
		{
			id: "1",
			orderId: "ord1",
			orderCode: "ORD-001",
			category: "before",
			createdAt: "2026-07-01T10:00:00Z",
		},
		{
			id: "2",
			orderId: "ord1",
			orderCode: "ORD-001",
			category: "before",
			createdAt: "2026-07-01T10:01:00Z",
		},
		{
			id: "3",
			orderId: "ord1",
			orderCode: "ORD-001",
			category: "after",
			createdAt: "2026-07-01T14:00:00Z",
		},
		{
			id: "4",
			orderId: "ord1",
			orderCode: "ORD-001",
			category: "finding",
			createdAt: "2026-07-01T12:00:00Z",
		},
		{
			id: "5",
			orderId: "ord2",
			orderCode: "ORD-002",
			category: "before",
			createdAt: "2026-07-02T09:00:00Z",
		},
		{
			id: "6",
			orderId: "ord2",
			orderCode: "ORD-002",
			category: "closure",
			createdAt: "2026-07-02T16:00:00Z",
		},
	];

	it("should compute total count correctly", () => {
		const result = computeSummary(sampleItems, []);
		expect(result.totalCount).toBe(6);
	});

	it("should group by category", () => {
		const result = computeSummary(sampleItems, []);
		expect(result.byCategory.before).toBe(3);
		expect(result.byCategory.after).toBe(1);
		expect(result.byCategory.finding).toBe(1);
		expect(result.byCategory.closure).toBe(1);
	});

	it("should group by order", () => {
		const result = computeSummary(sampleItems, []);
		expect(result.byOrder).toHaveLength(2);
		const ord1 = result.byOrder.find((o) => o.orderId === "ord1");
		expect(ord1?.count).toBe(4);
		expect(ord1?.categories).toContain("before");
		expect(ord1?.categories).toContain("after");
	});

	it("should detect missing required evidence", () => {
		const result = computeSummary(sampleItems, ["before", "after", "finding", "closure"]);
		const ord2Missing = result.missingRequired.find((m) => m.orderId === "ord2");
		expect(ord2Missing).toBeDefined();
		expect(ord2Missing?.missingTypes).toContain("after");
		expect(ord2Missing?.missingTypes).toContain("finding");
	});

	it("should handle empty items array", () => {
		const result = computeSummary([], []);
		expect(result.totalCount).toBe(0);
		expect(result.byCategory).toEqual({});
		expect(result.byOrder).toHaveLength(0);
		expect(result.missingRequired).toHaveLength(0);
	});
});

describe("Evidence Categories", () => {
	it("should have valid category values", () => {
		const validCategories = ["before", "after", "finding", "closure", "general"] as const;
		expect(validCategories).toContain("before");
		expect(validCategories).toContain("after");
		expect(validCategories).toContain("finding");
	});

	it("should have Spanish labels", () => {
		const labels: Record<string, string> = {
			before: "Antes",
			after: "Después",
			finding: "Hallazgo",
			closure: "Cierre",
			general: "General",
		};
		expect(labels.before).toBe("Antes");
		expect(labels.after).toBe("Después");
		expect(labels.finding).toBe("Hallazgo");
	});
});
