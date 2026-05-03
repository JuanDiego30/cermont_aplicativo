/**
 * Resource Business Rules
 *
 * Pure business invariants for the Resource bounded context.
 * These rules are framework-agnostic and contain no infrastructure concerns.
 */

import type { ResourceStatus, ResourceType } from "@cermont/shared-types";
import type { MaintenanceState, ResourceAvailability, ResourceCategory } from "./types";

/**
 * Resource availability rules
 * Maps status to availability based on business rules
 */
export function getAvailabilityFromStatus(status: ResourceStatus): ResourceAvailability {
	const availabilityMap: Record<ResourceStatus, ResourceAvailability> = {
		available: "available",
		in_use: "reserved",
		maintenance: "maintenance",
	};
	return availabilityMap[status];
}

/**
 * Maintenance state calculation rules
 * Determines if maintenance is required based on dates and status
 */
export function calculateMaintenanceState(
	maintenanceDate: Date | undefined,
	status: ResourceStatus,
): MaintenanceState {
	const now = new Date();

	// Resources in maintenance always require maintenance
	if (status === "maintenance") {
		return {
			requiresMaintenance: true,
			nextMaintenanceDate: maintenanceDate ?? null,
			daysOverdue: maintenanceDate
				? Math.floor((now.getTime() - maintenanceDate.getTime()) / (1000 * 60 * 60 * 24))
				: 0,
		};
	}

	// Resources without a maintenance date don't require maintenance
	if (!maintenanceDate) {
		return {
			requiresMaintenance: false,
			nextMaintenanceDate: null,
			daysOverdue: 0,
		};
	}

	// Calculate days until/overdue for maintenance
	const daysDiff = Math.floor((now.getTime() - maintenanceDate.getTime()) / (1000 * 60 * 60 * 24));
	const isOverdue = daysDiff > 0;

	return {
		requiresMaintenance: isOverdue,
		nextMaintenanceDate: maintenanceDate,
		daysOverdue: isOverdue ? daysDiff : 0,
	};
}

/**
 * Resource category inference rules
 * Maps resource type to category based on business rules
 */
export function inferCategoryFromType(type: ResourceType): ResourceCategory {
	const categoryMap: Record<ResourceType, ResourceCategory> = {
		tool: "tool",
		equipment: "equipment",
		vehicle: "vehicle",
	};
	return categoryMap[type];
}

/**
 * Status transition validation rules
 * Defines valid status transitions based on business workflows
 */
export function isValidStatusTransition(
	currentStatus: ResourceStatus,
	newStatus: ResourceStatus,
): boolean {
	const validTransitions: Record<ResourceStatus, ResourceStatus[]> = {
		available: ["in_use", "maintenance"],
		in_use: ["available", "maintenance"],
		maintenance: ["available"],
	};

	return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Resource name validation rules
 */
export function isValidResourceName(name: string): boolean {
	const trimmed = name.trim();
	const minLength = 1;
	const maxLength = 200;

	return trimmed.length >= minLength && trimmed.length <= maxLength;
}

/**
 * Serial number validation rules
 */
export function isValidSerialNumber(serial: string): boolean {
	const trimmed = serial.trim();
	return trimmed.length >= 1;
}

/**
 * Business rule: Check if resource can be assigned to an order
 */
export function canBeAssignedToOrder(status: ResourceStatus): boolean {
	return status === "available";
}

/**
 * Business rule: Check if resource can be put in maintenance
 */
export function canBePutInMaintenance(status: ResourceStatus): boolean {
	return status !== "maintenance";
}

/**
 * Business rule: Check if resource requires maintenance check
 */
export function requiresMaintenanceCheck(
	maintenanceDate: Date | undefined,
	status: ResourceStatus,
	thresholdDays: number = 30,
): boolean {
	if (status === "maintenance") {
		return true;
	}

	if (!maintenanceDate) {
		return false;
	}

	const daysSinceMaintenance = Math.floor(
		(Date.now() - maintenanceDate.getTime()) / (1000 * 60 * 60 * 24),
	);

	return daysSinceMaintenance >= thresholdDays;
}
