"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, HardDrive, Loader2, Tag } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ErrorFallback } from "@/components/common/ErrorFallback";
import { QRCodeButton } from "@/components/common/QRCodeButton";
import { EmptyState } from "@/core/ui/EmptyState";
import { StatusBadge } from "@/core/ui/StatusBadge";
import { apiClient } from "@/lib/http/api-client";
import { formatLocaleDate } from "@/lib/utils/format-date";
import { buildAssetRoute } from "@/lib/routes";

type AssetDetail = {
	_id: string;
	code: string;
	name: string;
	description?: string;
	type: string;
	status: string;
	serialNumber?: string;
	model?: string;
	brand?: string;
	location?: string;
	purchaseDate?: string;
	lastMaintenanceAt?: string;
	nextMaintenanceAt?: string;
	createdBy?: { _id: string; name: string; email: string };
	createdAt: string;
	updatedAt: string;
};

const TYPE_LABELS: Record<string, string> = {
	tool: "Herramienta",
	equipment: "Equipo",
	vehicle: "Vehículo",
	machinery: "Maquinaria",
	safety: "Equipo de Seguridad",
	instrument: "Instrumento",
	other: "Otro",
};

function formatDate(dateStr: string | undefined): string {
	if (!dateStr) {
		return "—";
	}
	return formatLocaleDate(dateStr, {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

function AssetDetailContent({ id }: { id: string }) {
	const { back } = useRouter();

	const {
		data: asset,
		isLoading,
		error,
	} = useQuery<AssetDetail>({
		queryKey: ["asset", id],
		queryFn: async () => {
			const json = await apiClient.get<{ success: boolean; data: AssetDetail }>(`/assets/${id}`);
			return json.data;
		},
	});

	if (isLoading) {
		return (
			<div className="flex justify-center py-24" aria-live="polite">
				<Loader2
					className="size-8 animate-spin text-[var(--color-brand-blue)]"
					aria-hidden="true"
				/>
				<span className="sr-only">Cargando activo…</span>
			</div>
		);
	}

	if (error) {
		return (
			<ErrorFallback
				title="Error al cargar activo"
				description="No se pudo cargar la información del activo."
			/>
		);
	}

	if (!asset) {
		return (
			<EmptyState
				icon="assets"
				title="Activo no encontrado"
				description="El activo que buscas no existe o ha sido eliminado."
			/>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<header className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
				<div className="mb-4 flex items-center gap-3">
					<button
						type="button"
						onClick={() => back()}
						className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-steel hover:bg-zinc-100 dark:text-steel dark:hover:bg-zinc-800"
						aria-label="Volver al listado de activos"
					>
						<ArrowLeft className="size-4" aria-hidden="true" />
						<span className="hidden sm:inline">Volver</span>
					</button>
					<span className="font-mono text-sm font-semibold text-brand-green dark:text-brand-green">
						{asset.code}
					</span>
					<StatusBadge status={asset.status} />
					<div className="ml-auto flex items-center gap-2">
						<QRCodeButton
							data={buildAssetRoute(id)}
							label={`Activo: ${asset.code} - ${asset.name}`}
						/>
					</div>
				</div>

				<h1 className="text-xl font-semibold text-ink dark:text-white sm:text-2xl">{asset.name}</h1>

				{asset.description && (
					<p className="mt-3 text-sm leading-relaxed text-steel dark:text-steel">
						{asset.description}
					</p>
				)}
			</header>

			{/* Details Grid */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* General Info */}
				<section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
					<h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink dark:text-white">
						<Tag className="size-4" aria-hidden="true" />
						Información General
					</h2>
					<dl className="space-y-3 text-sm">
						<div className="flex justify-between">
							<dt className="text-steel dark:text-steel">Tipo</dt>
							<dd className="font-medium text-ink dark:text-white">
								{TYPE_LABELS[asset.type] ?? asset.type}
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-steel dark:text-steel">Código</dt>
							<dd className="font-mono font-medium text-ink dark:text-white">{asset.code}</dd>
						</div>
						{asset.serialNumber && (
							<div className="flex justify-between">
								<dt className="text-steel dark:text-steel">N° Serie</dt>
								<dd className="font-medium text-ink dark:text-white">{asset.serialNumber}</dd>
							</div>
						)}
						{asset.brand && (
							<div className="flex justify-between">
								<dt className="text-steel dark:text-steel">Marca</dt>
								<dd className="font-medium text-ink dark:text-white">{asset.brand}</dd>
							</div>
						)}
						{asset.model && (
							<div className="flex justify-between">
								<dt className="text-steel dark:text-steel">Modelo</dt>
								<dd className="font-medium text-ink dark:text-white">{asset.model}</dd>
							</div>
						)}
					</dl>
				</section>

				{/* Status & Maintenance */}
				<section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
					<h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink dark:text-white">
						<CalendarClock className="size-4" aria-hidden="true" />
						Estado y Mantenimiento
					</h2>
					<dl className="space-y-3 text-sm">
						<div className="flex justify-between">
							<dt className="text-steel dark:text-steel">Estado</dt>
							<dd>
								<StatusBadge status={asset.status} />
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-steel dark:text-steel">Último Mantenimiento</dt>
							<dd className="font-medium text-ink dark:text-white">
								{formatDate(asset.lastMaintenanceAt)}
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-steel dark:text-steel">Próximo Mantenimiento</dt>
							<dd className="font-medium text-ink dark:text-white">
								{formatDate(asset.nextMaintenanceAt)}
							</dd>
						</div>
						{asset.purchaseDate && (
							<div className="flex justify-between">
								<dt className="text-steel dark:text-steel">Fecha de Compra</dt>
								<dd className="font-medium text-ink dark:text-white">
									{formatDate(asset.purchaseDate)}
								</dd>
							</div>
						)}
					</dl>
				</section>

				{/* Metadata */}
				<section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 md:col-span-2">
					<h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink dark:text-white">
						<HardDrive className="size-4" aria-hidden="true" />
						Metadatos
					</h2>
					<dl className="grid gap-3 text-sm sm:grid-cols-3">
						<div>
							<dt className="text-steel dark:text-steel">Creado por</dt>
							<dd className="font-medium text-ink dark:text-white">
								{asset.createdBy?.name ?? "—"}
							</dd>
						</div>
						<div>
							<dt className="text-steel dark:text-steel">Fecha de creación</dt>
							<dd className="font-medium text-ink dark:text-white">
								{formatDate(asset.createdAt)}
							</dd>
						</div>
						<div>
							<dt className="text-steel dark:text-steel">Última actualización</dt>
							<dd className="font-medium text-ink dark:text-white">
								{formatDate(asset.updatedAt)}
							</dd>
						</div>
					</dl>
				</section>
			</div>
		</div>
	);
}

export default function AssetDetailPage() {
	const params = useParams();
	const id = params.id as string;

	return <AssetDetailContent id={id} />;
}
