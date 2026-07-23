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
	CORPORATE_PHONE_ARAUCA_TEL,
	CORPORATE_PHONE_BOGOTA,
	CORPORATE_PHONE_BOGOTA_TEL,
	CORPORATE_CELULAR_TEL,
	NAV_ITEMS,
} from "../landing-constants";
import { LANDING_RESOURCES } from "../landing-data";
import { APP_ROUTES } from "@/lib/routes";

export function LandingFooter() {
	return (
		<footer className="border-t border-hairline-dark bg-canvas-dark">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
				<div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr_1.2fr]">
					<div>
						<Logo href="/" className="gap-3" size="md" wordmarkClassName="text-on-dark" />
						<p className="mt-4 max-w-md text-sm leading-6 text-stone">
							{CORPORATE_NAME} — Servicios de ingeniería eléctrica, mantenimiento, montajes,
							construcción civil y telecomunicaciones.
						</p>

						<div className="mt-5 flex flex-wrap gap-2">
							{["Calidad", "Seguridad", "Trazabilidad"].map((item) => (
								<BadgePill
									key={item}
									className="border-hairline-dark bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate"
									dotClassName="bg-brand-annotate"
									ariaLabel={item}
								>
									{item}
								</BadgePill>
							))}
						</div>
					</div>

						<nav aria-label="Navegación">
						<h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-text">
							Navegación
						</h3>
						<ul className="space-y-2.5">
							{NAV_ITEMS.map(({ label, href }) => (
								<li key={label}>
									<a href={href} className="text-sm text-steel transition-colors hover:text-white">
										{label}
									</a>
								</li>
							))}
							<li>
								<Link
									href={APP_ROUTES.login}
									className="text-sm text-steel transition-colors hover:text-white"
								>
									Acceso privado
								</Link>
							</li>
							<li>
								<a href={LANDING_RESOURCES[2].href} className="text-sm text-steel transition-colors hover:text-white">
									Privacidad
								</a>
							</li>
							<li>
								<a href={LANDING_RESOURCES[3].href} className="text-sm text-steel transition-colors hover:text-white">
									Consentimiento
								</a>
							</li>
						</ul>
					</nav>

					<div>
						<h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-text">
							Contacto
						</h3>
						<address className="space-y-2.5 text-sm not-italic text-steel">
							<a
								href={CORPORATE_MAILTO}
								className="flex items-center gap-2 transition-colors hover:text-white"
							>
								<Mail className="size-3.5" aria-hidden="true" />
								{CORPORATE_EMAIL}
							</a>
							<div className="flex items-start gap-2">
								<MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
								<div>
									<p>{CORPORATE_ADDRESS_ARAUCA}</p>
									<p className="mt-1">{CORPORATE_ADDRESS_BOGOTA}</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<PhoneCall className="size-3.5" aria-hidden="true" />
								<a href={CORPORATE_PHONE_ARAUCA_TEL} className="hover:text-white hover:underline">
									{CORPORATE_PHONE_ARAUCA}
								</a>
								<span aria-hidden="true">/</span>
								<a href={CORPORATE_PHONE_BOGOTA_TEL} className="hover:text-white hover:underline">
									{CORPORATE_PHONE_BOGOTA}
								</a>
							</div>
							<div className="flex items-center gap-2">
								<PhoneCall className="size-3.5" aria-hidden="true" />
								<a href={CORPORATE_CELULAR_TEL} className="hover:text-white hover:underline">
									{CORPORATE_CELULAR}
								</a>
							</div>
						</address>

						<div className="mt-6">
							<Button asChild className="rounded-full px-5">
								<Link href={APP_ROUTES.login}>Ingresar al sistema</Link>
							</Button>
						</div>
					</div>
				</div>

				<div className="mt-10 flex flex-col gap-1 border-t border-hairline-dark pt-8 text-xs text-slate sm:flex-row sm:items-center sm:justify-between">
					<p suppressHydrationWarning>
						&copy; {new Date().getFullYear()} {CORPORATE_NAME} — NIT {CORPORATE_NIT}
					</p>
				</div>
			</div>
		</footer>
	);
}
