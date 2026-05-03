import type { ICostControlRepository } from "../domain/cost-control.repository";
import type { ICostControl } from "./cost-control.model";
import { CostControl } from "./cost-control.model";

type CostControlDocumentWithMethods = ICostControl & {
	save: () => Promise<ICostControl>;
};

function hasSaveMethod(costControl: ICostControl): costControl is CostControlDocumentWithMethods {
	return typeof (costControl as { save?: unknown }).save === "function";
}

export class CostControlRepository implements ICostControlRepository {
	async findOne(filter: Record<string, unknown>): Promise<ICostControl | null> {
		const doc = await CostControl.findOne(filter);
		return doc as unknown as ICostControl;
	}

	async findOneLean(filter: Record<string, unknown>): Promise<ICostControl | null> {
		const doc = await CostControl.findOne(filter).lean();
		return doc as unknown as ICostControl;
	}

	async create(data: Partial<ICostControl>): Promise<ICostControl> {
		const doc =
			typeof CostControl.create === "function"
				? await CostControl.create(data)
				: new CostControl(data);

		if (hasSaveMethod(doc as unknown as ICostControl)) {
			await (doc as unknown as CostControlDocumentWithMethods).save();
		}

		return doc as unknown as ICostControl;
	}

	async save(costControl: ICostControl): Promise<ICostControl> {
		if (hasSaveMethod(costControl)) {
			return costControl.save();
		}

		const doc = await CostControl.findById(
			(costControl as { _id: { toString(): string } })._id.toString(),
		);
		if (!doc) {
			throw new Error("Document not found for saving");
		}

		Object.assign(doc, costControl);
		return doc.save() as unknown as ICostControl;
	}
}
