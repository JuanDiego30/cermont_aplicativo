"use client";

import { ROLE_LABELS, type UserRole } from "@cermont/domain";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient } from "@/lib/http/api-client";
import { normalizePagination } from "@/lib/pagination";
import { formatDateTime } from "@/lib/utils/format-date";
import { readSearchParam } from "@/lib/utils/search-params";
import type { User, UserList } from "@/modules/users/types";

const ROLE_COLORS: Record<string, string> = {
	gerente: "bg-[var(--color-purple-bg)] text-[var(--color-purple)] ring-[var(--color-purple)]/15",
	residente: "bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[var(--color-info)]/15",
	hes: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[var(--color-warning)]/15",
	supervisor: "bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[var(--color-info)]/15",
	operador:
		"bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[var(--color-success)]/15",
	tecnico:
		"bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[var(--border-subtle)]/20",
	administrativo:
		"bg-[var(--color-brand-blue-bg)] text-[var(--color-brand-blue)] ring-[var(--color-brand-blue)]/15",
	cliente:
		"bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[var(--border-subtle)]/20",
};

interface UsersQueryParams {
	page: number;
	limit: number;
	search?: string;
	role?: string;
}

function setOptionalQueryParam(query: URLSearchParams, key: string, value?: string): void {
	if (value) {
		query.set(key, value);
	}
}

function buildUsersPath({ page, limit, search, role }: UsersQueryParams): string {
	const query = new URLSearchParams({ page: String(page), limit: String(limit) });
	setOptionalQueryParam(query, "search", search);
	setOptionalQueryParam(query, "role", role);

	return `/users?${query.toString()}`;
}

async function fetchUsers(params: UsersQueryParams): Promise<{ users: User[]; total: number }> {
	const body = await apiClient.get<UserList>(buildUsersPath(params));
	if (!body?.success) {
		throw new Error("Error al cargar usuarios");
	}

	return {
		users: body.data ?? [],
		total: body.total ?? body.data?.length ?? 0,
	};
}

export default function AdminUsersPage() {
	return (
		<Suspense fallback={<AdminUsersLoading />}>
			<AdminUsersPageInner />
		</Suspense>
	);
}

function AdminUsersLoading() {
	return (
		<section className="space-y-6" aria-labelledby="admin-users-title">
			<div className="flex h-32 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
				<span className="text-[var(--text-secondary)]">Cargando usuarios…</span>
			</div>
		</section>
	);
}

function AdminUsersPageInner() {
	const searchParams = useSearchParams();

	const getSearchParam = (key: string) => readSearchParam(searchParams, key);
	const { page, limit } = normalizePagination({
		page: getSearchParam("page") || null,
		limit: getSearchParam("limit") || null,
	});
	const search = getSearchParam("search") || undefined;
	const role = getSearchParam("role") || undefined;

	const { data, isLoading, error } = useQuery({
		queryKey: ["users", { page, limit, search, role }],
		queryFn: () => fetchUsers({ page, limit, search, role }),
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

		setOptionalQueryParam(query, "search", search);
		setOptionalQueryParam(query, "role", role);

		return `/admin/users?${query.toString()}`;
	};

	return (
		<section className="space-y-6" aria-labelledby="admin-users-title">
			<header className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-2)] lg:flex-row lg:items-center lg:justify-between">
				<div>
					<nav aria-label="Breadcrumb" className="flex items-center gap-2">
						<Link
							href="/admin"
							className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
						>
							Administración
						</Link>
						<span aria-hidden="true" className="text-[var(--text-tertiary)]">
							/
						</span>
						<span className="text-sm text-[var(--text-primary)]">Usuarios</span>
					</nav>

					<h1
						id="admin-users-title"
						className="mt-1 text-2xl font-semibold text-[var(--text-primary)]"
					>
						Usuarios
					</h1>

					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						{isLoading ? "Cargando…" : `${total} usuarios registrados`}
					</p>
				</div>

				<Link
					href="/admin/users/new"
					className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-brand)] transition-colors hover:bg-[var(--color-brand-blue-hover)]"
				>
					<Plus aria-hidden="true" className="size-4" />
					Nuevo usuario
				</Link>
			</header>

			{error && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] p-4 text-[var(--color-danger)]">
					No se pudieron cargar los usuarios. {(error as Error)?.message}
				</div>
			)}

			{isLoading ? (
				<div className="flex h-32 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
					<span className="text-[var(--text-secondary)]">Cargando usuarios…</span>
				</div>
			) : users.length === 0 && !error ? (
				<p className="flex h-32 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-sm text-[var(--text-secondary)] shadow-[var(--shadow-2)]">
					No hay usuarios registrados.
				</p>
			) : (
				<section
					className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]"
					aria-labelledby="tabla-usuarios-titulo"
				>
					<h2 id="tabla-usuarios-titulo" className="sr-only">
						Listado de usuarios
					</h2>

					<table className="w-full min-w-[700px] text-sm">
						<caption className="sr-only">
							Usuarios registrados con datos de contacto, rol, estado, último acceso y enlace al
							detalle.
						</caption>

						<thead>
							<tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)]/60 text-left">
								<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
									Nombre
								</th>
								<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
									Email
								</th>
								<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
									Rol
								</th>
								<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
									Estado
								</th>
								<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
									Última actualización
								</th>
								<th scope="col" className="px-5 py-3 font-medium text-[var(--text-secondary)]">
									Acción
								</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-[var(--border-subtle)]/60">
							{users.map((user: User) => (
								<UserRow key={user._id} user={user} />
							))}
						</tbody>
					</table>
				</section>
			)}

			<AdminUsersPagination
				page={page}
				totalPages={totalPages}
				isLoading={isLoading}
				buildHref={buildHref}
			/>
		</section>
	);
}

