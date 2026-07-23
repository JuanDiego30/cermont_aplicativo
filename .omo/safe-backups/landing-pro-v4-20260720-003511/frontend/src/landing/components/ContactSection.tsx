import { ArrowRight, Mail, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/ui/Button";
import {
	CORPORATE_ADDRESS_ARAUCA,
	CORPORATE_ADDRESS_BOGOTA,
	CORPORATE_CELULAR,
	CORPORATE_EMAIL,
	CORPORATE_MAILTO,
	CORPORATE_PHONE_ARAUCA,
	CORPORATE_PHONE_ARAUCA_TEL,
	CORPORATE_PHONE_BOGOTA,
	CORPORATE_PHONE_BOGOTA_TEL,
	CORPORATE_CELULAR_TEL,
	WHATSAPP_URL,
} from "../landing-constants";
import { APP_ROUTES } from "@/lib/routes";
import { SectionHeading } from "./SectionHeading";

export function ContactSection() {
	return (
		<section
			id="contacto"
			data-landing-section
			aria-labelledby="contact-heading"
			className="relative overflow-hidden bg-canvas-dark py-16 sm:py-20 lg:py-24 scroll-mt-28"
		>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute top-0 right-0 size-96 rounded-full bg-white/5 blur-3xl" />
				<div className="absolute bottom-0 left-0 size-80 rounded-full bg-brand-annotate/10 blur-3xl" />
			</div>

			<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-8 shadow-[0_24px_80px_rgba(10,10,10,0.45)] sm:p-10 lg:p-12">
					<SectionHeading
						id="contact-heading"
						eyebrow="Contacto"
						title="Conversemos sobre su próximo servicio."
						description="Mantenga el contacto directo por correo, teléfono o WhatsApp. El formulario y los envíos automáticos quedan fuera de este alcance."
						inverse
					/>

					<div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						<address className="not-italic rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
							<Mail className="size-5 text-brand-annotate" aria-hidden="true" />
							<p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone">
								Correo
							</p>
							<a
								href={CORPORATE_MAILTO}
								className="mt-2 block text-lg font-semibold text-white transition-colors hover:text-brand-annotate"
							>
								{CORPORATE_EMAIL}
							</a>
						</address>

						<address className="not-italic rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
							<MapPin className="size-5 text-brand-annotate" aria-hidden="true" />
							<p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone">
								Sede Arauca
							</p>
							<p className="mt-2 text-base font-semibold text-white">{CORPORATE_ADDRESS_ARAUCA}</p>
							<a
								href={CORPORATE_PHONE_ARAUCA_TEL}
								className="mt-1 inline-flex min-h-11 items-center text-sm text-stone underline-offset-4 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/50"
							>
								{CORPORATE_PHONE_ARAUCA}
							</a>
						</address>

						<address className="not-italic rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
							<MapPin className="size-5 text-brand-annotate" aria-hidden="true" />
							<p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone">
								Oficina Bogota
							</p>
							<p className="mt-2 text-base font-semibold text-white">{CORPORATE_ADDRESS_BOGOTA}</p>
							<a
								href={CORPORATE_PHONE_BOGOTA_TEL}
								className="mt-1 inline-flex min-h-11 items-center text-sm text-stone hover:text-white hover:underline"
							>
								{CORPORATE_PHONE_BOGOTA}
							</a>
						</address>

						<address className="not-italic rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
							<PhoneCall className="size-5 text-brand-annotate" aria-hidden="true" />
							<p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone">
								Celular
							</p>
							<a
								href={CORPORATE_CELULAR_TEL}
								className="mt-2 inline-flex min-h-11 items-center text-lg font-semibold text-white hover:text-brand-annotate hover:underline"
							>
								{CORPORATE_CELULAR}
							</a>
							<a
								href={WHATSAPP_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm text-brand-annotate hover:underline"
							>
								<MessageCircle className="size-4" aria-hidden="true" />
								Escribir por WhatsApp
							</a>
						</address>

						<address className="not-italic rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
							<PhoneCall className="size-5 text-stone" aria-hidden="true" />
							<p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone">
								Tel. Arauca
							</p>
							<a
								href={CORPORATE_PHONE_ARAUCA_TEL}
								className="mt-2 inline-flex min-h-11 items-center text-lg font-semibold text-white hover:underline"
							>
								{CORPORATE_PHONE_ARAUCA}
							</a>
						</address>

						<address className="not-italic rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
							<PhoneCall className="size-5 text-stone" aria-hidden="true" />
							<p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone">
								Tel. Bogota
							</p>
							<a
								href={CORPORATE_PHONE_BOGOTA_TEL}
								className="mt-2 inline-flex min-h-11 items-center text-lg font-semibold text-white hover:underline"
							>
								{CORPORATE_PHONE_BOGOTA}
							</a>
						</address>
					</div>

					<div className="mt-10 flex flex-wrap items-center gap-3">
						<Button asChild size="lg" className="rounded-full px-6">
							<a href={CORPORATE_MAILTO}>
								Solicitar información
								<ArrowRight className="size-4.5" aria-hidden="true" />
							</a>
						</Button>
						<Button
							asChild
							size="lg"
							variant="outline"
							className="rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10"
						>
							<Link href={APP_ROUTES.login}>Acceso privado</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
