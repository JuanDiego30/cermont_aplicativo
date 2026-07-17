export const EVIDENCE_KEYS = {
	all: ["evidences"] as const,
	list: () => [...EVIDENCE_KEYS.all, "list"] as const,
	byOrder: (orderId: string) => [...EVIDENCE_KEYS.all, "by-order", orderId] as const,
	detail: (id: string) => [...EVIDENCE_KEYS.all, "detail", id] as const,
	summary: () => [...EVIDENCE_KEYS.all, "summary"] as const,
};
