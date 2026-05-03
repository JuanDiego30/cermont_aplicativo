"use client";

import { normalizeUserRole, ROLE_LABELS, type UserRole } from "@cermont/shared-types/rbac";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { STALE_TIMES } from "@/_shared/lib/constants/query-config";
import { apiClient } from "@/_shared/lib/http/api-client";
import { formatDateTime } from "@/_shared/lib/utils/format-date";
import type { User, UserList } from "@/users/types";

const ROLE_COLORS: Record<UserRole, string> = {
	manager:
		"bg-[var(--color-purple-bg)] text-[var(--color-purple)] ring-[color:var(--color-purple)]/15",
	resident_engineer:
		"bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[color:var(--color-info)]/15",
	hse_coordinator:
		"bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[color:var(--color-warning)]/15",
	supervisor:
		"bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[color:var(--color-info)]/15",
	operator:
		"bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[color:var(--color-success)]/15",
	technician:
		"bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[color:var(--border-default)]/20",
	administrator:
		"bg-[var(--color-brand-blue-bg)] text-[var(--color-brand-blue)] ring-[color:var(--color-brand-blue)]/15",
	client:
		"bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[color:var(--border-default)]/20",
};

function resolveRole(role: string): UserRole | false {
	return normalizeUserRole(role);
}

function UserMobileCard({ user }: { user: User }) {
	const role = resolveRole(user.role);

	return (
		<article className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<Link
						href={`/admin/users/${user._id}`}
						className="block truncate font-semibold text-[var(--text-primary)] hover:text-[var(--color-brand-blue)]"
					>
						{user.name || "Unnamed user"}
					</Link>
					<p className="mt-1 truncate text-sm text-[var(--text-secondary)]">{user.email}</p>
					{user.phone ? (
						<p className="mt-1 text-xs text-[var(--text-tertiary)]">{user.phone}</p>
					) : null}
				</div>
				<span
					className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
						user.isActive
							? "bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[color:var(--color-success)]/15"
							: "bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[color:var(--border-default)]/20"
					}`}
				>
					{user.isActive ? "Active" : "Inactive"}
				</span>
			</div>
			<div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border-default)] pt-3">
				<span
					className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
						(role ? ROLE_COLORS[role] : false) ||
						"bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[color:var(--border-default)]/20"
					}`}
				>
					{role ? ROLE_LABELS[role] : user.role}
				</span>
				<Link
					href={`/admin/users/${user._id}`}
					aria-label={`View details for ${user.name || "unnamed user"}`}
					className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline"
				>
					View details
				</Link>
			</div>
		</article>
	);
}

