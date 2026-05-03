import { ArrowRight, Mail, MapPin, PhoneCall } from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/ui/Button";
import {
	CORPORATE_ADDRESS_ARAUCA,
	CORPORATE_ADDRESS_BOGOTA,
	CORPORATE_CELULAR,
	CORPORATE_EMAIL,
	CORPORATE_MAILTO,
	CORPORATE_PHONE_ARAUCA,
	CORPORATE_PHONE_BOGOTA,
} from "../landing-constants";
import { SectionHeading } from "./SectionHeading";

export function ContactSection() {
	return (
		<section
			id="contacto"
			data-landing-section
			aria-labelledby="contact-heading"
			className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(10,22,40,0.98),rgba(6,14,26,0.98))] py-16 sm:py-20 lg:py-24 scroll-mt-28"
		>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-cermont-blue-light/15 blur-3xl" />
				<div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-cermont-green-light/10 blur-3xl" />
			</div>

			<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-8 shadow-[0_24px_80px_rgba(2,6,23,0.45)] sm:p-10 lg:p-12">
					<SectionHeading
						eyebrow="Contacto"
						title="Contactanos y te asesoramos en tu proximo proyecto."
						description="Lo asesoramos en las areas de electricidad, mantenimiento, refrigeracion, montajes, construccion, suministro de materiales electricos, alumbrado comercial e industrial y telecomunicaciones."
						inverse
					/>

					<div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						<article className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
							<Mail className="h-5 w-5 text-cermont-blue-light" aria-hidden="true" />
							<p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
								Correo
							</p>
							<a
								href={CORPORATE_MAILTO}
								className="mt-2 block text-lg font-semibold text-white transition-colors hover:text-cermont-blue-light"
							>
								{CORPORATE_EMAIL}
							</a>
						</article>

						<article className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
							<MapPin className="h-5 w-5 text-cermont-green" aria-hidden="true" />
							<p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
								Sede Arauca
							</p>
							<p className="mt-2 text-base font-semibold text-white">{CORPORATE_ADDRESS_ARAUCA}</p>
							<p className="mt-1 text-sm text-slate-300">{CORPORATE_PHONE_ARAUCA}</p>
						</article>

						<article className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
							<MapPin className="h-5 w-5 text-cermont-green" aria-hidden="true" />
							<p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
								Oficina Bogota
							</p>
							<p className="mt-2 text-base font-semibold text-white">{CORPORATE_ADDRESS_BOGOTA}</p>
							<p className="mt-1 text-sm text-slate-300">{CORPORATE_PHONE_BOGOTA}</p>
						</article>

						<article className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
							<PhoneCall className="h-5 w-5 text-(--color-warning)" aria-hidden="true" />
							<p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
								Celular
							</p>
							<p className="mt-2 text-lg font-semibold text-white">{CORPORATE_CELULAR}</p>
						</article>

						<article className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
							<PhoneCall className="h-5 w-5 text-cermont-blue-light" aria-hidden="true" />
							<p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
								Tel. Arauca
							</p>
							<p className="mt-2 text-lg font-semibold text-white">{CORPORATE_PHONE_ARAUCA}</p>
						</article>

						<article className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
							<PhoneCall className="h-5 w-5 text-cermont-blue-light" aria-hidden="true" />
							<p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
								Tel. Bogota
							</p>
							<p className="mt-2 text-lg font-semibold text-white">{CORPORATE_PHONE_BOGOTA}</p>
						</article>
					</div>

					<div className="mt-10 flex flex-wrap items-center gap-3">
						<Button asChild size="lg" className="rounded-full px-6">
							<a href={CORPORATE_MAILTO}>
								Solicitar informacion
								<ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
							</a>
						</Button>
						<Button
							asChild
							size="lg"
							variant="outline"
							className="rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10"
						>
							<Link href="/login">Acceso privado</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
