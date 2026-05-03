import type {
	ChecklistTemplate,
	CreateChecklistTemplateInput,
	UpdateChecklistTemplateInput,
} from "@cermont/shared-types";
import { NotFoundError } from "../../_shared/common/errors";
import { container } from "../../_shared/config/container";

type CreateTemplatePayload = CreateChecklistTemplateInput & { createdBy: string };

/**
 * List all active checklist templates.
 */
export async function listTemplates(): Promise<ChecklistTemplate[]> {
	const templates = await container.checklistTemplateRepository.findAll();
	return templates as unknown as ChecklistTemplate[];
}

/**
 * Create a new checklist template.
 */
export async function createTemplate(
	payload: CreateChecklistTemplateInput,
	actorId: string,
): Promise<ChecklistTemplate> {
	const createPayload: CreateTemplatePayload = {
		...payload,
		createdBy: actorId,
	};
	const template = await container.checklistTemplateRepository.create(createPayload);
	return template as unknown as ChecklistTemplate;
}

/**
 * Get checklist template by ID.
 */
export async function getTemplateById(id: string): Promise<ChecklistTemplate> {
	const template = await container.checklistTemplateRepository.findById(id);
	if (!template) {
		throw new NotFoundError("ChecklistTemplate", id);
	}
	return template as unknown as ChecklistTemplate;
}

/**
 * Update a checklist template.
 */
export async function updateTemplate(
	id: string,
	payload: UpdateChecklistTemplateInput,
): Promise<ChecklistTemplate> {
	const template = await container.checklistTemplateRepository.update(id, payload);
	if (!template) {
		throw new NotFoundError("ChecklistTemplate", id);
	}
	return template as unknown as ChecklistTemplate;
}
