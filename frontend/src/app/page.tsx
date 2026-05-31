import { PublicLandingContent } from "@/landing/components/PublicLandingContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Cermont S.A.S. — Soluciones Integrales en Ingeniería",
	description:
		"Expertos en mantenimiento preventivo, correctivo y suministro de equipos industriales. Gestión eficiente de servicios de ingeniería con tecnología de vanguardia.",
};

export default function LandingPage() {
	return (
		<section aria-label="Cermont public website">
			<PublicLandingContent />
		</section>
	);
}
