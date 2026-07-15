import { createLogger } from "../common/utils/logger";
import { AppError } from "../common/errors/AppError";

const log = createLogger("report-generator");

interface GenerateDraftInput {
	reportId: string;
	executionData: {
		activities: string[];
		observations: string[];
		resources: Array<{ name: string; quantity: number; unit: string }>;
	};
	evidenceUrls: string[];
}

interface GenerateDraftOutput {
	title: string;
	sections: Array<{ heading: string; content: string }>;
	generatedAt: string;
}

export async function generateDraft(input: GenerateDraftInput): Promise<GenerateDraftOutput> {
	log.info("Generating technical report draft", { reportId: input.reportId });

	if (!input.executionData.activities || input.executionData.activities.length === 0) {
		throw new AppError(
			"No hay actividades registradas para generar el informe",
			400,
			"REPORT_NO_ACTIVITIES",
		);
	}

	const sections: Array<{ heading: string; content: string }> = [];

	sections.push({
		heading: "1. Actividades Realizadas",
		content: input.executionData.activities
			.map((activity, i) => `${i + 1}. ${activity}`)
			.join("\n"),
	});

	if (input.executionData.observations.length > 0) {
		sections.push({
			heading: "2. Observaciones",
			content: input.executionData.observations
				.map((obs, i) => `${i + 1}. ${obs}`)
				.join("\n"),
		});
	}

	if (input.executionData.resources.length > 0) {
		sections.push({
			heading: "3. Recursos Utilizados",
			content: input.executionData.resources
				.map(
					(r) =>
						`- ${r.name}: ${r.quantity} ${r.unit}`,
				)
				.join("\n"),
		});
	}

	if (input.evidenceUrls.length > 0) {
		sections.push({
			heading: "4. Evidencias Fotográficas",
			content: `Se anexan ${input.evidenceUrls.length} evidencias fotográficas del trabajo realizado.`,
		});
	}

	return {
		title: `Informe Técnico — ${new Date().toLocaleDateString("es-CO")}`,
		sections,
		generatedAt: new Date().toISOString(),
	};
}
