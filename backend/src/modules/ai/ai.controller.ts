import { AIErrorResponseSchema, type AssistantChatRequest } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { requireUser } from "../../common/utils/request";
import { ServiceCase } from "../../models";
import { processUseCase, processUserQuery } from "./ai.service";
import { getActiveProviderName, isAiAvailable } from "./ai-provider.adapter";

export async function chatHandler(req: Request, res: Response) {
	try {
		const user = requireUser(req);
		const { serviceCaseId, message, threadId, currentModule } = req.body as AssistantChatRequest;

		const serviceCase = await ServiceCase.findById(serviceCaseId).lean();
		if (!serviceCase) {
			const errorResponse = AIErrorResponseSchema.parse({
				success: false as const,
				error: {
					code: "INVALID_SERVICE_CASE" as const,
					message: "El caso de servicio no existe",
				},
			});
			res.status(404).json(errorResponse);
			return;
		}

		if (user.role === "cliente" && String(serviceCase.clientId) !== String(user._id)) {
			const errorResponse = AIErrorResponseSchema.parse({
				success: false as const,
				error: {
					code: "UNAUTHORIZED" as const,
					message: "No está autorizado para acceder a este caso de servicio.",
				},
			});
			res.status(403).json(errorResponse);
			return;
		}

		const responseData = await processUserQuery(
			message,
			serviceCaseId,
			threadId,
			currentModule,
			user.role,
			String(user._id),
		);

		res.json({
			success: true,
			data: responseData,
		});
	} catch (error) {
		if (error instanceof AppError) {
			const errorResponse = AIErrorResponseSchema.parse({
				success: false as const,
				error: {
					code:
						error.code === "AI_SERVICE_UNAVAILABLE"
							? ("AI_SERVICE_UNAVAILABLE" as const)
							: error.code === "RATE_LIMITED"
								? ("RATE_LIMITED" as const)
								: ("INTERNAL_ERROR" as const),
					message: error.message || "Error interno del asistente",
				},
			});
			res.status(error.statusCode).json(errorResponse);
			return;
		}

		const errorResponse = AIErrorResponseSchema.parse({
			success: false as const,
			error: {
				code: "INTERNAL_ERROR" as const,
				message: "Error inesperado en el asistente",
			},
		});
		res.status(500).json(errorResponse);
	}
}

export async function useCaseHandler(req: Request, res: Response) {
	try {
		const user = requireUser(req);
		const { serviceCaseId, useCase } = req.body as {
			serviceCaseId: string;
			useCase: "summarize" | "missing_docs" | "draft_report";
		};

		const serviceCase = await ServiceCase.findById(serviceCaseId).lean();
		if (!serviceCase) {
			const errorResponse = AIErrorResponseSchema.parse({
				success: false as const,
				error: {
					code: "INVALID_SERVICE_CASE" as const,
					message: "El caso de servicio no existe",
				},
			});
			res.status(404).json(errorResponse);
			return;
		}

		const result = await processUseCase(useCase, serviceCaseId, String(user._id));

		res.json({
			success: true,
			data: result,
		});
	} catch (error) {
		if (error instanceof AppError) {
			const errorResponse = AIErrorResponseSchema.parse({
				success: false as const,
				error: {
					code: "INTERNAL_ERROR" as const,
					message: error.message,
				},
			});
			res.status(error.statusCode).json(errorResponse);
			return;
		}

		const errorResponse = AIErrorResponseSchema.parse({
			success: false as const,
			error: {
				code: "INTERNAL_ERROR" as const,
				message: "Error inesperado en el asistente",
			},
		});
		res.status(500).json(errorResponse);
	}
}

export async function statusHandler(_req: Request, res: Response) {
	const available = isAiAvailable();
	res.json({
		success: true,
		data: {
			status: available ? "available" : "unavailable",
			enabled: available,
			provider: getActiveProviderName(),
			capabilities: ["assistant_chat", "summarize_case", "find_missing_docs", "draft_report"],
			version: "2.0",
		},
	});
}
