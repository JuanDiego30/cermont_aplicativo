import {
	Building2,
	ClipboardList,
	Clock3,
	Factory,
	FileText,
	Fuel,
	Heart,
	MapPin,
	Search,
	ShieldCheck,
	Snowflake,
	Sparkles,
	Store,
	Wrench,
} from "lucide-react";
import type { ComponentType } from "react";
import { APP_ROUTES } from "@/lib/routes";
import { PUBLIC_CONSENT_ROUTE, PUBLIC_PRIVACY_ROUTE } from "./landing-constants";

export type LandingTone =
	| "brand"
	| "info"
	| "success"
	| "warning"
	| "purple"
	| "neutral"
	| "danger";

export interface LandingFeature {
	title: string;
	description: string;
	tone: LandingTone;
	icon: ComponentType<{ className?: string }>;
}

export interface LandingTrustPoint {
	title: string;
	description: string;
	icon: ComponentType<{ className?: string }>;
}

export interface LandingService {
	title: string;
	description: string;
	icon: ComponentType<{ className?: string }>;
}

export interface LandingMetric {
	label: string;
	value: string;
	detail: string;
}

export interface LandingWorkflowStep {
	step: number;
	title: string;
	description: string;
	icon: ComponentType<{ className?: string }>;
}

export interface LandingResource {
	title: string;
	description: string;
	href: string;
	meta: string;
	destination: "contact" | "login" | "privacy" | "consent";
}

export interface LandingCommitment {
	title: string;
	description: string;
	badge: string;
}

export interface LandingVisualAsset {
	id: string;
	src: string;
	alt: string;
	caption: string;
	disclosure: string;
	authorization: "blocked_external";
}

export const LANDING_FEATURES: LandingFeature[] = [
	{
		title: "Alcance claro",
		description:
			"Definimos el requerimiento, el frente de trabajo y los entregables antes de iniciar.",
		tone: "brand",
		icon: Search,
	},
	{
		title: "Planeación previa",
		description:
			"Ordenamos recursos, responsables, seguridad y cronograma según el servicio contratado.",
		tone: "success",
		icon: ClipboardList,
	},
	{
		title: "Evidencia asociada",
		description:
			"Registramos soportes de ejecución y los relacionamos con el servicio correspondiente.",
		tone: "info",
		icon: FileText,
	},
	{
		title: "Cierre documentado",
		description:
			"Consolidamos informes, actas y documentos de cierre para facilitar la revisión posterior.",
		tone: "warning",
		icon: ShieldCheck,
	},
	{
		title: "Comunicación directa",
		description:
			"Mantenemos canales claros entre cliente, equipo de campo y responsables del servicio.",
		tone: "purple",
		icon: MapPin,
	},
	{
		title: "Continuidad operativa",
		description:
			"La información del trabajo acompaña el recorrido desde la solicitud hasta el cierre administrativo.",
		tone: "neutral",
		icon: Clock3,
	},
];

export const LANDING_TRUST_POINTS: LandingTrustPoint[] = [
	{
		title: "Respeto",
		description: "Valoramos a las personas, su trabajo y su contribución al equipo.",
		icon: ShieldCheck,
	},
	{
		title: "Responsabilidad",
		description: "Asumimos el alcance acordado y comunicamos el avance del servicio con claridad.",
		icon: ClipboardList,
	},
	{
		title: "Transparencia",
		description: "Mantenemos comunicación clara y directa con clientes, supervisión y comunidad.",
		icon: MapPin,
	},
	{
		title: "Lealtad",
		description: "Actuamos de forma coherente con nuestros compromisos y políticas corporativas.",
		icon: Clock3,
	},
];

