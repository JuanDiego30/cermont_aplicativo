"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/http/api-client";
import { formatDate } from "@/lib/utils/format-date";

const STATUS_STYLES: Record<string, string> = {
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
	serial_id?: string;
	serialId?: string;
	serial?: string;
	modelo?: string;
	model?: string;
	marca?: string;
	brand?: string;
	estado_actual?: string;
	currentStatus?: string;
	fecha_certificacion?: string;
	certificationDate?: string;
}

interface ResourceDetail {
	_id: string;
	nombre: string;
	tipo: string;
	unidad: string;
	created_at: string;
	resource_instances: ResourceInstance[];
}

export default function ResourceDetailPage() {
	const params = useParams();
	const id = params.id as string;

	const {
		data: resource,
		isLoading,
		isError,
		error,
	} = useQuery<ResourceDetail>({
		queryKey: ["resource", id],
		queryFn: async () => {
			const body = await apiClient.get<{
				success?: boolean;
				data?: Record<string, unknown>;
				error?: string;
			}>(`/resources/${id}`);
			const r = body?.data;
			if (!r) {
				throw new Error("Recurso no encontrado");
			}

			const rawInstances = r.instances ?? r.resource_instances ?? [];

			return {
				_id: String(r._id ?? r.id ?? ""),
				nombre: String(r.nombre ?? r.name ?? ""),
				tipo: String(r.tipo ?? r.type ?? ""),
				unidad: String(r.unidad ?? r.unit ?? ""),
				created_at: String(r.createdAt ?? r.created_at ?? ""),
				resource_instances: Array.isArray(rawInstances) ? (rawInstances as ResourceInstance[]) : [],
			};
		},
		enabled: !!id,
	});

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center text-zinc-500">
				<Loader2 className="animate-spin size-6 mr-2" /> Cargando detalle de recurso…
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

	return (
		<section className="space-y-6" aria-labelledby="resource-detail-title">
			{/* Header */}
			<div className="flex items-start gap-4">
				<Link
					href="/resources"
					className="mt-1 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
				>
					<ArrowLeft aria-hidden="true" className="size-4" />
					Volver
				</Link>
				<div className="flex items-center gap-3">
					<Package aria-hidden="true" className="size-6 text-blue-600 dark:text-blue-500" />
					<h1
						id="resource-detail-title"
						className="text-2xl font-semibold text-zinc-900 dark:text-white"
					>
						{resource.nombre}
					</h1>
					<span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-900">
						{TYPE_LABELS[resource.tipo] ?? resource.tipo}
					</span>
				</div>
			</div>

			{/* Info Card */}
			<div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
					Información General
				</h2>
				<dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
					<div>
						<dt className="font-medium text-zinc-500 dark:text-zinc-400">Nombre</dt>
						<dd className="mt-1 text-zinc-900 dark:text-white">{resource.nombre}</dd>
					</div>
					<div>
						<dt className="font-medium text-zinc-500 dark:text-zinc-400">Tipo</dt>
						<dd className="mt-1 text-zinc-900 dark:text-white">
							{TYPE_LABELS[resource.tipo] ?? resource.tipo}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-zinc-500 dark:text-zinc-400">Unidad</dt>
						<dd className="mt-1 text-zinc-900 dark:text-white">
							{UNIT_LABELS[resource.unidad] ?? resource.unidad}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-zinc-500 dark:text-zinc-400">Instancias</dt>
						<dd className="mt-1 text-zinc-900 dark:text-white">
							{resource.resource_instances.length}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-zinc-500 dark:text-zinc-400">Registrado</dt>
						<dd className="mt-1 text-zinc-900 dark:text-white">
							{resource.created_at ? formatDate(resource.created_at) : ","}
						</dd>
					</div>
				</dl>
			</div>

			{/* Instances Table */}
			<div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
				<div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
					<h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
						Instancias ({resource.resource_instances.length})
					</h2>
				</div>
				{resource.resource_instances.length === 0 ? (
					<div className="flex h-24 items-center justify-center text-sm text-zinc-400">
						No hay instancias registradas
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-[500px] text-sm">
							<caption className="sr-only">
								Instancias del recurso con serial, modelo, marca, estado y certificación.
							</caption>
							<thead>
								<tr className="border-b border-zinc-100 bg-zinc-50 text-left dark:bg-zinc-800/50 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400">
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
							<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
								{resource.resource_instances.map((inst) => (
									<tr
										key={inst._id || inst.id}
										className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800"
									>
										<td className="px-5 py-3 font-mono text-zinc-900 dark:text-white">
											{inst.serial_id || inst.serialId || inst.serial}
										</td>
										<td className="px-5 py-3 text-zinc-700 dark:text-zinc-300">
											{(inst.modelo || inst.model) ?? ","}
										</td>
										<td className="px-5 py-3 text-zinc-700 dark:text-zinc-300">
											{(inst.marca || inst.brand) ?? ","}
										</td>
										<td className="px-5 py-3">
											<span
												className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[inst.estado_actual ?? inst.currentStatus ?? ""] ?? "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700"}`}
											>
												{inst.estado_actual ?? inst.currentStatus ?? ","}
											</span>
										</td>
										<td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
											{(() => {
												const certDate = inst.fecha_certificacion ?? inst.certificationDate;
												return certDate ? formatDate(certDate) : ",";
											})()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</section>
	);
}
