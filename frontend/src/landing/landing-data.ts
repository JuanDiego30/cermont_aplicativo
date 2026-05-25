import {
	Building2,
	ClipboardList,
	Clock3,
	FileText,
	MapPin,
	Search,
	ShieldCheck,
	Snowflake,
	Sparkles,
	Wrench,
} from "lucide-react";
import type { ComponentType } from "react";

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
}

export interface LandingCertification {
	title: string;
	description: string;
	badge: string;
}

export const LANDING_FEATURES: LandingFeature[] = [
	{
		title: "Satisfaccion del cliente",
		description: "Meta clara: la satisfaccion total de nuestros clientes.",
		tone: "brand",
		icon: ShieldCheck,
	},
	{
		title: "Recurso humano calificado",
		description:
			"Servicio eficiente con recurso humano altamente calificado y tecnologia de ultima generacion.",
		tone: "success",
		icon: ClipboardList,
	},
	{
		title: "Asesoria integral",
		description:
			"Lo asesoramos en electricidad, mantenimiento, refrigeracion, montajes, construccion, suministro de materiales electricos, alumbrado comercial e industrial y telecomunicaciones.",
		tone: "info",
		icon: Building2,
	},
	{
		title: "Mejoramiento continuo",
		description:
			"Procesos internos orientados al mejoramiento continuo, al liderazgo y la competitividad.",
		tone: "warning",
		icon: Clock3,
	},
	{
		title: "Responsabilidad social",
		description:
			"Compromiso con el desarrollo sostenible, el manejo ambiental y el respeto por la comunidad.",
		tone: "purple",
		icon: FileText,
	},
	{
		title: "Cobertura nacional",
		description: "Prestamos servicio en todo el territorio nacional con disciplina y trazabilidad.",
		tone: "neutral",
		icon: MapPin,
	},
];

export const LANDING_TRUST_POINTS: LandingTrustPoint[] = [
	{
		title: "Respeto",
		description:
			"Actuamos sin discriminacion, valorando a cada persona y su contribucion al equipo.",
		icon: ShieldCheck,
	},
	{
		title: "Responsabilidad",
		description:
			"Ejecutamos cada servicio con eficacia, eficiencia y cumplimiento de los estandares de calidad.",
		icon: ClipboardList,
	},
	{
		title: "Transparencia",
		description: "Comunicacion clara y directa con supervision, clientes y comunidad.",
		icon: MapPin,
	},
	{
		title: "Lealtad",
		description:
			"Proyectamos la mejor imagen institucional y cumplimos las politicas corporativas.",
		icon: Clock3,
	},
];

export const LANDING_SERVICES: LandingService[] = [
	{
		title: "Construccion",
		description:
			"Obras civiles con sistema de procesos interno orientado al mejoramiento continuo y excelencia operacional.",
		icon: Building2,
	},
	{
		title: "Refrigeracion Comercial e Industrial",
		description:
			"Proyectos y soluciones en equipos de acondicionamiento de aire, ventilacion mecanica, refrigeracion industrial y comercial, gabinetes electricos para refrigeracion.",
		icon: Snowflake,
	},
	{
		title: "Electricos",
		description:
			"Suministro de materiales electricos, alumbrado comercial e industrial, mantenimiento y montaje de instalaciones electricas.",
		icon: Sparkles,
	},
	{
		title: "Telecomunicaciones",
		description: "Infraestructura de telecomunicaciones para operaciones en campo.",
		icon: FileText,
	},
	{
		title: "Montajes",
		description:
			"Montajes industriales con personal altamente calificado y compromiso con la excelencia operativa.",
		icon: Wrench,
	},
];

export const LANDING_METRICS: LandingMetric[] = [
	{
		label: "Sedes",
		value: "2",
		detail: "Arauca y Bogota, cobertura nacional.",
	},
	{
		label: "NIT",
		value: "900.223.449-5",
		detail: "Camara de comercio de Arauca.",
	},
	{
		label: "Compromiso",
		value: "SG-SSTA",
		detail: "Seguridad, salud en el trabajo y ambiente.",
	},
];

export const LANDING_WORKFLOW: LandingWorkflowStep[] = [
	{
		step: 1,
		title: "Diagnostico",
		description: "Validamos el frente y el alcance real antes de ejecutar.",
		icon: Search,
	},
	{
		step: 2,
		title: "Planificacion",
		description: "Definimos recursos, seguridad y cronograma.",
		icon: ClipboardList,
	},
	{
		step: 3,
		title: "Ejecucion",
		description: "El equipo opera con comunicacion corta y trazabilidad.",
		icon: Wrench,
	},
	{
		step: 4,
		title: "Cierre",
		description: "Consolidamos evidencias y entregables para auditoria.",
		icon: ShieldCheck,
	},
];

export const LANDING_RESOURCES: LandingResource[] = [
	{
		title: "Perfil corporativo",
		description: "Resumen institucional y capacidades del servicio.",
		href: "/landing/perfil-corporativo.md",
		meta: "MD",
	},
	{
		title: "Catalogo de servicios",
		description: "Lineas operativas, alcance y coordinacion.",
		href: "/landing/catalogo-servicios.md",
		meta: "MD",
	},
	{
		title: "Guia HSE",
		description: "Buenas practicas y control documental para el frente.",
		href: "/landing/guia-hse.md",
		meta: "MD",
	},
];

export const LANDING_CERTIFICATIONS: LandingCertification[] = [
	{
		title: "Codigo de etica",
		description: "Respeto, lealtad, responsabilidad y transparencia en cada actuacion.",
		badge: "Etica",
	},
	{
		title: "Politica de calidad",
		description:
			"Brindar servicios de calidad buscando la satisfaccion del cliente y el cumplimiento de requisitos legales.",
		badge: "Calidad",
	},
	{
		title: "Seguridad industrial",
		description: "Criterios HSE durante ejecucion y cierre de cada servicio.",
		badge: "HSE",
	},
];
