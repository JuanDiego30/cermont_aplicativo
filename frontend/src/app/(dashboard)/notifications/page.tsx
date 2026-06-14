"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Filter } from "lucide-react";
import { useCallback, useState } from "react";
import { EmptyState } from "@/core/ui/EmptyState";
import { Skeleton } from "@/core/ui/Skeleton";
import { apiClient } from "@/lib/http/api-client";
import { formatDateTime } from "@/lib/utils/format-date";

interface NotificationItem {
	_id: string;
	notificationId: string;
	title: string;
	body: string;
	type: string;
	priority: string;
	isRead: boolean;
	readAt?: string;
	createdAt: string;
	relatedEntity?: { entityType: string; entityId: string };
}

interface NotificationsResponse {
	notifications: NotificationItem[];
	unreadCount: number;
	pagination: { page: number; limit: number; total: number; totalPages: number };
}

const NOTIFICATION_TYPES = [
	{ label: "Todas", value: "" },
	{ label: "Transiciones", value: "STATE_TRANSITION" },
	{ label: "Aprobaciones", value: "APPROVAL_REQUIRED" },
	{ label: "Documentos", value: "DOCUMENT_UPLOADED" },
	{ label: "Alertas", value: "DEADLINE_WARNING" },
	{ label: "Pagos", value: "PAYMENT_RECEIVED" },
	{ label: "Sistema", value: "SYSTEM_ALERT" },
] as const;

function useNotifications(page = 1, typeFilter = "") {
	return useQuery<NotificationsResponse>({
		queryKey: ["notifications", "page", page, "type", typeFilter],
		queryFn: async () => {
			const envelope = await apiClient.get<{ success: boolean; data: NotificationsResponse }>(
				`/notifications?page=${page}&limit=20${typeFilter ? `&type=${typeFilter}` : ""}`,
			);
			return envelope.data;
		},
	});
}

export default function NotificationsPage() {
	const [page, setPage] = useState(1);
	const [typeFilter, setTypeFilter] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const { data, isLoading, error, refetch } = useNotifications(page, typeFilter);
	const queryClient = useQueryClient();

	const markAsRead = useCallback(
		async (id: string) => {
			await apiClient.patch(`/notifications/${id}/read`);
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		[queryClient],
	);

	const markAllRead = useCallback(async () => {
		await apiClient.post("/notifications/mark-all-read");
		queryClient.invalidateQueries({ queryKey: ["notifications"] });
	}, [queryClient]);

	if (isLoading) {
		return (
			<div className="space-y-4 p-6">
				<Skeleton variant="text" className="h-8 w-48" />
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} variant="chart" height={80} />
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6 p-6">
				<h1 className="text-xl font-semibold text-[var(--text-primary)]">Notificaciones</h1>
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm">
					<p className="text-[var(--color-danger)]">Error al cargar notificaciones.</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="mt-2 text-sm font-medium text-[var(--color-brand-blue)] hover:underline"
					>
						Reintentar
					</button>
				</div>
			</div>
		);
	}

	const notifications = data?.notifications ?? [];
	const unreadCount = data?.unreadCount ?? 0;
	const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0 };

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-xl font-semibold text-[var(--text-primary)]">Notificaciones</h1>
					<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
						{unreadCount > 0
							? `${unreadCount} sin leer de ${pagination.total} total`
							: `${pagination.total} notificaciones`}
					</p>
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => setShowFilters((v) => !v)}
						className="flex items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
					>
						<Filter className="size-3.5" aria-hidden="true" />
						Filtrar
					</button>
					{unreadCount > 0 && (
						<button
							type="button"
							onClick={markAllRead}
							className="flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-3 py-2 text-xs font-medium text-white hover:opacity-90"
						>
							<Check className="size-3.5" aria-hidden="true" />
							Marcar todas leídas
						</button>
					)}
				</div>
			</div>

			{/* Type Filters */}
			{showFilters && (
				<section className="flex flex-wrap gap-2">
					{NOTIFICATION_TYPES.map((t) => (
						<button
							type="button"
							key={t.value}
							onClick={() => {
								setTypeFilter(t.value);
								setPage(1);
							}}
							className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
								typeFilter === t.value
									? "bg-[var(--color-brand-blue)] text-white"
									: "border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
							}`}
						>
							{t.label}
						</button>
					))}
				</section>
			)}

			{/* Empty State */}
			{notifications.length === 0 && (
				<EmptyState
					icon="notifications"
					title={typeFilter ? "Sin resultados para este filtro" : "No tienes notificaciones"}
					description={
						typeFilter
							? "Cambia el tipo de notificación para consultar otros eventos."
							: "Las alertas, aprobaciones y recordatorios aparecerán aquí."
					}
				/>
			)}

			{/* Notifications List */}
			{notifications.length > 0 && (
				<ul className="space-y-2">
					{notifications.map((n) => (
						<li
							key={n._id}
							className={`rounded-[var(--radius-lg)] border border-[var(--border-default)] p-4 transition-colors ${
								n.isRead
									? "bg-[var(--surface-primary)]"
									: "border-l-4 border-l-[var(--color-brand-blue)] bg-[var(--color-info-bg)]/40"
							}`}
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<p
											className={`truncate text-sm ${
												n.isRead
													? "text-[var(--text-primary)]"
													: "font-semibold text-[var(--text-primary)]"
											}`}
										>
											{n.title}
										</p>
										{n.priority === "high" || n.priority === "critical" ? (
											<span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
												{n.priority}
											</span>
										) : null}
									</div>
									<p className="mt-0.5 text-xs text-[var(--text-secondary)] line-clamp-2">
										{n.body}
									</p>
									<p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
										{formatDateTime(n.createdAt)}
									</p>
								</div>
								{!n.isRead && (
									<button
										type="button"
										onClick={() => markAsRead(n._id)}
										className="shrink-0 rounded-full p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--color-brand-blue)]"
										aria-label="Marcar como leída"
									>
										<Check className="size-4" aria-hidden="true" />
									</button>
								)}
							</div>
						</li>
					))}
				</ul>
			)}

			{/* Pagination */}
			{pagination.totalPages > 1 && (
				<nav aria-label="Paginación" className="flex items-center justify-center gap-2">
					<button
						type="button"
						disabled={page <= 1}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] disabled:opacity-40"
					>
						Anterior
					</button>
					<span className="text-xs text-[var(--text-tertiary)]">
						{page} / {pagination.totalPages}
					</span>
					<button
						type="button"
						disabled={page >= pagination.totalPages}
						onClick={() => setPage((p) => p + 1)}
						className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] disabled:opacity-40"
					>
						Siguiente
					</button>
				</nav>
			)}
		</div>
	);
}