function AdminUsersPagination({
	page,
	totalPages,
	isLoading,
	buildHref,
}: {
	page: number;
	totalPages: number;
	isLoading: boolean;
	buildHref: (targetPage: number) => string;
}) {
	if (totalPages <= 1 || isLoading) {
		return null;
	}

	return (
		<nav
			aria-label="Paginación"
			className="flex items-center justify-between text-sm text-[var(--text-secondary)]"
		>
			<p>
				Página {page} de {totalPages}
			</p>

			<ul className="flex gap-2">
				{page > 1 ? (
					<li>
						<Link
							href={buildHref(page - 1)}
							className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-1.5 hover:bg-[var(--surface-secondary)]"
						>
							Anterior
						</Link>
					</li>
				) : null}

				{page < totalPages ? (
					<li>
						<Link
							href={buildHref(page + 1)}
							className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-1.5 hover:bg-[var(--surface-secondary)]"
						>
							Siguiente
						</Link>
					</li>
				) : null}
			</ul>
		</nav>
	);
}

function UserRow({ user }: { user: User }) {
	return (
		<tr className="group transition-colors hover:bg-[var(--surface-secondary)]/60">
			<td className="px-5 py-3.5">
				<Link
					href={`/admin/users/${user._id}`}
					className="font-medium text-[var(--text-primary)] hover:text-[var(--color-brand-blue)] hover:underline"
				>
					{user.name || ","}
				</Link>
				{user.phone ? <p className="text-xs text-[var(--text-tertiary)]">{user.phone}</p> : null}
			</td>

			<td className="px-5 py-3.5 text-[var(--text-secondary)]">{user.email}</td>

			<td className="px-5 py-3.5">
				<span
					className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
						ROLE_COLORS[user.role] ??
						"bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[var(--border-subtle)]/20"
					}`}
				>
					{ROLE_LABELS[user.role as UserRole] ?? user.role}
				</span>
			</td>

			<td className="px-5 py-3.5">
				<span
					className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
						user.isActive
							? "bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[var(--color-success)]/15"
							: "bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[var(--border-subtle)]/20"
					}`}
				>
					{user.isActive ? "Activo" : "Inactivo"}
				</span>
			</td>

			<td className="whitespace-nowrap px-5 py-3.5 text-[var(--text-secondary)]">
				{user.updatedAt ? formatDateTime(user.updatedAt) : ","}
			</td>

			<td className="px-5 py-3.5">
				<Link
					href={`/admin/users/${user._id}`}
					aria-label={`Ver detalle del usuario ${user.name || "sin nombre"}`}
					className="text-xs font-medium text-[var(--color-brand-blue)] opacity-0 transition-opacity hover:underline focus:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100"
				>
					Ver detalle
				</Link>
			</td>
		</tr>
	);
}
