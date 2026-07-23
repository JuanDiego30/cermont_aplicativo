import { ArrowRight, LogIn, Mail, Scale } from "lucide-react";
import type { LandingResource } from "../../landing-data";

const badgeClasses: Record<string, string> = {
	Contacto: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
	Aplicación: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
	Legal: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const typeIcons: Record<string, typeof Mail> = {
	Contacto: Mail,
	Aplicación: LogIn,
	Legal: Scale,
};

const iconClasses: Record<string, string> = {
	Contacto: "text-brand-green",
	Aplicación: "text-brand-blue",
	Legal: "text-brand-annotate",
};

export function ResourceCard({ title, description, href, meta }: LandingResource) {
	const BadgeIcon = typeIcons[meta] ?? null;
	return (
		<article className="group rounded-xl border border-hairline bg-canvas p-6 shadow-2 transition-transform duration-200 hover:-translate-y-0.5">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					{BadgeIcon && <BadgeIcon className={`size-5 ${iconClasses[meta] ?? "text-brand-green"}`} aria-hidden="true" />}
					<div>
						<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate">{meta}</p>
						<h3 className="mt-2 text-xl font-semibold text-ink">{title}</h3>
					</div>
				</div>
				<span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${badgeClasses[meta] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"}`}>
					{meta}
				</span>
			</div>

			<p className="mt-4 text-sm leading-6 text-charcoal">{description}</p>

			<div className="mt-5">
				<a
					href={href}
					className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-green transition-colors hover:text-brand-green-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/50 motion-reduce:transition-none"
				>
					Abrir recurso
					<ArrowRight className="size-4 text-brand-green" aria-hidden="true" />
				</a>
			</div>
		</article>
	);
}
