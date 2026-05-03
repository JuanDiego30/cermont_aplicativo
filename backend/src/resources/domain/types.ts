/**
 * Resource Domain Types
 *
 * Framework-agnostic domain types for the Resource bounded context.
 * These types define the core business entities without any infrastructure concerns.
 */

import type { ResourceStatus, ResourceType } from "@cermont/shared-types";

/**
 * Resource availability state derived from status
 */
export type ResourceAvailability = "available" | "unavailable" | "maintenance" | "reserved";

/**
 * Resource category for classification
 * Note: This maps 1:1 with ResourceType from shared-types
 */
export type ResourceCategory = "tool" | "equipment" | "vehicle";

/**
 * Resource maintenance state
 */
export interface MaintenanceState {
	requiresMaintenance: boolean;
	nextMaintenanceDate: Date | null;
	daysOverdue: number;
}

/**
 * Resource usage statistics
 */
export interface ResourceUsageStats {
	totalOrders: number;
	activeOrders: number;
	lastUsedAt: Date | null;
}

/**
 * Domain resource interface (framework-agnostic)
 * This is the core domain entity, independent of MongoDB or any other persistence mechanism.
 */
export interface DomainResource {
	id: string;
	name: string;
	type: ResourceType;
	status: ResourceStatus;
	description?: string;
	serialNumber?: string;
	purchaseDate?: Date;
	maintenanceDate?: Date;
	category: ResourceCategory;
	availability: ResourceAvailability;
	maintenanceState: MaintenanceState;
}

/**
 * Value object for resource identifiers
 */
export class ResourceId {
	constructor(private readonly value: string) {
		if (!value || value.trim().length === 0) {
			throw new Error("ResourceId cannot be empty");
		}
	}

	toString(): string {
		return this.value;
	}

	equals(other: ResourceId): boolean {
		return this.value === other.value;
	}
}

/**
 * Factory for creating domain resources from persistence data
 */
export interface ResourceFactory {
	fromPersistence(data: unknown): DomainResource;
	create(props: ResourceCreateProps): DomainResource;
}

export interface ResourceCreateProps {
	name: string;
	type: ResourceType;
	description?: string;
	serialNumber?: string;
	purchaseDate?: Date;
}
