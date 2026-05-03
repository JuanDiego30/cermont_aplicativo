"use client";

import { ArrowLeft, Layers3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateMaintenanceKit } from "@/maintenance/queries";
import { MaintenanceKitForm } from "@/maintenance/ui/MaintenanceKitForm";

export default function NewMaintenanceKitPage() {
	const router = useRouter();
	const createMaintenanceKit = useCreateMaintenanceKit();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSubmit = async (payload: Parameters<typeof createMaintenanceKit.mutateAsync>[0]) => {
		setErrorMessage(null);

		try {
			const kit = await createMaintenanceKit.mutateAsync(payload);
			router.push(`/maintenance/${kit._id}`);
			router.refresh();
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Ocurrió un error inesperado al crear el kit.",
			);
		}
	};

	return (
		<section className="mx-auto max-w-6xl space-y-6" aria-labelledby="new-maintenance-kit-title">
			<header className="space-y-4 rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
				<div className="flex items-center gap-3">
					<Link
						href="/maintenance"
						className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
					>
						<ArrowLeft aria-hidden="true" className="h-4 w-4" />
						Volver al catálogo
					</Link>
				</div>

				<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div className="max-w-3xl space-y-3">
						<span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
							<Layers3 className="h-3.5 w-3.5" />
							Nuevo kit típico
						</span>
						<div>
							<h1
								id="new-maintenance-kit-title"
								className="text-3xl font-black tracking-tight text-slate-900 dark:text-white"
							>
								Crear kit reutilizable
							</h1>
							<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
								Define nombre, actividad, herramientas y equipos para generar una plantilla real que
								se pueda reutilizar en órdenes y planeación.
							</p>
						</div>
					</div>

					<div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
						El kit se creará activo por defecto.
					</div>
				</div>
			</header>

			<div className="rounded-[32px] border border-slate-200 bg-white/95 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/95 sm:p-6">
				<MaintenanceKitForm
					mode="create"
					submitLabel="Crear kit"
					cancelHref="/maintenance"
					onSubmit={handleSubmit}
					errorMessage={errorMessage}
				/>
			</div>
		</section>
	);
}
