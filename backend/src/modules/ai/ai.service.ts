/**
 * AI Service — Business Logic Layer
 *
 * Provides contextual AI processing for the Cermont AI Assistant.
 */

import {
	getStepRequirements,
	buildBlockers,
	CERMONT_OPERATIONAL_STEPS,
	type ServiceCaseWorkflowSnapshot,
	type CermontOperationalStepStatus,
} from "@cermont/domain";
import type { AssistantChatResponse, CermontOperationalStepCode } from "@cermont/shared-types";
import { ServiceCase } from "../../models";
import { buildWorkflowContext } from "../service-cases/service-case.service";
import { ServiceUnavailableError, NotFoundError } from "../../common/errors/AppError";

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildStepStatuses(currentStepIndex: number): Record<string, CermontOperationalStepStatus> {
	const statuses: Record<string, CermontOperationalStepStatus> = {};
	for (let i = 0; i < CERMONT_OPERATIONAL_STEPS.length; i++) {
		const step = CERMONT_OPERATIONAL_STEPS[i];
		if (i < currentStepIndex) {
			statuses[step.key] = "completed";
		} else if (i === currentStepIndex) {
			statuses[step.key] = "in_progress";
		} else {
			statuses[step.key] = "pending";
		}
	}
	return statuses;
}

function buildSystemPrompt(params: {
	serviceCaseId: string;
	code: string;
	clientName: string;
	currentStepCode: CermontOperationalStepCode;
	currentStepIndex: number;
	currentModule?: string;
	userRole?: string;
	requirements: ReadonlyArray<{ required: boolean; label: string; kind: string }>;
	blockers: ReadonlyArray<{ message: string; severity: string }>;
}): string {
	const requirementLines = params.requirements
		.map((r) => `- [${r.required ? "Requerido" : "Opcional"}] ${r.label} (Tipo: ${r.kind})`)
		.join("\n");
	const blockerLines =
		params.blockers.length > 0
			? params.blockers.map((b) => `- ${b.message} (Severidad: ${b.severity})`).join("\n")
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
${moduleLine}

Requisitos del Paso Activo:
${requirementLines}

Bloqueadores Activos (Soportes o Aprobaciones Faltantes):
${blockerLines}

Instrucciones:
1. Responde de forma concisa y estructurada (máximo 3 párrafos o lista de viñetas).
2. Si faltan requisitos, indícale al usuario qué debe cargar o qué rol debe aprobar para avanzar.
3. Responde siempre en español.
4. Orienta tus respuestas al módulo actual si se proporciona.`;
}

async function callOpenAI(systemPrompt: string, message: string): Promise<string> {
	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
		},
		body: JSON.stringify({
			model: "gpt-4o-mini",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: message },
			],
			temperature: 0.7,
		}),
	});

	if (!response.ok) {
		const errText = await response.text();
		throw new ServiceUnavailableError(
			`Error en el proveedor de IA: ${errText}`,
			"AI_SERVICE_UNAVAILABLE",
		);
	}

	const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
	return data.choices?.[0]?.message?.content || "";
}

async function callGemini(systemPrompt: string, message: string): Promise<string> {
	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				contents: [{ role: "user", parts: [{ text: systemPrompt }, { text: message }] }],
				generationConfig: { temperature: 0.7 },
			}),
		},
	);

	if (!response.ok) {
		const errText = await response.text();
		throw new ServiceUnavailableError(
			`Error en el proveedor de IA: ${errText}`,
			"AI_SERVICE_UNAVAILABLE",
		);
	}

	const data = (await response.json()) as {
		candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
	};
	return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function requestCompletion(systemPrompt: string, message: string): Promise<string> {
	if (process.env.OPENAI_API_KEY) {
		return callOpenAI(systemPrompt, message);
	}
	if (process.env.GEMINI_API_KEY) {
		return callGemini(systemPrompt, message);
	}
	return "";
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function processUserQuery(
	message: string,
	serviceCaseId: string,
	threadId?: string,
	currentModule?: string,
	userRole?: string,
): Promise<AssistantChatResponse> {
	const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new ServiceUnavailableError(
			"Asistente no disponible temporalmente",
			"AI_SERVICE_UNAVAILABLE",
		);
	}

	const serviceCase = await ServiceCase.findById(serviceCaseId);
	if (!serviceCase) {
		throw new NotFoundError("ServiceCase", serviceCaseId);
	}

	const currentStepCode = (serviceCase.currentStepCode || "step_01_work_request") as CermontOperationalStepCode;
	const normalizedCurrent = currentStepCode.startsWith("step_")
		? currentStepCode.split("_").slice(2).join("_")
		: currentStepCode;

	const currentStepIndex = CERMONT_OPERATIONAL_STEPS.findIndex((s) => s.key === normalizedCurrent);
	const snapshot: ServiceCaseWorkflowSnapshot = {
		currentStepKey: currentStepCode,
		stepStatuses: buildStepStatuses(currentStepIndex),
	};

	const workflowContext = await buildWorkflowContext(serviceCaseId);
	const blockers = buildBlockers(snapshot, workflowContext);
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
		blockers,
	});

	const reply = await requestCompletion(systemPrompt, message);

	return {
		threadId: threadId || `th_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
		reply,
		suggestedActions: blockers.map((b) => b.message),
		blockers: blockers.map((b) => b.message),
		currentStepKey: currentStepCode,
	};
}
