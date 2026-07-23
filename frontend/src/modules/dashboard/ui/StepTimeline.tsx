"use client";

import type { CermontOperationalStepCode } from "@cermont/shared-types";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type StepCategory = "comercial" | "operativo" | "cierre" | "financiero";

interface StepItem {
	step: number;
	code: CermontOperationalStepCode;
	label: string;
	description: string;
	category: StepCategory;
}

const STEPS: StepItem[] = [
	{
		step: 1,
		code: "step_01_work_request",
		label: "Solicitud de Trabajo",
		description: "Solicitud formal del cliente.",
		category: "comercial",
	},
	{
		step: 2,
		code: "step_02_site_visit",
		label: "Visita Técnica",
		description: "Mediciones y registro fotográfico en sitio.",
		category: "operativo",
	},
	{
		step: 3,
		code: "step_03_proposal",
		label: "Propuesta Económica",
		description: "Análisis de costos y oferta comercial.",
		category: "comercial",
	},
	{
		step: 4,
		code: "step_04_purchase_order",
		label: "Aprobación PO",
		description: "Orden de compra aprobada por el cliente.",
		category: "comercial",
	},
	{
		step: 5,
		code: "step_05_planning",
		label: "Planeación",
		description: "Asignación de personal, herramientas y kits.",
		category: "operativo",
	},
	{
		step: 6,
		code: "step_06_execution",
		label: "Ejecución de Campo",
		description: "Permisos, AST, checklists y evidencias fotográficas.",
		category: "operativo",
	},
	{
		step: 7,
		code: "step_07_evidence",
		label: "Evidencias",
		description: "Registro fotográfico y soportes de la ejecución.",
		category: "operativo",
	},
	{
		step: 8,
		code: "step_08_technical_report",
		label: "Informe Técnico",
		description: "Documentación de ejecución y recursos usados.",
		category: "operativo",
	},
	{
		step: 9,
		code: "step_09_delivery_record",
		label: "Acta de Entrega",
		description: "Generación del acta y sus soportes.",
		category: "cierre",
	},
	{
		step: 10,
		code: "step_10_client_signature",
		label: "Firma del Cliente",
		description: "Aceptación formal de la entrega por el cliente.",
		category: "cierre",
	},
	{
		step: 11,
		code: "step_11_ses",
		label: "SES / Ariba",
		description: "Registro, envío y aprobación de la hoja de entrada de servicio.",
		category: "cierre",
	},
	{
		step: 12,
		code: "step_12_invoice",
		label: "Facturación",
		description: "Emisión de factura electrónica con soportes.",
		category: "financiero",
	},
	{
		step: 13,
		code: "step_13_invoice_approval",
		label: "Aprobación Factura",
		description: "Revisión fiscal y contable del cliente.",
		category: "financiero",
	},
	{
		step: 14,
		code: "step_14_payment",
		label: "Pago y Cierre",
		description: "Recibo de fondos y cierre del ciclo.",
		category: "financiero",
	},
];

/**
 * Color-as-signal: brand colors used for borders, text, and ring accents only.
 * Card backgrounds are always neutral (bg-canvas) per DESIGN.md rules.
 * Category is signaled via the left- border accent and category label color.
 */
const CATEGORY_COLORS: Record<StepCategory, string> = {
	comercial: "border-brand-green/30 text-brand-green bg-canvas",
	operativo: "border-brand-annotate/30 text-brand-annotate bg-canvas",
	cierre: "border-brand-warn/30 text-brand-warn bg-canvas",
	financiero: "border-brand-tag/30 text-brand-tag bg-canvas",
};

interface StepTimelineProps {
	stepDistribution?: Array<{ stepCode: string; count: number }>;
}

export function StepTimeline({ stepDistribution = [] }: StepTimelineProps) {
	const [selectedCategory, setSelectedCategory] = useState<StepCategory | "all">("all");
	const countByStep = new Map(stepDistribution.map((item) => [item.stepCode, item.count]));
	const filteredSteps =
		selectedCategory === "all" ? STEPS : STEPS.filter((step) => step.category === selectedCategory);

	return (
		<section className="rounded-[var(--radius-xl)] border border-hairline bg-canvas p-4 shadow-[var(--shadow-1)] sm:p-6">
			<div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="text-lg font-semibold text-ink">Flujo Operativo de 14 Pasos</h3>
					<p className="mt-1 text-sm text-charcoal">Casos activos según el paso real del flujo.</p>
				</div>
				<fieldset className="flex flex-wrap gap-2">
					<legend className="sr-only">Filtrar pasos por categoría</legend>
					<CategoryButton
						active={selectedCategory === "all"}
						label="Todos"
						onClick={() => setSelectedCategory("all")}
					/>
					{(["comercial", "operativo", "cierre", "financiero"] as const).map((category) => (
						<CategoryButton
							key={category}
							active={selectedCategory === category}
							label={category}
							onClick={() => setSelectedCategory(category)}
						/>
					))}
				</fieldset>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7">
				{filteredSteps.map((item) => {
					const activeCount = countByStep.get(item.code) ?? 0;

					return (
						<article
							key={item.code}
							className={cn(
								"flex min-h-44 flex-col justify-between rounded-2xl border-2 p-4 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md",
								CATEGORY_COLORS[item.category],
								activeCount > 0 ? "ring-1 ring-brand-green/20" : "border-dashed opacity-60",
							)}
						>
							<div>
								<div className="flex items-center justify-between">
									<span className="font-mono text-xs font-bold text-ink">
										Paso {String(item.step).padStart(2, "0")}
									</span>
									{activeCount > 0 ? (
										<span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full border border-brand-green bg-canvas px-1 font-mono text-[10px] font-bold text-brand-green">
											<span aria-hidden="true">{activeCount}</span>
											<span className="sr-only">
												{activeCount} casos activos en {item.label}
											</span>
										</span>
									) : (
										<span className="font-mono text-xs text-steel" aria-hidden="true">—</span>
									)}
								</div>
								<h4 className="mt-3 text-xs font-bold leading-tight text-ink">{item.label}</h4>
								<p className="mt-1 text-[11px] leading-normal text-charcoal">{item.description}</p>
							</div>

							<div className="mt-4 flex items-center justify-between font-mono text-[9px] font-semibold uppercase tracking-wider opacity-85 text-steel">
								<span>{item.category}</span>
								{activeCount > 0 ? (
									<span className="flex items-center gap-0.5 font-bold text-brand-green">
										Activo <ArrowRight className="size-2.5" aria-hidden="true" />
									</span>
								) : null}
							</div>
						</article>
					);
				})}
			</div>
		</section>
	);
}

function CategoryButton({
	active,
	label,
	onClick,
}: {
	active: boolean;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				"min-h-11 rounded-full border-2 px-4 py-2 text-xs font-semibold capitalize transition-colors",
				active
					? "border-brand-green bg-canvas text-brand-green"
					: "border-hairline bg-surface text-charcoal hover:bg-canvas",
			)}
		>
			{label}
		</button>
	);
}
