"use client";

import { ArrowLeft, Layers3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateMaintenanceKit } from "@/modules/maintenance/queries";
import { MaintenanceKitForm } from "@/modules/maintenance/ui/MaintenanceKitForm";

export default function NewMaintenanceKitPage() {
	const { push, refresh } = useRouter();
	const createMaintenanceKit = useCreateMaintenanceKit();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSubmit = async (payload: Parameters<typeof createMaintenanceKit.mutateAsync>[0]) => {
		setErrorMessage(null);

		try {
			const kit = await createMaintenanceKit.mutateAsync(payload);
			push(`/maintenance/${kit._id}`);
			refresh();
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Ocurrió un error inesperado al crear el kit.",
			);
		}
	};

	return (
		<section className="mx-auto max-w-6xl space-y-6" aria-labelledby="new-maintenance-kit-title">
			<header className="space-y-4 rounded-[28px] border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
				<div className="flex items-center gap-3">
					<Link
						href="/maintenance"
						className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
					>
						<ArrowLeft aria-hidden="true" className="size-4" />
						Volver al catálogo
					</Link>
				</div>

				<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div className="max-w-3xl space-y-3">
						<span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
							<Layers3 className="size-3.5" />
							Nuevo kit típico
						</span>
						<div>
							<h1
								id="new-maintenance-kit-title"
								className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white"
							>
								Crear kit reutilizable
							</h1>
							<p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
								Define nombre, actividad, herramientas y equipos para generar una plantilla real que
								se pueda reutilizar en órdenes y planeación.
							</p>
						</div>
					</div>

					<div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
						El kit se creará activo por defecto.
					</div>
				</div>
			</header>

			<div className="rounded-[32px] border border-zinc-200 bg-white/95 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/95 sm:p-6">
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
