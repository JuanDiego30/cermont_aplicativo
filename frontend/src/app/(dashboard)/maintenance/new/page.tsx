"use client";

import { ArrowLeft, Layers3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { KIT_ACTIVITY_OPTIONS } from "@/modules/kits/constants";
import { useCreateKit } from "@/modules/kits/hooks/useKits";
import { KitWizardForm } from "@/modules/kits/ui/KitWizardForm";

export default function NewMaintenanceKitPage() {
	const { push } = useRouter();
	const createKit = useCreateKit();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSubmit = async (payload: Record<string, unknown>) => {
		setErrorMessage(null);
		try {
			const kit = await createKit.mutateAsync(
				payload as Parameters<typeof createKit.mutateAsync>[0],
			);
			toast.success("Kit creado correctamente.");
			push(`/maintenance/${kit._id}`);
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Ocurrió un error inesperado al crear el kit.",
			);
		}
	};

	return (
		<section className="mx-auto max-w-6xl space-y-6" aria-labelledby="new-maintenance-kit-title">
			<header className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-6 shadow-sm">
				<div className="flex items-center gap-3">
					<Link
						href="/maintenance"
						className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
					>
						<ArrowLeft aria-hidden="true" className="size-4" />
						Volver al catálogo
					</Link>
				</div>

				<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div className="max-w-3xl space-y-3">
						<span className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--border-medium)] bg-[var(--surface-secondary)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
							<Layers3 className="size-3.5" />
							Nuevo kit reutilizable
						</span>
						<div>
							<h1
								id="new-maintenance-kit-title"
								className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]"
							>
								Crear kit reutilizable
							</h1>
							<p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
								Configura herramientas, materiales, EPP y documentos para una planeación más rápida
								y sin olvidos en campo.
							</p>
						</div>
					</div>
				</div>
			</header>

			<div className="rounded-[var(--radius-xl)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5 shadow-sm sm:p-6">
				<KitWizardForm
					onSubmit={handleSubmit}
					errorMessage={errorMessage}
					activityOptions={KIT_ACTIVITY_OPTIONS}
				/>
			</div>
		</section>
	);
}
