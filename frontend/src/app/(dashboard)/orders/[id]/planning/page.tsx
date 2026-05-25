"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Loader2, Package, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/http/api-client";

interface PlannedResource {
	_id?: string;
	id?: string;
	resource?: { name: string; type: string; unit?: string };
	resources?: { nombre: string; tipo: string; unidad: string };
	cantidad?: number;
	quantity?: number;
	horas_planeadas?: number;
	costo_unitario?: number;
	moneda?: string;
}

interface PlanningDetail {
	planned_resources: PlannedResource[];
	unidad_negocio?: string;
	businessUnit?: string;
	alcance?: string;
	scope?: string;
}

interface OrderPlanningData {
	_id?: string;
	project_planning?: PlanningDetail | null | undefined;
	planning?: PlanningDetail | null | undefined;
	planned_resources?: PlannedResource[];
	notas?: string;
	estado?: string;
	numero_ot?: string;
	orderNumber?: string;
	cliente?: string;
	clientName?: string;
}

export default function OrderPlanningPage() {
	const params = useParams();
	const id = params.id as string;

	const {
		data: order,
		isLoading,
		isError,
		error,
	} = useQuery<OrderPlanningData | undefined>({
		queryKey: ["order-planning", id],
		queryFn: async () => {
			const payload = await apiClient.get<{
				success?: boolean;
				data?: OrderPlanningData;
				error?: string;
				message?: string;
			}>(`/orders/${id}/planning`);
			if (!payload?.success) {
				throw new Error(payload?.message || payload?.error || "Error al cargar planificación");
			}
			return payload.data;
		},
		enabled: !!id,
	});

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center text-zinc-500">
				<Loader2 className="animate-spin size-6 mr-2" /> Cargando planificación de la orden…
			</div>
		);
	}

	if (isError || !order) {
		return (
			<div className="p-4 bg-red-50 text-red-600 rounded-lg dark:bg-red-900/20 dark:text-red-400">
				No se pudo cargar la planificación. {(error as Error)?.message}
			</div>
		);
	}

	// The backend might return the order with project_planning OR just planning
	const planning: PlanningDetail | null | undefined = order.project_planning ?? order.planning;
	const numero_ot = order.numero_ot || order.orderNumber;
	const cliente = order.cliente || order.clientName;

	return (
		<section className="space-y-6" aria-labelledby="order-planning-title">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link
					href={`/orders/${id}`}
					className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:text-white"
				>
					<ArrowLeft aria-hidden="true" className="size-4" />
					Volver a la orden
				</Link>
			</div>

			<div className="flex items-center justify-between">
				<div>
					<h1
						id="order-planning-title"
						className="text-2xl font-semibold text-zinc-900 dark:text-white"
					>
						Planificación , {numero_ot}
					</h1>
					<p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{cliente}</p>
				</div>
			</div>

			{!planning ? (
				<div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
					<Calendar aria-hidden="true" className="mx-auto size-12 text-zinc-400 mb-4" />
					<h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
						Sin planificación registrada
					</h3>
					<p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
						Esta orden de trabajo aún no tiene un plan de ejecución creado.
					</p>
				</div>
			) : (
				<div className="space-y-6">
					{/* Planning details */}
					<div className="rounded-lg bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
						<h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4">
							Detalles del Plan
						</h2>
						<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
									<User aria-hidden="true" className="size-3.5" />
									Unidad de Negocio
								</dt>
								<dd className="mt-1 text-sm text-zinc-900 dark:text-white">
									{planning.unidad_negocio || planning.businessUnit}
								</dd>
							</div>
							<div>
								<dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
									Alcance
								</dt>
								<dd className="mt-1 text-sm text-zinc-900 dark:text-white whitespace-pre-wrap">
									{planning.alcance || planning.scope}
								</dd>
							</div>
						</dl>
					</div>

					{/* Planned resources */}
					<div className="rounded-lg bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
						<h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
							<Package aria-hidden="true" className="size-5 text-zinc-500 dark:text-zinc-400" />
							Recursos Planificados
						</h2>
						{!planning.planned_resources || planning.planned_resources.length === 0 ? (
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								No se han asignado recursos al plan.
							</p>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
									<caption className="sr-only">
										Recursos planificados para la orden con tipo, cantidad y unidad.
									</caption>
									<thead>
										<tr>
											<th
												scope="col"
												className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
											>
												Recurso
											</th>
											<th
												scope="col"
												className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
											>
												Tipo
											</th>
											<th
												scope="col"
												className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
											>
												Cantidad
											</th>
											<th
												scope="col"
												className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
											>
												Unidad
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
										{planning.planned_resources.map((pr: PlannedResource) => (
											<tr
												key={pr._id || pr.id}
												className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
											>
												<td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white">
													{pr.resources?.nombre || pr.resource?.name || "Desconocido"}
												</td>
												<td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 capitalize">
													{pr.resources?.tipo || pr.resource?.type || ","}
												</td>
												<td className="px-4 py-3 text-sm text-zinc-900 dark:text-white">
													{pr.cantidad || pr.quantity}
												</td>
												<td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
													{pr.resources?.unidad || pr.resource?.unit || ","}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			)}
		</section>
	);
}
