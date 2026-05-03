export interface PaginationInput {
	page?: number;
	limit?: number;
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export function parsePaginationParams(searchParams: URLSearchParams): PaginationInput {
	const pageStr = searchParams.get("page");
	const limitStr = searchParams.get("limit");

	const page = pageStr ? parseInt(pageStr, 10) : 1;
	const limit = limitStr ? parseInt(limitStr, 10) : 20;

	if (Number.isNaN(page) || Number.isNaN(limit) || page < 1 || limit < 1) {
		return {
			page: 1,
			limit: 20,
			search: searchParams.get("search") ?? undefined,
			sortBy: searchParams.get("sortBy") ?? undefined,
			sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc",
		};
	}

	return {
		page,
		limit,
		search: searchParams.get("search") ?? undefined,
		sortBy: searchParams.get("sortBy") ?? undefined,
		sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc",
	};
}
