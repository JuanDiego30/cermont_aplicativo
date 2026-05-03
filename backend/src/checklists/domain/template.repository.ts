import type { ChecklistTemplateDocument } from "@cermont/shared-types";

export interface IChecklistTemplateRepository {
	findAll(): Promise<ChecklistTemplateDocument[]>;
	findById(id: string): Promise<ChecklistTemplateDocument | null>;
	create(data: Partial<ChecklistTemplateDocument>): Promise<ChecklistTemplateDocument>;
	update(
		id: string,
		data: Partial<ChecklistTemplateDocument>,
	): Promise<ChecklistTemplateDocument | null>;
	delete(id: string): Promise<boolean>;
}
