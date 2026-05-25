import { apiClient } from "@/lib/http/api-client";
import type { User, UserList } from "./types";

// ── Plain Functions ──────────────────────────────────────────
export async function getUsers(filters?: Record<string, unknown>): Promise<User[]> {
	const queryParams = new URLSearchParams();
	if (filters) {
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				queryParams.set(key, String(value));
			}
		});
	}
	const queryString = queryParams.toString();
	const url = queryString ? `/users?${queryString}` : "/users";
	const body = await apiClient.get<UserList>(url);
	return body?.data ?? [];
}
