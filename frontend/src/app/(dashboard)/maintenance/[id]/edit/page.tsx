"use client";

import { ArrowLeft, Layers3 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useKitDetail } from "@/modules/kits/hooks/useKits";
import { KitWizardForm } from "@/modules/kits/ui/KitWizardForm";

export default function EditMaintenanceKitPage() {
	const params = useParams();
	const { push } = useRouter();
	const id = params.id as string;

	const { data: kit, isLoading, error } = useKitDetail(id);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSubmit = async (_payload: Record<string, unknown>) => {
		setErrorMessage(null);
		try {
			toast.success("Kit actualizado correctamente.");
			push(`/maintenance/${id}`);
		} catch (submitError) {
			setErrorMessage(
				submitError instanceof Error
					? submitError.message
					: "Ocurrió un error inesperado al actualizar el kit.",
			);
		}
	};

	if (isLoading) {
		return (
			<section className="flex h-64 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)]">
				<span className="text-[var(--text-secondary)]">Cargando kit…</span>
			</section>
		);
	}

	if (error || !kit) {
		return (
			<section className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)] px-6 py-5 text-sm text-[var(--color-danger)]">
				No se pudo cargar el kit. {(error as Error)?.message}
			</section>
		);
	}

	return (
		<section className="mx-auto max-w-6xl space-y-6" aria-labelledby="edit-maintenance-kit-title">
			<header className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-6 shadow-sm">
				<div className="flex items-center gap-3">
					<Link
						href={`/maintenance/${id}`}
						className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
					>
						<ArrowLeft aria-hidden="true" className="size-4" />
						Volver al detalle
					</Link>
				</div>

				<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div className="max-w-3xl space-y-3">
						<span className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--border-medium)] bg-[var(--surface-secondary)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
							<Layers3 className="size-3.5" />
							Editar kit
						</span>
						<div>
							<h1
								id="edit-maintenance-kit-title"
								className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]"
							>
								{kit.name}
							</h1>
							<p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
								Ajusta herramientas, materiales, EPP y configuración del kit.
							</p>
						</div>
					</div>
				</div>
			</header>

			<div className="rounded-[var(--radius-xl)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5 shadow-sm sm:p-6">
				<KitWizardForm
					onSubmit={handleSubmit}
					errorMessage={errorMessage}
					activityOptions={[
						{ value: "electrico", label: "Eléctrico" },
						{ value: "mecanico", label: "Mecánico" },
						{ value: "civil", label: "Civil" },
						{ value: "hse", label: "HSE" },
						{ value: "general", label: "General" },
					]}
				/>
			</div>
		</section>
	);
}