export const LANDING_SERVICES: LandingService[] = [
	{
		title: "Ingeniería eléctrica",
		description:
			"Diseño, instalación y mantenimiento de sistemas eléctricos según el alcance acordado.",
		icon: Building2,
	},
	{
		title: "Mantenimiento preventivo y correctivo",
		description:
			"Revisión, atención y seguimiento de equipos e instalaciones para mantener el servicio operativo.",
		icon: Sparkles,
	},
	{
		title: "Montajes industriales y comerciales",
		description:
			"Montaje y adecuación de estructuras, equipos e instalaciones de acuerdo con el proyecto.",
		icon: Wrench,
	},
	{
		title: "Refrigeración mecánica",
		description:
			"Instalación, revisión y mantenimiento de sistemas de refrigeración y climatización.",
		icon: Snowflake,
	},
	{
		title: "Construcción civil",
		description:
			"Apoyo y ejecución de actividades de construcción civil según planos, alcance y condiciones del frente.",
		icon: Building2,
	},
	{
		title: "Suministro eléctrico",
		description:
			"Suministro de materiales e insumos eléctricos según las especificaciones del servicio.",
		icon: ClipboardList,
	},
	{
		title: "Alumbrado público e industrial",
		description:
			"Instalación, mantenimiento y adecuación de soluciones de iluminación para espacios públicos e industriales.",
		icon: Sparkles,
	},
	{
		title: "Telecomunicaciones",
		description:
			"Instalación y mantenimiento de infraestructura de telecomunicaciones para operaciones en campo.",
		icon: FileText,
	},
];

export const LANDING_METRICS: LandingMetric[] = [
	{
		label: "Sedes",
		value: "2",
		detail: "Arauca y Bogotá, información de contacto pública.",
	},
	{
		label: "Líneas",
		value: "8",
		detail: "Líneas de servicio documentadas en la oferta pública.",
	},
];

export const LANDING_WORKFLOW: LandingWorkflowStep[] = [
	{
		step: 1,
		title: "Diagnóstico y alcance",
		description:
			"Recibimos el requerimiento, definimos el frente de trabajo y determinamos los entregables del servicio.",
		icon: Search,
	},
	{
		step: 2,
		title: "Planeación y recursos",
		description:
			"Validamos condiciones del sitio, aseguramos herramientas, certificaciones y cronograma antes de ejecutar.",
		icon: ClipboardList,
	},
	{
		step: 3,
		title: "Ejecución y registro",
		description:
			"Desarrollamos las actividades contratadas con registro continuo de avance, novedades y evidencias.",
		icon: Wrench,
	},
	{
		step: 4,
		title: "Informe y cierre",
		description: "Consolidamos informe, acta, soportes y documentos de cierre para entregar al cliente.",
		icon: ShieldCheck,
	},
];

export const LANDING_RESOURCES: LandingResource[] = [
	{
		title: "Solicitar información",
		description:
			"Converse directamente con Cermont sobre su requerimiento eléctrico, civil o técnico.",
		href: "#contacto",
		meta: "Contacto",
		destination: "contact",
	},
	{
		title: "Acceso privado",
		description:
			"Ingrese al espacio privado de la aplicación para continuar su operación documentada.",
		href: APP_ROUTES.login,
		meta: "Aplicación",
		destination: "login",
	},
	{
		title: "Política de privacidad",
		description: "Consulte cómo se trata la información en los espacios públicos de Cermont.",
		href: PUBLIC_PRIVACY_ROUTE,
		meta: "Legal",
		destination: "privacy",
	},
	{
		title: "Consentimiento",
		description: "Revise la información sobre consentimiento y preferencias de comunicación.",
		href: PUBLIC_CONSENT_ROUTE,
		meta: "Legal",
		destination: "consent",
	},
];

export const LANDING_COMMITMENTS: LandingCommitment[] = [
	{
		title: "Respeto",
		description: "Cuidamos la relación con las personas, el equipo y la comunidad.",
		badge: "Principio",
	},
	{
		title: "Responsabilidad",
		description: "Comunicamos el alcance y asumimos el seguimiento del servicio contratado.",
		badge: "Principio",
	},
	{
		title: "Transparencia",
		description: "La información del trabajo se presenta de forma clara y directa.",
		badge: "Principio",
	},
];

