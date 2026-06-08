import type { AssistantChatRequest } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { requireUser } from "../../common/utils/request";
import { ServiceCase } from "../../models";
import { NotFoundError, ForbiddenError } from "../../common/errors/AppError";
import { processUserQuery } from "./ai.service";

export async function chatHandler(req: Request, res: Response) {
	const user = requireUser(req);
	const { serviceCaseId, message, threadId, currentModule } = req.body as AssistantChatRequest;

	const serviceCase = await ServiceCase.findById(serviceCaseId).lean();
	if (!serviceCase) {
		throw new NotFoundError("ServiceCase", serviceCaseId);
	}

	// Basic RBAC: Gerente, residente, and supervisor can see any case.
	// Cliente can only see their own cases.
	if (user.role === "cliente" && String(serviceCase.clientId) !== String(user._id)) {
		throw new ForbiddenError("No está autorizado para acceder a este caso de servicio.");
	}

	const responseData = await processUserQuery(message, serviceCaseId, threadId, currentModule, user.role);

	res.json({
		success: true,
		data: responseData,
	});
}
