export const EVIDENCE_KEYS = {
	all: ["evidences"] as const,
	list: () => [...EVIDENCE_KEYS.all, "list"] as const,
	byOrder: (orderId: string, page?: number, limit?: number) =>
		[...EVIDENCE_KEYS.all, "by-order", orderId, page ?? 1, limit ?? 20] as const,
	detail: (id: string) => [...EVIDENCE_KEYS.all, "detail", id] as const,
	summary: () => [...EVIDENCE_KEYS.all, "summary"] as const,
};