export const LANDING_VISUAL_ASSETS = [
	{
		id: "field",
		src: "/images/optimized/landing/chatgpt-image-25-may-2026-22-58-49-1-1280.webp",
		alt: "Personas trabajando en un entorno industrial exterior con herramientas de campo",
		caption: "Contexto visual de trabajo en campo",
		disclosure: "Imagen ilustrativa; no constituye evidencia de un servicio específico de Cermont.",
		authorization: "blocked_external",
	},
	{
		id: "planning",
		src: "/images/optimized/landing/chatgpt-image-25-may-2026-22-58-50-2-1280.webp",
		alt: "Persona utilizando una estructura de acceso en un entorno con paneles solares",
		caption: "Contexto visual de planeación y acceso",
		disclosure: "Imagen ilustrativa pendiente de autorización documental para uso como evidencia.",
		authorization: "blocked_external",
	},
	{
		id: "technical",
		src: "/images/optimized/landing/chatgpt-image-25-may-2026-22-58-50-3-1280.webp",
		alt: "Detalle de componentes y cableado eléctrico organizado",
		caption: "Contexto visual de instalaciones eléctricas",
		disclosure: "Imagen ilustrativa; no representa un activo, cliente ni resultado verificable.",
		authorization: "blocked_external",
	},
] as const satisfies readonly [LandingVisualAsset, ...LandingVisualAsset[]];

export const CLIENT_LOGOS = [{ name: "Cermont", logo: "/icons/logo-cermont.png" }];

export const LANDING_STATS: Array<{ value: number; suffix: string; label: string }> = [
	{ value: 15, suffix: "+", label: "Años de operación técnica" },
	{ value: 8, suffix: "", label: "Líneas de servicio integradas" },
	{ value: 14, suffix: "", label: "Pasos de trazabilidad operativa" },
	{ value: 2, suffix: "", label: "Sedes operativas" },
	{ value: 200, suffix: "+", label: "Servicios documentados" },
];

export interface LandingSector {
	title: string;
	description: string;
	icon: ComponentType<{ className?: string }>;
}

export const LANDING_SECTORS: LandingSector[] = [
	{
		title: "Oil & Gas",
		description: "Servicios técnicos para acompañar requerimientos del sector hidrocarburos con trazabilidad documental.",
		icon: Fuel,
	},
	{
		title: "Sector Salud",
		description: "Mantenimiento y adecuación de instalaciones eléctricas y climatización para entornos de salud.",
		icon: Heart,
	},
	{
		title: "Sector Público",
		description: "Ejecución de proyectos de infraestructura eléctrica y civil para entidades gubernamentales.",
		icon: Building2,
	},
	{
		title: "Industria",
		description: "Montajes industriales, mantenimiento preventivo y correctivo para plantas de producción.",
		icon: Factory,
	},
	{
		title: "Comercio",
		description: "Soluciones eléctricas, iluminación y climatización para locales comerciales y centros de negocio.",
		icon: Store,
	},
];

export const LANDING_TESTIMONIALS: Array<{
	name: string;
	company: string;
	role: string;
	text: string;
	initials: string;
}> = [
	{
		name: "Código de Ética Cermont",
		company: "Cermont S.A.S.",
		role: "Compromiso institucional",
		text: "Actuamos de forma coherente con nuestros compromisos y políticas corporativas, manteniendo comunicación clara y directa con clientes, supervisión y comunidad.",
		initials: "CE",
	},
	{
		name: "Manual de Procedimientos",
		company: "Cermont S.A.S.",
		role: "Proceso operativo",
		text: "Cada servicio recorre una secuencia controlada: diagnóstico, planeación, ejecución y entrega formal de soportes documentales.",
		initials: "MP",
	},
	{
		name: "Política de Calidad",
		company: "Cermont S.A.S.",
		role: "Estándar de calidad",
		text: "Nuestro compromiso es entregar trabajos técnicos con los soportes que permitan su revisión posterior y la continuidad de la operación.",
		initials: "PC",
	},
];
