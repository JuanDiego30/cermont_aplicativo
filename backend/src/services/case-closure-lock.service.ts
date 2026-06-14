import { NotFoundError, UnprocessableError } from "../common/errors/AppError";
import { ServiceCase } from "../models/ServiceCase";

const LOCKED_SERVICE_CASE_STAGES = new Set(["paid", "archived", "cancelled"]);

export function isLockedServiceCaseStage(stage: string): boolean {
	return LOCKED_SERVICE_CASE_STAGES.has(stage);
}

export function assertServiceCaseStageMutable(stage: string): void {
	if (isLockedServiceCaseStage(stage)) {
		throw new UnprocessableError(
			`Service case is locked in terminal stage "${stage}"`,
			"SERVICE_CASE_LOCKED",
		);
	}
}

export async function assertServiceCaseMutable(serviceCaseId: string): Promise<void> {
	const serviceCase = await ServiceCase.findById(serviceCaseId)
		.select("currentStage")
		.lean<{ currentStage: string }>();

	if (!serviceCase) {
		throw new NotFoundError("ServiceCase", serviceCaseId);
	}

	assertServiceCaseStageMutable(serviceCase.currentStage);
}