export default function AdminUsersPage() {
	const searchParams = useSearchParams();
	const page = parseInt(searchParams.get("page") ?? "1", 10);
	const limit = parseInt(searchParams.get("limit") ?? "20", 10);
	const search = searchParams.get("search") || undefined;
	const role = searchParams.get("role") || undefined;

	const { data, isLoading, error } = useQuery({
		queryKey: ["users", { page, limit, search, role }],
		queryFn: async () => {
			const query = new URLSearchParams({ page: String(page), limit: String(limit) });
			if (search) {
				query.set("search", search);
			}
			if (role) {
				query.set("role", role);
			}
			const path = `/users?${query.toString()}`;
			const body = await apiClient.get<UserList>(path);
			if (!body?.success) {
				throw new Error("Users could not be loaded");
			}
			return {
				users: body.data ?? [],
				total: body.total ?? body.data?.length ?? 0,
			};
		},
		staleTime: STALE_TIMES.LIST,
		placeholderData: keepPreviousData,
	});

	const users = data?.users ?? [];
	const total = data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	const buildHref = (targetPage: number) => {
		const query = new URLSearchParams();
		query.set("page", String(targetPage));
		query.set("limit", String(limit));

		if (search) {
			query.set("search", search);
		}
		if (role) {
			query.set("role", role);
		}

		return `/admin/users?${query.toString()}`;
	};

	return (
		<section className="space-y-6" aria-labelledby="admin-users-title">
			<header className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-2)] lg:flex-row lg:items-center lg:justify-between">
				<div>
					<nav aria-label="Breadcrumb" className="flex items-center gap-2">
						<Link
							href="/admin"
							className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
						>
							Administration
						</Link>
						<span aria-hidden="true" className="text-[var(--text-tertiary)]">
							/
						</span>
						<span className="text-sm text-[var(--text-primary)]">Users</span>
					</nav>

					<h1 id="admin-users-title" className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
						Users
					</h1>

					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						{isLoading ? "Loading..." : `${total} registered users`}
					</p>
				</div>

				<Link
					href="/admin/users/new"
					className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 text-sm font-medium text-[var(--text-inverse)] shadow-[var(--shadow-brand)] transition-colors hover:bg-[var(--color-brand-blue-hover)]"
				>
					<Plus aria-hidden="true" className="h-4 w-4" />
					New user
				</Link>
			</header>

			{error && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] p-4 text-[var(--color-danger)]">
					Users could not be loaded. {error instanceof Error ? error.message : "Unexpected error"}
				</div>
			)}

			{isLoading ? (
				<div className="flex h-32 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
					<span className="text-[var(--text-secondary)]">Loading users...</span>
				</div>
			) : users.length === 0 && !error ? (
				<p className="flex h-32 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-sm text-[var(--text-secondary)] shadow-[var(--shadow-2)]">
					No users have been registered.
				</p>
			) : (
				<>
					<section className="space-y-3 md:hidden" aria-label="Mobile user list">
						{users.map((user: User) => (
							<UserMobileCard key={user._id} user={user} />
						))}
					</section>

					<section
						className="hidden overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)] md:block"
						aria-labelledby="users-table-title"
					>
						<h2 id="users-table-title" className="sr-only">
							User list
						</h2>

						<table className="w-full min-w-[700px] text-sm">
							<caption className="sr-only">
								Registered users with contact details, role, status, last access, and detail link.
							</caption>

							<thead>
								<tr className="border-b border-[var(--border-default)] bg-[var(--surface-secondary)]/60 text-left">
									<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
										Name
									</th>
									<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
										Email
									</th>
									<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
										Role
									</th>
									<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
										Status
									</th>
									<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
										Last update
									</th>
									<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
										Action
									</th>
								</tr>
							</thead>

							<tbody className="divide-y divide-[color:var(--border-default)]/60">
								{users.map((user: User) => {
									const role = resolveRole(user.role);

									return (
										<tr
											key={user._id}
											className="group transition-colors hover:bg-[var(--surface-secondary)]/60"
										>
											<td className="px-5 py-3.5">
												<Link
													href={`/admin/users/${user._id}`}
													className="font-medium text-[var(--text-primary)] hover:text-[var(--color-brand-blue)] hover:underline"
												>
													{user.name || "No name"}
												</Link>
												{user.phone ? (
													<p className="text-xs text-[var(--text-tertiary)]">{user.phone}</p>
												) : null}
											</td>

											<td className="px-5 py-3.5 text-[var(--text-secondary)]">{user.email}</td>

											<td className="px-5 py-3.5">
												<span
													className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
														(role ? ROLE_COLORS[role] : false) ||
														"bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[color:var(--border-default)]/20"
													}`}
												>
													{role ? ROLE_LABELS[role] : user.role}
												</span>
											</td>

											<td className="px-5 py-3.5">
												<span
													className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
														user.isActive
															? "bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[color:var(--color-success)]/15"
															: "bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[color:var(--border-default)]/20"
													}`}
												>
													{user.isActive ? "Active" : "Inactive"}
												</span>
											</td>

											<td className="whitespace-nowrap px-5 py-3.5 text-[var(--text-secondary)]">
												{user.updatedAt ? formatDateTime(user.updatedAt) : "Not updated"}
											</td>

											<td className="px-5 py-3.5">
												<Link
													href={`/admin/users/${user._id}`}
													aria-label={`View details for ${user.name || "unnamed user"}`}
													className="text-xs font-medium text-[var(--color-brand-blue)] opacity-0 transition-opacity hover:underline focus:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100"
												>
													View details
												</Link>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</section>
				</>
			)}

			{totalPages > 1 && !isLoading ? (
				<nav
					aria-label="Pagination"
					className="flex items-center justify-between text-sm text-[var(--text-secondary)]"
				>
					<p>
						Page {page} of {totalPages}
					</p>

					<ul className="flex gap-2">
						{page > 1 ? (
							<li>
								<Link
									href={buildHref(page - 1)}
									className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 hover:bg-[var(--surface-secondary)]"
								>
									Previous
								</Link>
							</li>
						) : null}

						{page < totalPages ? (
							<li>
								<Link
									href={buildHref(page + 1)}
									className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 hover:bg-[var(--surface-secondary)]"
								>
									Next
								</Link>
							</li>
						) : null}
					</ul>
				</nav>
			) : null}
		</section>
	);
}
