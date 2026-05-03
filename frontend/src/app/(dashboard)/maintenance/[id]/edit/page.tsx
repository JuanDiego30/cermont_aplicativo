"use client";

import { ArrowLeft, Layers3 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMaintenanceKit, useUpdateMaintenanceKit } from "@/maintenance/queries";
import { MaintenanceKitForm } from "@/maintenance/ui/MaintenanceKitForm";

export default function EditMaintenanceKitPage() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as string;

	const { data: kit, isLoading, error } = useMaintenanceKit(id);
	const updateMaintenanceKit = useUpdateMaintenanceKit(id);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSubmit = async (payload: Parameters<typeof updateMaintenanceKit.mutateAsync>[0]) => {
		setErrorMessage(null);

		try {
			await updateMaintenanceKit.mutateAsync(payload);
			router.push(`/maintenance/${id}`);
			router.refresh();
		} catch (submitError) {
			setErrorMessage(
				submitError instanceof Error
					? submitError.message
					: "Ocurrió un error inesperado al actualizar el kit.",
			);
		}
	};

	const submittedError =
		errorMessage ||
		(updateMaintenanceKit.error instanceof Error ? updateMaintenanceKit.error.message : null);

	if (isLoading) {
		return (
			<section className="flex h-64 items-center justify-center rounded-[28px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
				<span className="text-slate-500 dark:text-slate-400">Cargando kit...</span>
			</section>
		);
	}

	if (error || !kit) {
		return (
			<section className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
				No se pudo cargar el kit. {(error as Error)?.message}
			</section>
		);
	}

	return (
		<section className="mx-auto max-w-6xl space-y-6" aria-labelledby="edit-maintenance-kit-title">
			<header className="space-y-4 rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
				<div className="flex items-center gap-3">
					<Link
						href={`/maintenance/${id}`}
						className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
					>
						<ArrowLeft aria-hidden="true" className="h-4 w-4" />
						Volver al detalle
					</Link>
				</div>

				<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div className="max-w-3xl space-y-3">
						<span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
							<Layers3 className="h-3.5 w-3.5" />
							Editar kit típico
						</span>
						<div>
							<h1
								id="edit-maintenance-kit-title"
								className="text-3xl font-black tracking-tight text-slate-900 dark:text-white"
							>
								{kit.name}
							</h1>
							<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
								Ajusta herramientas, equipos, actividad o estado del kit sin salir del contrato real
								del backend.
							</p>
						</div>
					</div>

					<div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
						Última actualización:{" "}
						{kit.updatedAt ? new Date(kit.updatedAt).toLocaleString("es-CO") : "—"}
					</div>
				</div>
			</header>

			<div className="rounded-[32px] border border-slate-200 bg-white/95 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/95 sm:p-6">
				<MaintenanceKitForm
					mode="edit"
					initialKit={kit}
					submitLabel="Guardar cambios"
					cancelHref={`/maintenance/${id}`}
					onSubmit={handleSubmit}
					errorMessage={submittedError}
				/>
			</div>
		</section>
	);
}
