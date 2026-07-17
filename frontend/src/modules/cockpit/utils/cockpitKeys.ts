export const cockpitKeys = {
	all: ["cockpit"] as const,
	lists: () => [...cockpitKeys.all, "list"] as const,
	details: () => [...cockpitKeys.all, "detail"] as const,
	detail: (serviceCaseId: string) => [...cockpitKeys.details(), serviceCaseId] as const,
};
