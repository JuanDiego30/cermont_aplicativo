"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Camera, ClipboardCheck, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiClient } from "@/_shared/lib/http/api-client";

interface InspectionPerson {
	_id?: string;
	name?: string;
	email?: string;
	role?: string;
}

interface InspectionItem {
	code: string;
	description: string;
	passed: boolean;
	notes?: string;
	evidence_url?: string;
}

interface InspectionRecord {
	_id: string;
	order_id: string;
	inspection_type: "grinder" | "harness" | "electrical" | "extinguisher" | "vehicle" | "generic";
	status: "pending" | "approved" | "rejected" | "conditional";
	inspector_id: InspectionPerson | string;
	inspection_date: string;
	items: InspectionItem[];
	photos: string[];
	observations?: string;
	next_inspection_date?: string;
	approved_by?: InspectionPerson | string;
	approved_at?: string;
	createdAt: string;
	updatedAt: string;
}

const INSPECTION_TYPE_LABELS: Record<InspectionRecord["inspection_type"], string> = {
	grinder: "Pulidora",
	harness: "Arnés",
	electrical: "Eléctrico",
	extinguisher: "Extintor",
	vehicle: "Vehículo",
	generic: "Genérica",
};

const INSPECTION_STATUS_LABELS: Record<InspectionRecord["status"], string> = {
	pending: "Pendiente",
	approved: "Aprobada",
	rejected: "Rechazada",
	conditional: "Condicional",
};

const STATUS_STYLES: Record<InspectionRecord["status"], string> = {
	pending: "bg-slate-100 text-slate-700 ring-slate-200",
	approved: "bg-emerald-100 text-emerald-700 ring-emerald-200",
	rejected: "bg-rose-100 text-rose-700 ring-rose-200",
	conditional: "bg-amber-100 text-amber-700 ring-amber-200",
};

