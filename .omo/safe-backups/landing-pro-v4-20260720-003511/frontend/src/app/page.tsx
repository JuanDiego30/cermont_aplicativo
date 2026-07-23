import type { Metadata } from "next";
import Script from "next/script";
import { PublicLandingContent } from "@/landing/components/PublicLandingContent";
import {
	CORPORATE_ADDRESS_ARAUCA,
	CORPORATE_ADDRESS_BOGOTA,
	CORPORATE_CELULAR,
	CORPORATE_EMAIL,
	CORPORATE_NAME,
} from "@/landing/landing-constants";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "Organization",
	name: CORPORATE_NAME,
	url: siteUrl,
	description:
		"Servicios de ingeniería eléctrica, mantenimiento, montajes, refrigeración, construcción civil, suministro eléctrico, alumbrado y telecomunicaciones.",
	telephone: `+57 ${CORPORATE_CELULAR}`,
	email: CORPORATE_EMAIL,
	address: [
		{
			"@type": "PostalAddress",
			streetAddress: CORPORATE_ADDRESS_ARAUCA,
			addressLocality: "Arauca",
			addressRegion: "Arauca",
			addressCountry: "CO",
		},
		{
			"@type": "PostalAddress",
			streetAddress: CORPORATE_ADDRESS_BOGOTA,
			addressLocality: "Bogotá",
			addressRegion: "Bogotá",
			addressCountry: "CO",
		},
	],
};

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: "Cermont S.A.S. — Ingeniería, Construcción y Mantenimiento en Colombia",
	description:
		"Cermont S.A.S. ofrece servicios técnicos e ingeniería aplicada en electricidad, mantenimiento, montajes, refrigeración, construcción civil, suministro, alumbrado y telecomunicaciones.",
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title: "Cermont S.A.S. — Ingeniería y Servicios Técnicos",
		description:
			"Soluciones técnicas en electricidad, mantenimiento, montajes, refrigeración, construcción civil, suministro, alumbrado y telecomunicaciones.",
		url: "/",
		siteName: "Cermont S.A.S.",
		locale: "es_CO",
		type: "website",
		images: [
			{
				url: "/images/optimized/landing/chatgpt-image-25-may-2026-22-58-49-1-1280.webp",
				alt: "Contexto visual ilustrativo de trabajo técnico en campo",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Cermont S.A.S. — Ingeniería y Servicios Técnicos",
		description:
			"Servicios técnicos de electricidad, mantenimiento, montajes, refrigeración, construcción civil, suministro, alumbrado y telecomunicaciones.",
		images: ["/images/optimized/landing/chatgpt-image-25-may-2026-22-58-49-1-1280.webp"],
	},
};

export default function LandingPage() {
	return (
		<>
			<Script id="json-ld-organization" type="application/ld+json">
				{JSON.stringify(jsonLd)}
			</Script>
			<PublicLandingContent />
		</>
	);
}
