"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiClient } from "@/_shared/lib/http/api-client";

const STATUS_STYLES: Record<string, string> = {
	available:
		"bg-green-100 text-green-700 ring-green-200 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-900",
	in_use:
		"bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-900",
	maintenance:
		"bg-yellow-100 text-yellow-700 ring-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:ring-yellow-900",
	disponible:
		"bg-green-100 text-green-700 ring-green-200 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-900",
	en_uso:
		"bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-900",
	mantenimiento:
		"bg-yellow-100 text-yellow-700 ring-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:ring-yellow-900",
	fuera_de_servicio:
		"bg-red-100 text-red-700 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-900",
};

const TYPE_LABELS: Record<string, string> = {
	tool: "Herramienta",
	vehicle: "Vehículo",
	equipment: "Equipo",
	material: "Material",
	herramienta: "Herramienta",
	equipo: "Equipo",
	epp: "EPP",
	repuesto: "Repuesto",
};

const UNIT_LABELS: Record<string, string> = {
	unid: "Unid.",
	mtrs: "Metros",
	gls: "Galones",
	kg: "Kg",
	lb: "Lb",
	otro: "Otro",
};

interface ResourceInstance {
	_id?: string;
	id?: string;
	serialId?: string;
	serial?: string;
	model?: string;
	brand?: string;
	currentStatus?: string;
	certificationDate?: string;
}

interface ResourceData {
	_id?: string | { _id?: string };
	id?: string;
	name?: string;
	type?: string;
	unit?: string;
	createdAt?: string;
	instances?: ResourceInstance[];
	resource_instances?: ResourceInstance[];
}

export default function ResourceDetailPage() {
	const params = useParams();
	const id = params.id as string;

	const {
		data: resource,
		isLoading,
		isError,
		error,
	} = useQuery<ResourceData>({
		queryKey: ["resource", id],
		queryFn: async () => {
			const body = await apiClient.get<{ success?: boolean; data?: ResourceData; error?: string }>(
				`/resources/${id}`,
			);
			const r = body?.data;
			if (!r) {
				throw new Error("Recurso no encontrado");
			}

			return {
				_id: r._id || r.id,
				name: r.name,
				type: r.type,
				unit: r.unit,
				createdAt: r.createdAt,
				resource_instances: (r.instances || r.resource_instances) ?? [],
			};
		},
		enabled: !!id,
	});

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center text-slate-500">
				<Loader2 className="animate-spin h-6 w-6 mr-2" /> Cargando detalle de recurso...
			</div>
		);
	}

	if (isError || !resource) {
		return (
			<div className="p-4 bg-red-50 text-red-600 rounded-lg dark:bg-red-900/20 dark:text-red-400">
				No se pudo cargar el recurso. {(error as Error)?.message}
			</div>
		);
	}

	const instances = resource.resource_instances ?? [];

	return (
		<section className="space-y-6" aria-labelledby="resource-detail-title">
			{/* Header */}
			<div className="flex items-start gap-4">
				<Link
					href="/resources"
					className="mt-1 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
				>
					<ArrowLeft aria-hidden="true" className="h-4 w-4" />
					Volver
				</Link>
				<div className="flex items-center gap-3">
					<Package aria-hidden="true" className="h-6 w-6 text-blue-600 dark:text-blue-500" />
					<h1
						id="resource-detail-title"
						className="text-2xl font-bold text-slate-900 dark:text-white"
					>
						{resource.name ?? "Sin nombre"}
					</h1>
					{resource.type && (
						<span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-900">
							{TYPE_LABELS[resource.type] ?? resource.type}
						</span>
					)}
				</div>
			</div>

			{/* Info Card */}
			<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
					Información General
				</h2>
				<dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Nombre</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">{resource.name ?? "—"}</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Tipo</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">
							{resource.type ? (TYPE_LABELS[resource.type] ?? resource.type) : "—"}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Unidad</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">
							{resource.unit ? (UNIT_LABELS[resource.unit] ?? resource.unit) : "—"}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Instancias</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">{instances.length}</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Registrado</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">
							{resource.createdAt
								? format(new Date(resource.createdAt), "dd MMM yyyy", {
										locale: es,
									})
								: "—"}
						</dd>
					</div>
				</dl>
			</div>

			{/* Instances Table */}
			<div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
				<div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
					<h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
						Instancias ({instances.length})
					</h2>
				</div>
				{instances.length === 0 ? (
					<div className="flex h-24 items-center justify-center text-sm text-slate-400">
						No hay instancias registradas
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-[500px] text-sm">
							<caption className="sr-only">
								Instancias del recurso con serial, modelo, marca, estado y certificación.
							</caption>
							<thead>
								<tr className="border-b border-slate-100 bg-slate-50 text-left dark:bg-slate-800/50 dark:border-slate-700 text-slate-500 dark:text-slate-400">
									<th scope="col" className="px-5 py-3 font-medium">
										Serial
									</th>
									<th scope="col" className="px-5 py-3 font-medium">
										Modelo
									</th>
									<th scope="col" className="px-5 py-3 font-medium">
										Marca
									</th>
									<th scope="col" className="px-5 py-3 font-medium">
										Estado
									</th>
									<th scope="col" className="px-5 py-3 font-medium">
										Cert.
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100 dark:divide-slate-800">
								{instances.map((inst, index) => {
									const key = inst._id || inst.id || `inst-${index}`;
									const serial = inst.serialId || inst.serial;
									const model = inst.model;
									const brand = inst.brand;
									const status = inst.currentStatus;
									const certDate = inst.certificationDate;

									return (
										<tr
											key={key}
											className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800"
										>
											<td className="px-5 py-3 font-mono text-slate-900 dark:text-white">
												{serial ?? "—"}
											</td>
											<td className="px-5 py-3 text-slate-700 dark:text-slate-300">
												{model ?? "—"}
											</td>
											<td className="px-5 py-3 text-slate-700 dark:text-slate-300">
												{brand ?? "—"}
											</td>
											<td className="px-5 py-3">
												{status ? (
													<span
														className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
															STATUS_STYLES[status] ??
															"bg-slate-100 text-slate-600 ring-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
														}`}
													>
														{status}
													</span>
												) : (
													"—"
												)}
											</td>
											<td className="px-5 py-3 text-slate-500 dark:text-slate-400">
												{certDate ? format(new Date(certDate), "dd MMM yyyy", { locale: es }) : "—"}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</section>
	);
}
