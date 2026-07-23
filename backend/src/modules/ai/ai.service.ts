/**
 * AI Service — Business Logic Layer
 *
 * Provides contextual AI processing for the Cermont AI Assistant.
 * Uses the provider adapter for LLM calls with security controls.
 */

import { CERMONT_OPERATIONAL_STEPS, getStepRequirements } from "@cermont/domain";
import type {
	AssistantChatResponse,
	CermontOperationalStepCode,
	DomainBlocker,
} from "@cermont/shared-types";
import { NotFoundError } from "../../common/errors/AppError";
import { createLogger } from "../../common/utils/logger";
import { ServiceCase } from "../../models";
import { canAdvanceToNextStep } from "../../services/cermont-workflow-gate.service";
import { SystemConfigService } from "../system-config/system-config.service";
import { generateWithProvider, getActiveProviderName, isAiAvailable } from "./ai-provider.adapter";
import {
	draftTechnicalReport,
	findMissingDocuments,
	summarizeServiceCase,
} from "./ai-use-cases.service";

const _log = createLogger("ai-service");

// ─── System Prompt Builder ──────────────────────────────────────────────────

function buildSystemPrompt(params: {
	serviceCaseId: string;
	code: string;
	clientName: string;
	currentStepCode: CermontOperationalStepCode;
	currentStepIndex: number;
	currentModule?: string;
	userRole?: string;
	requirements: ReadonlyArray<{ required: boolean; label: string; kind: string }>;
	blockers: ReadonlyArray<{ message: string; severity: string; ownerRole: string }>;
	canAdvance: boolean;
}): string {
	const requirementLines = params.requirements
		.map((r) => `- [${r.required ? "Requerido" : "Opcional"}] ${r.label} (Tipo: ${r.kind})`)
		.join("\n");
	const blockerLines =
		params.blockers.length > 0
			? params.blockers
					.map((b) => `- ${b.message} (Responsable: ${b.ownerRole}, Severidad: ${b.severity})`)
					.join("\n")
			: "- Ninguno. Todos los requisitos están cumplidos para avanzar.";
	const moduleLine = params.currentModule
		? `- Sección actual en pantalla: ${params.currentModule}`
		: "";

	return `Eres el Asistente de IA de Cermont S.A.S., un sistema de gestión operativa para contratistas.
Tu rol es asistir al personal en el flujo de 14 pasos de la empresa.

Detalles del caso actual:
- ID del Caso: ${params.serviceCaseId}
- Código del Caso: ${params.code}
- Cliente: ${params.clientName}
- Paso Activo: ${params.currentStepCode} (${CERMONT_OPERATIONAL_STEPS[params.currentStepIndex]?.label || ""})
- Rol del Usuario: ${params.userRole || "desconocido"}
- ¿Puede avanzar al siguiente paso?: ${params.canAdvance ? "SÍ" : "NO"}
${moduleLine}

Requisitos del Paso Activo:
${requirementLines}

Bloqueadores Activos (Soportes o Aprobaciones Faltantes):
${blockerLines}

Instrucciones:
1. Responde de forma concisa y estructurada (máximo 3 párrafos o lista de viñetas).
2. Si faltan requisitos, indícale al usuario qué debe cargar o qué rol debe aprobar para avanzar.
3. Si el usuario es el responsable de un bloqueador (Responsable: ${params.userRole}), dale prioridad a esa acción.
4. Responde siempre en español.
5. Orienta tus respuestas al módulo actual si se proporciona.`;
}

// ─── Intent Detection ───────────────────────────────────────────────────────

function detectUseCaseIntent(
	message: string,
): "summarize" | "missing_docs" | "draft_report" | null {
	const lower = message.toLowerCase().trim();

	if (
		lower.includes("resumir") ||
		lower.includes("resumen") ||
		lower.includes("estado del caso") ||
		lower === "resumen del día"
	) {
		return "summarize";
	}

	if (
		lower.includes("faltante") ||
		lower.includes("falta") ||
		lower.includes("documentos pendiente") ||
		lower.includes("qué falta") ||
		lower.includes("requisitos") ||
		lower.includes("qué necesito")
	) {
		return "missing_docs";
	}

	if (
		lower.includes("redactar") ||
		lower.includes("borrador") ||
		lower.includes("informe técnico") ||
		lower === "generar informe técnico"
	) {
		return "draft_report";
	}

	return null;
}

// ─── Rule-Based Chat (Fallback when no AI) ──────────────────────────────────

