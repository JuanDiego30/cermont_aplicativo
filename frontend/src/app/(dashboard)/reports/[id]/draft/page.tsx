"use client";

import { use } from "react";
import { TechnicalReportDraftPage } from "@/modules/reports/ui/TechnicalReportDraftPage";

interface Props {
	params: Promise<{ id: string }>;
}

export default function ReportDraftPage({ params }: Props) {
	const { id } = use(params);

	return (
		<TechnicalReportDraftPage
			serviceCaseCode={`SC-${id.slice(-6)}`}
			clientName="Cargando..."
			isLoading={false}
			sections={[
				{
					id: "general",
					title: "Datos generales",
					content: "Información del servicio y cliente.",
					editable: false,
				},
				{
					id: "activities",
					title: "Actividades realizadas",
					content: "Listado de actividades ejecutadas en campo.",
					editable: false,
				},
				{
					id: "materials",
					title: "Materiales utilizados",
					content: "Relación de materiales consumidos.",
					editable: false,
				},
				{
					id: "evidence",
					title: "Evidencias",
					content: "Fotografías y documentos de soporte.",
					editable: false,
				},
				{
					id: "novelties",
					title: "Novedades",
					content: "Incidentes o desviaciones reportadas.",
					editable: false,
				},
				{
					id: "conclusion",
					title: "Conclusión técnica",
					content: "[Editable] Escriba la conclusión del informe...",
					editable: true,
				},
			]}
			onRegenerate={() => {}}
			onApprove={() => {}}
			onUpdateSection={() => {}}
		/>
	);
}
