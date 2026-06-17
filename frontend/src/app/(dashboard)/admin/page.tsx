import { ADMIN_ROLES, ROLE_LABELS } from "@cermont/domain";
import { ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { requireRole } from "@/modules/auth/session";
import { getUsers } from "@/modules/users/queries";
import type { User } from "@/modules/users/types";

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

export default async function AdminPage() {
	await requireRole(ADMIN_ROLES);

	const usersRaw = await getUsers();
	const users: User[] = usersRaw ?? [];
	const totalUsers = users.length;
	const activeUsers = users.filter((u) => u.isActive).length;
	const inactiveUsers = totalUsers - activeUsers;

	const usersByRoleMap = users.reduce<Record<string, number>>((acc, user) => {
		const role = typeof user.role === "string" ? user.role : "cliente";
		acc[role] = (acc[role] || 0) + 1;
		return acc;
	}, {});

	const usersByRole = Object.entries(usersByRoleMap).map(([role, count]) => ({
		role,
		_count: { role: count },
	}));

	const summaryCards = [
		{ label: "Total usuarios", value: totalUsers, tone: "text-[var(--color-brand-blue)]" },
		{ label: "Usuarios activos", value: activeUsers, tone: "text-[var(--color-success)]" },
		{ label: "Inactivos", value: inactiveUsers, tone: "text-[var(--text-tertiary)]" },
	];

	return (
		<section className="space-y-6" aria-labelledby="admin-page-title">
			<header className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
				<div className="border-b border-[var(--border-subtle)] bg-[linear-gradient(135deg,rgba(58,120,216,0.12),rgba(15,23,41,0.02),transparent)] p-5 sm:px-6">
					<div className="flex items-center gap-3">
						<div className="flex size-11 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-brand-blue-bg)] text-[var(--color-brand-blue)]">
							<ShieldCheck aria-hidden="true" className="size-5" />
						</div>
						<div>
							<h1
								id="admin-page-title"
								className="text-2xl font-semibold text-[var(--text-primary)]"
							>
								Administración
							</h1>
							<p className="mt-1 text-sm text-[var(--text-secondary)]">
								Panel de administración del sistema
							</p>
						</div>
					</div>
				</div>

				<div className="p-5 sm:px-6">
					<ul className="grid gap-3 sm:grid-cols-3">
						{summaryCards.map((card) => (
							<li
								key={card.label}
								className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/50 p-4"
							>
								<p className="text-sm font-medium text-[var(--text-secondary)]">{card.label}</p>
								<p className={`mt-2 text-3xl font-semibold ${card.tone}`}>{card.value}</p>
							</li>
						))}
					</ul>
				</div>
			</header>

			<section aria-labelledby="admin-stats-title">
				<h2 id="admin-stats-title" className="sr-only">
					Estadísticas de usuarios
				</h2>

				<div className="grid gap-4 sm:grid-cols-3">
					{summaryCards.map((card) => (
						<article
							key={card.label}
							className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-2)]"
						>
							<p className="text-sm font-medium text-[var(--text-secondary)]">{card.label}</p>
							<p className={`mt-2 text-3xl font-semibold ${card.tone}`}>{card.value}</p>
						</article>
					))}
				</div>
			</section>

			<section
				className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-2)]"
				aria-labelledby="users-by-role-title"
			>
				<header className="mb-4 flex items-center justify-between gap-4">
					<h2
						id="users-by-role-title"
						className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]"
					>
						Usuarios por rol
					</h2>

					<Link
						href="/admin/users"
						className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-primary)]"
					>
						<Users aria-hidden="true" className="size-4" />
						Gestionar usuarios
					</Link>
				</header>

				<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{usersByRole.map((roleGroup) => (
						<li
							key={roleGroup.role}
							className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/60 px-4 py-3"
						>
							<span
								className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${ROLE_COLORS[roleGroup.role] ?? "bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[var(--border-subtle)]/20"}`}
							>
								{ROLE_LABELS[roleGroup.role as keyof typeof ROLE_LABELS] ?? roleGroup.role}
							</span>

							<span className="text-lg font-semibold text-[var(--text-primary)]">
								{roleGroup._count.role}
							</span>
						</li>
					))}
				</ul>
			</section>

			<section aria-labelledby="admin-quick-links-title">
				<h2 id="admin-quick-links-title" className="sr-only">
					Enlaces rápidos
				</h2>

				<ul className="grid gap-4 sm:grid-cols-2">
					<li>
						<Link
							href="/admin/users"
							className="flex items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-2)] transition-transform hover:-translate-y-0.5 hover:shadow-[var(--shadow-3)]"
						>
							<span
								aria-hidden="true"
								className="rounded-[var(--radius-lg)] bg-[var(--color-brand-blue-bg)] p-3 text-[var(--color-brand-blue)]"
							>
								<Users aria-hidden="true" className="size-6" />
							</span>

							<span className="flex flex-col">
								<span className="font-semibold text-[var(--text-primary)]">
									Gestión de usuarios
								</span>
								<span className="text-sm text-[var(--text-secondary)]">
									Crear, editar y administrar usuarios del sistema
								</span>
							</span>
						</Link>
					</li>
				</ul>
			</section>
		</section>
	);
}
