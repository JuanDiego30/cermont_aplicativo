"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import { cn } from "@/_shared/lib/utils";
import { useCreateOrder } from "..";
import { AssetSection } from "./create/AssetSection";
import { AssignmentSection } from "./create/AssignmentSection";
import { BasicSection } from "./create/BasicSection";
import { CommercialSection } from "./create/CommercialSection";
import { HesSection } from "./create/HesSection";
import { LogisticsSection } from "./create/LogisticsSection";
import { ReferencesSection } from "./create/ReferencesSection";
import { ScheduleSlaSection } from "./create/ScheduleSlaSection";
import { type NewOrderFormData, type NewOrderSubmitData, newOrderFormSchema } from "./create/types";

const FORM_SECTIONS = [
	{ id: "basic", label: "Básica", component: BasicSection },
	{ id: "asset", label: "Activo", component: AssetSection },
	{ id: "schedule", label: "SLA", component: ScheduleSlaSection },
	{ id: "assignment", label: "Equipo", component: AssignmentSection },
	{ id: "hes", label: "HES", component: HesSection },
	{ id: "commercial", label: "Comercial", component: CommercialSection },
	{ id: "logistics", label: "Logística", component: LogisticsSection },
	{ id: "references", label: "Referencias", component: ReferencesSection },
] as const;

export type { NewOrderFormData };
export { newOrderFormSchema };

export function CreateOrderForm() {
	const router = useRouter();
	const mutation = useCreateOrder();
	const [activeSection, setActiveSection] = useState<(typeof FORM_SECTIONS)[number]["id"]>("basic");

	const methods = useForm<NewOrderFormData, unknown, NewOrderSubmitData>({
		resolver: zodResolver(newOrderFormSchema),
		defaultValues: {
			type: "maintenance",
			priority: "medium",
			description: "",
			assetId: "",
			assetName: "",
			location: "",
			kitTemplateId: "",
			assetDetails: {
				warrantyStatus: "na",
			},
			scheduleSla: {
				estimatedDuration: {
					unit: "hours",
				},
				maintenanceWindow: {},
				recurrence: {
					enabled: false,
				},
			},
			resourceAssignment: {
				technicianIds: [],
				requiredCertifications: [],
			},
			hes: {
				requiresPTW: false,
				permitTypes: [],
				requiresAST: false,
				riskLevel: "medium",
				specificRisks: [],
				requiresIsolation: false,
			},
			commercial: {
				isBillable: true,
			},
			logistics: {
				additionalMaterials: [],
				requiresSpecialTransport: false,
			},
			references: {
				attachmentDocumentIds: [],
				prerequisites: [],
			},
		},
	});

	const ActiveComponent =
		FORM_SECTIONS.find((section) => section.id === activeSection)?.component ?? BasicSection;

	const onSubmit: SubmitHandler<NewOrderSubmitData> = (data) => {
		mutation.mutate(data, {
			onSuccess: () => {
				router.push("/orders");
			},
		});
	};

	return (
		<FormProvider {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
				{mutation.isError ? (
					<p
						role="alert"
						className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100"
					>
						{mutation.error?.message ?? "Error al crear la orden"}
					</p>
				) : null}

				<nav aria-label="Secciones de creación de orden" className="overflow-x-auto">
					<ul className="flex min-w-max gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
						{FORM_SECTIONS.map((section) => (
							<li key={section.id}>
								<button
									type="button"
									onClick={() => setActiveSection(section.id)}
									className={cn(
										"min-h-11 rounded-md px-3 text-sm font-medium transition",
										activeSection === section.id
											? "bg-primary-600 text-white"
											: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
									)}
								>
									{section.label}
								</button>
							</li>
						))}
					</ul>
				</nav>

				<ActiveComponent />

				<footer className="mt-2 flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:justify-between">
					<button
						type="button"
						onClick={() => {
							const currentIndex = FORM_SECTIONS.findIndex(
								(section) => section.id === activeSection,
							);
							setActiveSection(FORM_SECTIONS[Math.max(currentIndex - 1, 0)].id);
						}}
						className="min-h-11 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 dark:border-slate-800 dark:text-slate-300"
					>
						Anterior
					</button>
					<div className="flex flex-col gap-3 sm:flex-row">
						<button
							type="button"
							onClick={() => {
								const currentIndex = FORM_SECTIONS.findIndex(
									(section) => section.id === activeSection,
								);
								setActiveSection(
									FORM_SECTIONS[Math.min(currentIndex + 1, FORM_SECTIONS.length - 1)].id,
								);
							}}
							className="min-h-11 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 dark:border-slate-800 dark:text-slate-300"
						>
							Siguiente
						</button>
						<button
							type="submit"
							disabled={methods.formState.isSubmitting || mutation.isPending}
							className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{methods.formState.isSubmitting || mutation.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : null}
							Crear OT
						</button>
					</div>
				</footer>
			</form>
		</FormProvider>
	);
}
