import type { Metadata } from "next";
import Script from "next/script";
import { PublicLandingContent } from "@/landing/components/PublicLandingContent";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "Organization",
	name: "Cermont S.A.S.",
	url: siteUrl,
	description:
		"Ingeniería eléctrica, construcción civil, refrigeración, telecomunicaciones y montajes industriales en Arauca y Bogotá.",
	telephone: "+57-316-535-2952",
	email: "Gerencia@cermont.co",
	address: [
		{
			"@type": "PostalAddress",
			streetAddress: "Calle 21 No. 25-43",
			addressLocality: "Arauca",
			addressRegion: "Arauca",
			addressCountry: "CO",
		},
		{
			"@type": "PostalAddress",
			streetAddress: "Calle 70A No. 17-16",
			addressLocality: "Bogotá",
			addressRegion: "Bogotá",
			addressCountry: "CO",
		},
	],
};

export const metadata: Metadata = {
	title: "Cermont S.A.S. — Ingeniería, Construcción y Mantenimiento en Colombia",
	description:
		"CERMONT S.A.S. presta servicios de ingeniería eléctrica, construcción civil, refrigeración, telecomunicaciones y montajes industriales en Arauca y Bogotá. Ejecutamos con planeación, seguridad y trazabilidad documental.",
	openGraph: {
		title: "Cermont S.A.S. — Ingeniería y Servicios Técnicos",
		description:
			"Soluciones industriales en electricidad, refrigeración, mantenimiento y construcción. Disciplina operativa y trazabilidad documental en cada servicio.",
		url: siteUrl,
		siteName: "Cermont S.A.S.",
		locale: "es_CO",
		type: "website",
	},
};

export default function LandingPage() {
	return (
		<section aria-label="Cermont public website">
			<Script
				id="json-ld-organization"
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<PublicLandingContent />
		</section>
	);
}
