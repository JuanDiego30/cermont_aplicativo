import { Mail, MapPin, PhoneCall } from "lucide-react";
import Link from "next/link";
import { BadgePill } from "@/core/ui/BadgePill";
import { Button } from "@/core/ui/Button";
import { Logo } from "@/core/ui/Logo";
import {
	CORPORATE_ADDRESS_ARAUCA,
	CORPORATE_ADDRESS_BOGOTA,
	CORPORATE_CELULAR,
	CORPORATE_EMAIL,
	CORPORATE_MAILTO,
	CORPORATE_NAME,
	CORPORATE_NIT,
	CORPORATE_PHONE_ARAUCA,
	CORPORATE_PHONE_BOGOTA,
	NAV_ITEMS,
} from "../landing-constants";
import { LANDING_RESOURCES } from "../landing-data";

export function LandingFooter() {
	return (
		<footer className="border-t border-white/10 bg-cermont-bg-deep">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
				<div className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr_0.95fr_0.95fr]">
					<div>
						<Logo href="/" className="gap-3" size="md" wordmarkClassName="text-white" />
						<p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
							{CORPORATE_NAME}. presta servicios de construccion, electricidad, refrigeracion,
							telecomunicaciones y montajes con disciplina, seguridad y trazabilidad. NIT{" "}
							{CORPORATE_NIT}.
						</p>

						<div className="mt-5 flex flex-wrap gap-2">
							{["Calidad", "Seguridad", "Trazabilidad"].map((item) => (
								<BadgePill
									key={item}
									className="border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200"
									dotClassName="bg-cermont-blue-light"
									ariaLabel={item}
								>
									{item}
								</BadgePill>
							))}
						</div>
					</div>

					<nav aria-label="Navegacion de empresa">
						<h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-300">
							Empresa
						</h3>
						<ul className="space-y-2.5">
							{NAV_ITEMS.map(({ label, href }) => (
								<li key={label}>
									<a
										href={href}
										className="text-sm text-slate-500 transition-colors hover:text-white"
									>
										{label}
									</a>
								</li>
							))}
							<li>
								<Link
									href="/login"
									className="text-sm text-slate-500 transition-colors hover:text-white"
								>
									Acceso privado
								</Link>
							</li>
						</ul>
					</nav>

					<nav aria-label="Documentos y descargas">
						<h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-300">
							Documentos
						</h3>
						<ul className="space-y-2.5">
							{LANDING_RESOURCES.map(({ title, href }) => (
								<li key={title}>
									<a
										href={href}
										download
										className="text-sm text-slate-500 transition-colors hover:text-white"
									>
										{title}
									</a>
								</li>
							))}
						</ul>
					</nav>

					<div>
						<h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-300">
							Contacto
						</h3>
						<div className="space-y-2.5 text-sm text-slate-500">
							<a
								href={CORPORATE_MAILTO}
								className="flex items-center gap-2 transition-colors hover:text-white"
							>
								<Mail className="h-3.5 w-3.5" aria-hidden="true" />
								{CORPORATE_EMAIL}
							</a>
							<div className="flex items-start gap-2">
								<MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
								<div>
									<p>{CORPORATE_ADDRESS_ARAUCA}</p>
									<p className="mt-1">{CORPORATE_ADDRESS_BOGOTA}</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
								<span>
									{CORPORATE_PHONE_ARAUCA} / {CORPORATE_PHONE_BOGOTA}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
								<span>{CORPORATE_CELULAR}</span>
							</div>
						</div>

						<div className="mt-6">
							<Button asChild className="rounded-full px-5">
								<Link href="/login">Ingresar al sistema</Link>
							</Button>
						</div>
					</div>
				</div>

				<div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
					<p>
						&copy; {new Date().getFullYear()} {CORPORATE_NAME}. Todos los derechos reservados.
					</p>
					<p>NIT {CORPORATE_NIT}</p>
				</div>
			</div>
		</footer>
	);
}