function formatDate(value?: string): string {
	if (!value) {
		return "—";
	}
	try {
		return new Date(value).toLocaleString("es-CO", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return "—";
	}
}

function getPersonLabel(person?: InspectionPerson | string): string {
	if (!person) {
		return "—";
	}
	if (typeof person === "string") {
		return person;
	}
	return person.name ?? person.email ?? "—";
}

export default function InspectionDetailPage() {
	const params = useParams();
	const id = params.id as string;
	const inspectionId = params.inspectionId as string;

	const {
		data: inspection,
		isLoading,
		error,
	} = useQuery<InspectionRecord | undefined>({
		queryKey: ["inspection", id, inspectionId],
		queryFn: async () => {
			const payload = await apiClient.get<{
				success?: boolean;
				data?: InspectionRecord;
				error?: string;
				message?: string;
			}>(`/orders/${id}/inspections/${inspectionId}`);

			if (!payload?.success) {
				throw new Error(payload?.message || payload?.error || "Error al cargar inspección");
			}

			return payload.data;
		},
		enabled: !!id && !!inspectionId,
	});

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center text-slate-500">
				<Loader2 className="mr-2 h-6 w-6 animate-spin" /> Cargando inspección...
			</div>
		);
	}

	if (error || !inspection) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900/20 dark:bg-red-900/20 dark:text-red-400">
				No se pudo cargar la inspección. {(error as Error)?.message}
			</div>
		);
	}

	const passedItems = inspection.items.filter((item) => item.passed).length;
	const failedItems = inspection.items.length - passedItems;

	return (
		<section className="space-y-6" aria-labelledby="inspection-detail-title">
			<Link
				href={`/orders/${id}`}
				className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
			>
				<ArrowLeft aria-hidden="true" className="h-4 w-4" />
				Volver a la orden
			</Link>

			<header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div className="space-y-2">
						<div className="flex flex-wrap items-center gap-3">
							<h1
								id="inspection-detail-title"
								className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white"
							>
								<ClipboardCheck
									aria-hidden="true"
									className="h-6 w-6 text-blue-600 dark:text-blue-400"
								/>
								Inspección — {INSPECTION_TYPE_LABELS[inspection.inspection_type]}
							</h1>
							<span
								className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[inspection.status]}`}
							>
								{INSPECTION_STATUS_LABELS[inspection.status]}
							</span>
						</div>
						<p className="text-sm text-slate-600 dark:text-slate-400">
							Orden:{" "}
							<span className="font-mono text-slate-900 dark:text-white">
								{inspection.order_id}
							</span>
						</p>
					</div>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
						<MiniStat label="Aprobados" value={passedItems} tone="green" />
						<MiniStat label="Rechazados" value={failedItems} tone="red" />
						<MiniStat label="Ítems" value={inspection.items.length} tone="slate" />
						<MiniStat label="Fotos" value={inspection.photos.length} tone="blue" />
					</div>
				</div>
			</header>

			<section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
					<h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
						Información general
					</h2>
					<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<InfoBlock label="Inspector" value={getPersonLabel(inspection.inspector_id)} />
						<InfoBlock label="Fecha de inspección" value={formatDate(inspection.inspection_date)} />
						<InfoBlock label="Estado" value={INSPECTION_STATUS_LABELS[inspection.status]} />
						<InfoBlock
							label="Próxima inspección"
							value={formatDate(inspection.next_inspection_date)}
						/>
						<InfoBlock label="Aprobada por" value={getPersonLabel(inspection.approved_by)} />
						<InfoBlock label="Aprobada el" value={formatDate(inspection.approved_at)} />
					</dl>
				</article>

				<article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
					<h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
						Observaciones
					</h2>
					{inspection.observations ? (
						<p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
							{inspection.observations}
						</p>
					) : (
						<p className="text-sm text-slate-500 dark:text-slate-400">
							Sin observaciones registradas.
						</p>
					)}
				</article>
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
					Ítems de inspección
				</h2>
				{inspection.items.length === 0 ? (
					<p className="text-sm text-slate-500 dark:text-slate-400">No hay ítems registrados.</p>
				) : (
					<ul className="space-y-3">
						{inspection.items.map((item) => (
							<li
								key={item.code}
								className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="space-y-1">
										<p className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
											{item.code}
										</p>
										<h3 className="text-sm font-medium text-slate-900 dark:text-white">
											{item.description}
										</h3>
										{item.notes ? (
											<p className="text-xs text-slate-500 dark:text-slate-400">{item.notes}</p>
										) : null}
										{item.evidence_url ? (
											<a
												href={item.evidence_url}
												target="_blank"
												rel="noreferrer"
												className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
											>
												Ver evidencia
											</a>
										) : null}
									</div>
									<span
										className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
											item.passed
												? "bg-emerald-100 text-emerald-700 ring-emerald-200"
												: "bg-rose-100 text-rose-700 ring-rose-200"
										}`}
									>
										{item.passed ? "Aprobado" : "Rechazado"}
									</span>
								</div>
							</li>
						))}
					</ul>
				)}
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<div className="mb-4 flex items-center gap-2">
					<Camera aria-hidden="true" className="h-5 w-5 text-slate-500 dark:text-slate-400" />
					<h2 className="text-base font-semibold text-slate-900 dark:text-white">Fotos</h2>
				</div>

				{inspection.photos.length === 0 ? (
					<p className="text-sm text-slate-500 dark:text-slate-400">No hay fotos adjuntas.</p>
				) : (
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
						{inspection.photos.map((photoUrl) => (
							<a
								key={photoUrl}
								href={photoUrl}
								target="_blank"
								rel="noreferrer"
								className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
							>
								<div className="relative h-36 w-full">
									<Image
										src={photoUrl}
										alt="Foto de inspección"
										fill
										unoptimized
										className="object-cover"
										sizes="(max-width: 640px) 50vw, 25vw"
									/>
								</div>
							</a>
						))}
					</div>
				)}
			</section>
		</section>
	);
}

function InfoBlock({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
			<dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</dt>
			<dd className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{value}</dd>
		</div>
	);
}

function MiniStat({
	label,
	value,
	tone,
}: {
	label: string;
	value: number;
	tone: "green" | "red" | "blue" | "slate";
}) {
	const tones: Record<typeof tone, string> = {
		green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
		red: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
		blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
		slate: "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
	};

	return (
		<div className={`rounded-xl px-4 py-3 text-center ${tones[tone]}`}>
			<p className="text-2xl font-bold">{value}</p>
			<p className="text-xs font-medium uppercase tracking-wide">{label}</p>
		</div>
	);
}
