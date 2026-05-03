"use client";

import type { ApiBody, MaintenanceKit } from "@cermont/shared-types";
import { hasRole, RESOURCE_ROLES } from "@cermont/shared-types/rbac";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Package2, Plus } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/_shared/lib/http/api-client";
import { useAuth } from "@/auth/hooks/useAuth";

export default function KitsPage() {
	const { user: session } = useAuth();
	const role = session?.role ?? "";
	const canManage = hasRole(role, RESOURCE_ROLES);
	const queryClient = useQueryClient();

	const deleteMutation = useMutation({
		mutationFn: async (kitId: string) => {
			await apiClient.delete(`/resources/kits/${kitId}`);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["typical_kits"] });
		},
	});

	const {
		data: kits,
		isLoading,
		isError,
		error,
	} = useQuery<MaintenanceKit[]>({
		queryKey: ["typical_kits"],
		queryFn: async () => {
			const body = await apiClient.get<ApiBody<MaintenanceKit[]>>("/resources/kits");
			return body?.data || [];
		},
	});

	return (
		<section className="space-y-6" aria-labelledby="kits-page-title">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<nav aria-label="Breadcrumb" className="flex items-center gap-2">
						<Link
							href="/resources"
							className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
						>
							Recursos
						</Link>
						<span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
							/
						</span>
						<span className="text-sm text-slate-700 dark:text-slate-300">Kits Típicos</span>
					</nav>
					<h1
						id="kits-page-title"
						className="mt-1 text-2xl font-bold text-slate-900 dark:text-white"
					>
						Kits Típicos
					</h1>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
						{kits?.length || 0} kits configurados
					</p>
				</div>
				{canManage && (
					<Link
						href="/maintenance/new"
						className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
					>
						<Plus aria-hidden="true" className="h-4 w-4" />
						Nuevo Kit
					</Link>
				)}
			</div>

			{/* Grid */}
			{isLoading ? (
				<div className="flex h-32 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-400 shadow-sm">
					<Loader2 className="animate-spin h-6 w-6 mr-2" /> Cargando kits...
				</div>
			) : isError ? (
				<div className="flex h-32 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-sm text-red-500 shadow-sm dark:bg-red-900/20 dark:border-red-900/30">
					Error al cargar kits: {(error as Error).message}
				</div>
			) : kits?.length === 0 ? (
				<div className="flex h-32 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-400 shadow-sm">
					No hay kits registrados
				</div>
			) : (
				<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{(kits || []).map((kit) => (
						<li key={kit._id}>
							<article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
								<div className="flex items-start gap-3">
									<div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/30">
										<Package2
											aria-hidden="true"
											className="h-5 w-5 text-blue-600 dark:text-blue-400"
										/>
									</div>
									<div className="min-w-0 flex-1">
										<h2 className="truncate font-semibold text-slate-900 dark:text-white">
											{kit.name}
										</h2>
										<p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
											{kit.activityType}
										</p>
										<p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
											{kit.tools.length + kit.equipment.length} ítem(s)
										</p>
										{canManage && kit._id && (
											<button
												type="button"
												onClick={() => deleteMutation.mutate(kit._id)}
												className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700"
												disabled={deleteMutation.isPending}
											>
												{deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
											</button>
										)}
									</div>
								</div>
							</article>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
