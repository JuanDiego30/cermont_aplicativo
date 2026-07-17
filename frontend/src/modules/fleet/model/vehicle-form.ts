import { type CreateVehicleInput, CreateVehicleSchema } from "@cermont/shared-types";
import type { z } from "zod";

export type CreateVehicleFormValues = z.input<typeof CreateVehicleSchema>;

export type VehicleDateField =
	| "soatExpiry"
	| "technoMechanicalExpiry"
	| "insuranceExpiry"
	| "lastMaintenanceAt";

export function createInitialVehicleValues(): CreateVehicleInput {
	return {
		plate: "",
		brand: "",
		model: "",
		year: new Date().getFullYear(),
		type: "camioneta",
		kilometers: 0,
		status: "active",
		documents: [],
	};
}

export function toIsoDateTime(value: string): string {
	return `${value}T00:00:00.000Z`;
}

export function toDateInputValue(value: CreateVehicleInput[VehicleDateField]): string {
	return value ? value.slice(0, 10) : "";
}

export function toNumberInputValue(value: CreateVehicleInput["nextMaintenanceKm"]): string {
	return typeof value === "number" ? String(value) : "";
}

export function parseCreateVehicleInput(values: CreateVehicleFormValues): CreateVehicleInput {
	return CreateVehicleSchema.parse(values);
}
