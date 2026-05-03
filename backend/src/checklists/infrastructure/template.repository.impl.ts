import type { ChecklistTemplateDocument } from "@cermont/shared-types";
import type { IChecklistTemplateRepository } from "../domain/template.repository";
import { ChecklistTemplate } from "./template.model";

export class ChecklistTemplateRepository implements IChecklistTemplateRepository {
	async findAll(): Promise<ChecklistTemplateDocument[]> {
		const templates = await ChecklistTemplate.find({ isActive: true }).sort({ name: 1 }).lean();
		return templates as unknown as ChecklistTemplateDocument[];
	}

	async findById(id: string): Promise<ChecklistTemplateDocument | null> {
		const template = await ChecklistTemplate.findById(id).lean();
		return template as unknown as ChecklistTemplateDocument | null;
	}

	async create(data: Partial<ChecklistTemplateDocument>): Promise<ChecklistTemplateDocument> {
		const template = new ChecklistTemplate(data);
		const saved = await template.save();
		return saved.toObject() as unknown as ChecklistTemplateDocument;
	}

	async update(
		id: string,
		data: Partial<ChecklistTemplateDocument>,
	): Promise<ChecklistTemplateDocument | null> {
		const updated = await ChecklistTemplate.findByIdAndUpdate(id, data, { new: true }).lean();
		return updated as unknown as ChecklistTemplateDocument | null;
	}

	async delete(id: string): Promise<boolean> {
		const result = await ChecklistTemplate.findByIdAndUpdate(id, { isActive: false });
		return !!result;
	}
}
