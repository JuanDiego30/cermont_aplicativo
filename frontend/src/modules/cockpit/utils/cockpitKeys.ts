export const cockpitKeys = {
	all: ["cockpit"] as const,
	detail: (serviceCaseId: string) => ["cockpit", serviceCaseId] as const,
};
