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

const jsonLdOrganization = {
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

const jsonLdWebSite = {
	"@context": "https://schema.org",
	"@type": "WebSite",
	name: "Cermont S.A.S.",
	url: siteUrl,
	description:
		"Plataforma operativa para servicios de ingeniería eléctrica, mantenimiento, montajes, refrigeración, construcción civil, suministro eléctrico, alumbrado y telecomunicaciones.",
	inLanguage: "es-CO",
};

const jsonLdService = {
	"@context": "https://schema.org",
	"@type": "Service",
	name: "Servicios de Ingeniería y Mantenimiento",
	provider: {
		"@type": "Organization",
		name: CORPORATE_NAME,
	},
	areaServed: ["Arauca, Colombia", "Bogotá, Colombia"],
	hasOfferCatalog: {
		"@type": "OfferCatalog",
		name: "Líneas de servicio",
		itemListElement: [
			{ "@type": "Offer", itemOffered: { "@type": "Service", name: "Ingeniería eléctrica" } },
			{ "@type": "Offer", itemOffered: { "@type": "Service", name: "Mantenimiento preventivo y correctivo" } },
			{ "@type": "Offer", itemOffered: { "@type": "Service", name: "Montajes industriales y comerciales" } },
			{ "@type": "Offer", itemOffered: { "@type": "Service", name: "Refrigeración mecánica" } },
			{ "@type": "Offer", itemOffered: { "@type": "Service", name: "Construcción civil" } },
			{ "@type": "Offer", itemOffered: { "@type": "Service", name: "Suministro eléctrico" } },
			{ "@type": "Offer", itemOffered: { "@type": "Service", name: "Alumbrado público e industrial" } },
			{ "@type": "Offer", itemOffered: { "@type": "Service", name: "Telecomunicaciones" } },
		],
	},
};

const jsonLdFaq = {
	"@context": "https://schema.org",
	"@type": "FAQPage",
	mainEntity: [
		{
			"@type": "Question",
			name: "¿Qué servicios ofrece Cermont S.A.S.?",
			acceptedAnswer: {
				"@type": "Answer",
				text: "Cermont ofrece ocho líneas de servicio: ingeniería eléctrica, mantenimiento preventivo y correctivo, montajes industriales y comerciales, refrigeración mecánica, construcción civil, suministro eléctrico, alumbrado público e industrial, y telecomunicaciones.",
			},
		},
		{
			"@type": "Question",
			name: "¿En qué ciudades o zonas tiene presencia Cermont?",
			acceptedAnswer: {
				"@type": "Answer",
				text: "Cermont tiene sede principal en Arauca (Calle 21 No. 25-43) y oficina en Bogotá (Calle 70A No. 17-16).",
			},
		},
		{
			"@type": "Question",
			name: "¿Cómo es el proceso de trabajo de Cermont?",
			acceptedAnswer: {
				"@type": "Answer",
				text: "Cada servicio recorre cuatro pasos: diagnóstico y alcance, planeación y recursos, ejecución y registro, informe y cierre.",
			},
		},
		{
			"@type": "Question",
			name: "¿Cómo puedo contactar a Cermont?",
			acceptedAnswer: {
				"@type": "Answer",
				text: "Puede escribir al correo Gerencia@cermont.co, llamar al (7) 885 11 86 (Arauca) o (1) 542 45 78 (Bogotá), o escribir por WhatsApp al 316 535 2952.",
			},
		},
		{
			"@type": "Question",
			name: "¿Cermont cuenta con un sistema de gestión documental?",
			acceptedAnswer: {
				"@type": "Answer",
				text: "Sí. La plataforma Cermont Campo integra trazabilidad documental desde la solicitud hasta el cierre administrativo.",
			},
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
				{JSON.stringify(jsonLdOrganization)}
			</Script>
			<Script id="json-ld-website" type="application/ld+json">
				{JSON.stringify(jsonLdWebSite)}
			</Script>
			<Script id="json-ld-service" type="application/ld+json">
				{JSON.stringify(jsonLdService)}
			</Script>
			<Script id="json-ld-faq" type="application/ld+json">
				{JSON.stringify(jsonLdFaq)}
			</Script>
			<PublicLandingContent />
		</>
	);
}
