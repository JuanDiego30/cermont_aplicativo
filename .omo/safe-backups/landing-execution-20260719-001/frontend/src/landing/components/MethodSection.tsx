import { BadgePill } from "@/core/ui/BadgePill";
import { ClipboardList, FileText, Search, ShieldCheck, Wrench } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
	{
		step: 1,
		icon: Search,
		title: "Solicitud y diagnóstico",
		desc: "Recibimos el requerimiento, definimos alcance y, si aplica, realizamos visita técnica.",
	},
	{
		step: 2,
		icon: ClipboardList,
		title: "Planeación con seguridad",
		desc: "Asignamos recursos, verificamos certificaciones y documentación HES antes de iniciar.",
	},
	{
		step: 3,
		icon: Wrench,
		title: "Ejecución documentada",
		desc: "Ejecutamos con checklist, AST y registro fotográfico. Operación offline en campo.",
	},
	{
		step: 4,
		icon: FileText,
		title: "Informe y acta",
		desc: "Generamos informe técnico y acta de entrega a partir de los datos de ejecución.",
	},
	{
		step: 5,
		icon: ShieldCheck,
		title: "Cierre administrativo",
		desc: "Soportamos SES, facturación y registro de pago para el cierre completo del servicio.",
	},
] as const;

export function MethodSection() {
	return (
		<section
			id="metodo"
			data-landing-section
			aria-labelledby="method-heading"
			className="bg-canvas py-16 sm:py-20 lg:py-24 scroll-mt-28"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<SectionHeading
					eyebrow="Método"
					title="Cinco etapas, una sola disciplina operativa."
					description="Cada servicio sigue una secuencia controlada: desde la solicitud hasta el cierre, con trazabilidad documental en cada paso."
				/>

				<div className="relative mt-10">
					<div className="grid gap-6 lg:grid-cols-5 lg:gap-4">
						{STEPS.map((s, i) => {
							const Icon = s.icon;
							return (
								<div key={s.step} className="relative flex flex-col items-center text-center">
									<div className="flex size-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
										<Icon className="size-6" aria-hidden="true" />
									</div>
									<BadgePill
										className="mt-3 bg-surface px-3 py-1 font-mono text-[11px]"
										dotClassName="bg-brand-annotate"
										ariaLabel={`Paso ${s.step}`}
									>
										Paso {s.step}
									</BadgePill>
									<h3 className="mt-3 text-sm font-semibold text-ink">{s.title}</h3>
									<p className="mt-2 text-xs leading-relaxed text-charcoal">{s.desc}</p>
									{i < STEPS.length - 1 && (
										<div
											className="mt-4 hidden h-6 w-0.5 bg-hairline lg:block"
											aria-hidden="true"
										/>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
