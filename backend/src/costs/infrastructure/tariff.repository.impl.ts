import { Types } from "mongoose";
import type {
	CreateTariffRecord,
	ITariffRepository,
	TariffRecord,
	UpdateTariffRecord,
} from "../domain/tariff.repository";
import { Tariff } from "./tariff.model";

function toObjectId(id: string): Types.ObjectId {
	return new Types.ObjectId(id);
}

export class TariffRepository implements ITariffRepository {
	async list(): Promise<TariffRecord[]> {
		const tariffs = await Tariff.find({}).sort({ role: 1, effectiveFrom: -1 }).lean();
		return tariffs as TariffRecord[];
	}

	async create(data: CreateTariffRecord): Promise<TariffRecord> {
		const tariff = await Tariff.create({
			role: data.role,
			hourlyRateCOP: data.hourlyRateCOP,
			overtimeMultiplier: data.overtimeMultiplier,
			effectiveFrom: data.effectiveFrom,
			createdBy: toObjectId(data.createdBy),
		});
		return tariff as TariffRecord;
	}

	async update(id: string, data: UpdateTariffRecord): Promise<TariffRecord | false> {
		const tariff = await Tariff.findByIdAndUpdate(
			id,
			{
				...(data.role ? { role: data.role } : {}),
				...("hourlyRateCOP" in data ? { hourlyRateCOP: data.hourlyRateCOP } : {}),
				...("overtimeMultiplier" in data ? { overtimeMultiplier: data.overtimeMultiplier } : {}),
				...(data.effectiveFrom ? { effectiveFrom: data.effectiveFrom } : {}),
			},
			{ new: true, runValidators: true },
		);
		return tariff ? (tariff as TariffRecord) : false;
	}

	async findEffectiveForRole(
		role: TariffRecord["role"],
		effectiveAt: Date,
	): Promise<TariffRecord | false> {
		const tariff = await Tariff.findOne({
			role,
			effectiveFrom: { $lte: effectiveAt },
		})
			.sort({ effectiveFrom: -1 })
			.lean();
		return tariff ? (tariff as TariffRecord) : false;
	}
}
