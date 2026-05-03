import type { Tariff } from "@cermont/shared-types";

export interface TariffRecord {
	_id: { toString(): string };
	role: Tariff["role"];
	hourlyRateCOP: number;
	overtimeMultiplier: number;
	effectiveFrom: Date;
	createdBy?: { toString(): string } | string;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateTariffRecord {
	role: Tariff["role"];
	hourlyRateCOP: number;
	overtimeMultiplier: number;
	effectiveFrom: Date;
	createdBy: string;
}

export interface UpdateTariffRecord {
	role?: Tariff["role"];
	hourlyRateCOP?: number;
	overtimeMultiplier?: number;
	effectiveFrom?: Date;
}

export interface ITariffRepository {
	list(): Promise<TariffRecord[]>;
	create(data: CreateTariffRecord): Promise<TariffRecord>;
	update(id: string, data: UpdateTariffRecord): Promise<TariffRecord | false>;
	findEffectiveForRole(role: Tariff["role"], effectiveAt: Date): Promise<TariffRecord | false>;
}
