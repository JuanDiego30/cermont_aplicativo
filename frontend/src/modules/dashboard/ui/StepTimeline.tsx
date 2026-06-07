"use client";

import { ArrowRight, Circle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StepItem {
	step: number;
	label: string;
	description: string;
	category: "comercial" | "operativo" | "cierre" | "financiero";
	activeCount: number;
}

const STEPS: StepItem[] = [
	{
		step: 1,
		label: "Solicitud de Trabajo",
		description: "Work Request formal del clien" + "te.",
		category: "comercial",
		activeCount: 3,
	},
	{
		step: 2,
		label: "Visita Téc" + "nica",
		description: "Mediciones y registro fotográfico en sitio.",
		category: "operativo",
		activeCount: 1,
	},
	{
		step: 3,
		label: "Propu" + "esta Económica",
		description: "Análisis de cos" + "tos y oferta comercial.",
		category: "comercial",
		activeCount: 2,
	},
	{
		step: 4,
		label: "Aprobación PO",
		description: "Or" + "den de compra aprobada por el clien" + "te.",
		category: "comercial",
		activeCount: 4,
	},
	{
		step: 5,
		label: "Planeación",
		description: "Asignación de personal, herramientas y kits.",
		category: "operativo",
		activeCount: 2,
	},
	{
		step: 6,
		label: "Ejecu" + "ción de Campo",
		description: "Permisos, AST, checklists y eviden" + "cias fotográficas.",
		category: "operativo",
		activeCount: 5,
	},
	{
		step: 7,
		label: "Informe Téc" + "nico",
		description: "Documentación de ejecu" + "ción y recursos usados.",
		category: "operativo",
		activeCount: 1,
	},
	{
		step: 8,
		label: "Acta de Entrega",
		description: "Generación de delivery records y firmas.",
		category: "cierre",
		activeCount: 2,
	},
	{
		step: 9,
		label: "Acta Firmada",
		description: "Aceptación formal de entrega por el clien" + "te.",
		category: "cierre",
		activeCount: 1,
	},
	{
		step: 10,
		label: "SES Ariba",
		description: "Registro de Service Entry Sheet en SAP.",
		category: "cierre",
		activeCount: 3,
	},
	{
		step: 11,
		label: "SES Aprobada",
		description: "Vali" + "dación por interventoría y aprobadores.",
		category: "cierre",
		activeCount: 2,
	},
	{
		step: 12,
		label: "Facturación",
		description: "Emisión de factura electrónica con soportes.",
		category: "financiero",
		activeCount: 1,
	},
	{
		step: 13,
		label: "Aprobación Factura",
		description: "Revisión fiscal y contable del clien" + "te.",
		category: "financiero",
		activeCount: 2,
	},
	{
		step: 14,
		label: "Pago y Cierre",
		description: "Recibo de fondos y cierre del ciclo.",
		category: "financiero",
		activeCount: 0,
	},
];

const CATEGORY_COLORS = {
	comercial: "border-sky-500/30 text-sky-600 bg-sky-500/5",
	operativo: "border-emerald-500/30 text-emerald-600 bg-emerald-500/5",
	cierre: "border-amber-500/30 text-amber-600 bg-amber-500/5",
	financiero: "border-indigo-500/30 text-indigo-600 bg-indigo-500/5",
};

export function StepTimeline() {
	const [selectedCategory, setSelectedCategory] = useState<string>("");

	const filteredSteps = selectedCategory
		? STEPS.filter((s) => s.category === selectedCategory)
		: STEPS;

	return (
		<div className="rounded-[1.5rem] border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-sm">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-default)] pb-4 mb-6">
				<div>
					<h3 className="text-lg font-bold text-[var(--text-primary)]">
						Flujo Operativo de 14 Pasos
					</h3>
					<p className="text-xs text-[var(--text-secondary)] mt-0.5">
						Ciclo de vida completo desde la solicitud hasta el pago y cierre definitivo.
					</p>
				</div>
				<div className="flex flex-wrap gap-1.5">
					<button
						type="button"
						onClick={() => setSelectedCategory("")}
						className={cn(
							"px-3 py-1 rounded-full text-xs font-semibold transition-all border",
							!selectedCategory
								? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"
								: "bg-[var(--surface-secondary)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-primary)]",
						)}
					>
						Todos
					</button>
					{(["comercial", "operativo", "cierre", "financiero"] as const).map((cat) => (
						<button
							key={cat}
							type="button"
							onClick={() => setSelectedCategory(cat)}
							className={cn(
								"px-3 py-1 rounded-full text-xs font-semibold transition-all border capitalize",
								selectedCategory === cat
									? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"
									: "bg-[var(--surface-secondary)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-primary)]",
							)}
						>
							{cat}
						</button>
					))}
				</div>
			</div>

			{/* Horizontal / Grid scrolling timeline */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 xl:grid-cols-7 overflow-x-auto pb-2 pr-1">
				{filteredSteps.map((item) => (
					<div
						key={item.step}
						className={cn(
							"flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
							CATEGORY_COLORS[item.category],
							item.activeCount > 0 ? "ring-1 ring-[var(--color-brand)]/20" : "",
						)}
					>
						<div>
							<div className="flex items-center justify-between">
								<span className="text-xs font-bold font-mono">
									Paso {String(item.step).padStart(2, "0")}
								</span>
								{item.activeCount > 0 ? (
									<span className="inline-flex size-5 items-center justify-center rounded-full bg-[var(--color-brand)] text-[10px] font-bold text-white font-mono animate-pulse">
										{item.activeCount}
									</span>
								) : (
									<Circle className="size-3.5 opacity-40" />
								)}
							</div>
							<h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight mt-2.5">
								{item.label}
							</h4>
							<p className="text-[10px] text-[var(--text-secondary)] leading-normal mt-1">
								{item.description}
							</p>
						</div>

						<div className="mt-4 flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider opacity-85">
							<span className="font-mono">{item.category}</span>
							{item.activeCount > 0 && (
								<span className="flex items-center gap-0.5 text-[var(--color-brand)] font-bold">
									Activo <ArrowRight className="size-2.5" />
								</span>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