async function handleUseCaseIntent(
	intent: "summarize" | "missing_docs" | "draft_report",
	serviceCaseId: string,
	_userId: string,
): Promise<{
	reply: string;
	suggestedActions: string[];
}> {
	switch (intent) {
		case "summarize": {
			const summary = await summarizeServiceCase(serviceCaseId);
			return {
				reply: `📋 **Resumen del Caso ${summary.code}**\n\n${summary.summary}`,
				suggestedActions: [
					"Ver documentos del caso",
					"Buscar faltantes",
					"Redactar informe técnico",
				],
			};
		}

		case "missing_docs": {
			const missing = await findMissingDocuments(serviceCaseId);
			const incomplete = missing.filter((m) => m.status === "incomplete");
			if (incomplete.length === 0) {
				return {
					reply: "✅ No se encontraron documentos faltantes. Todos los requisitos están cumplidos.",
					suggestedActions: ["Resumir caso", "Avanzar al siguiente paso"],
				};
			}

			const lines = incomplete.map(
				(m) => `**${m.stepLabel}**:\n${m.missing.map((d) => `- ${d}`).join("\n")}`,
			);
			return {
				reply: `📄 **Documentos Faltantes**\n\nSe encontraron los siguientes pendientes:\n\n${lines.join("\n\n")}`,
				suggestedActions: ["Subir documentos", "Resumir caso"],
			};
		}

		case "draft_report": {
			const draft = await draftTechnicalReport(serviceCaseId);
			return {
				reply: `📝 **Borrador de Informe Técnico**\n\n${draft.draftContent}`,
				suggestedActions: ["Editar borrador", "Ver ejecución", "Resumir caso"],
			};
		}

		default:
			return {
				reply:
					"No pude identificar la solicitud. Puedes preguntar por: resumen del caso, documentos faltantes, o redactar un informe.",
				suggestedActions: ["Resumir caso", "Buscar faltantes", "Redactar informe"],
			};
	}
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function processUserQuery(
	message: string,
	serviceCaseId: string,
	threadId?: string,
	currentModule?: string,
	userRole?: string,
	userId?: string,
): Promise<AssistantChatResponse> {
	const serviceCase = await ServiceCase.findById(serviceCaseId);
	if (!serviceCase) {
		throw new NotFoundError("ServiceCase", serviceCaseId);
	}

	const currentStepCode = (serviceCase.currentStepCode ||
		"step_01_work_request") as CermontOperationalStepCode;
	const normalizedCurrent = currentStepCode.startsWith("step_")
		? currentStepCode.split("_").slice(2).join("_")
		: currentStepCode;
	const currentStepIndex = CERMONT_OPERATIONAL_STEPS.findIndex((s) => s.key === normalizedCurrent);

	// Detect use case intent first
	const intent = detectUseCaseIntent(message);

	if (intent) {
		const result = await handleUseCaseIntent(intent, serviceCaseId, userId || "");
		return {
			threadId: threadId || `th_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
			reply: result.reply,
			suggestedActions: result.suggestedActions,
			blockers: [],
			currentStepKey: currentStepCode,
		};
	}

	// Check if AI is available via provider
	const featureEnabled = await SystemConfigService.isFeatureEnabled("enable_cermont_ai");
	if (!featureEnabled || !isAiAvailable()) {
		return {
			threadId: threadId || `th_degraded_${Date.now()}`,
			reply:
				"El asistente no está disponible en este momento. " +
				"Contacta al administrador del sistema para activar el servicio.\n\n" +
				"Mientras tanto, puedes usar estos comandos:\n" +
				"- **Resumir caso** — Obtén un resumen del estado actual\n" +
				"- **Buscar faltantes** — Revisa documentos pendientes\n" +
				"- **Redactar borrador** — Genera un borrador de informe técnico",
			suggestedActions: ["Resumir caso", "Buscar faltantes", "Redactar borrador"],
			blockers: [],
		};
	}

	// Build context and call the provider
	const { canAdvance, blockers } = await canAdvanceToNextStep(serviceCaseId);
	const requirements = getStepRequirements(currentStepCode);

	const systemPrompt = buildSystemPrompt({
		serviceCaseId,
		code: serviceCase.code,
		clientName: serviceCase.clientName,
		currentStepCode,
		currentStepIndex,
		currentModule,
		userRole,
		requirements,
		blockers: blockers.map((b: DomainBlocker) => ({
			message: b.message,
			severity: b.severity,
			ownerRole: b.ownerRole,
		})),
		canAdvance,
	});

	const { content: reply } = await generateWithProvider(systemPrompt, message, {
		serviceCaseId,
		threadId,
		currentModule,
		userRole,
		userId: userId || "",
	});

	const suggestedActions = blockers
		.filter((b: DomainBlocker) => !userRole || b.ownerRole === userRole)
		.map((b: DomainBlocker) => b.recommendedAction);

	return {
		threadId: threadId || `th_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
		reply,
		suggestedActions: suggestedActions.length > 0 ? suggestedActions : ["Continuar con el proceso"],
		blockers: blockers.map((b: DomainBlocker) => b.message),
		currentStepKey: currentStepCode,
	};
}

export async function processUseCase(
	useCase: "summarize" | "missing_docs" | "draft_report",
	serviceCaseId: string,
	userId: string,
): Promise<{ reply: string; suggestedActions: string[] }> {
	return handleUseCaseIntent(useCase, serviceCaseId, userId);
}

export { getActiveProviderName, isAiAvailable };
