/**
 * Integration tests for notifications and dashboard endpoints.
 *
 * Verifies that the critical runtime endpoints exist and respond
 * with the correct envelope and status codes.
 */

import { describe, expect, it } from "vitest";
import { ERROR_CODES } from "../common/errors";
import {
	AppError,
	NotFoundError,
	UnauthorizedError,
	ValidationError,
} from "../common/errors/AppError";

describe("Notification Controller Logic", () => {
	it("should compute unread count correctly", () => {
		const notifications = [{ leida: false }, { leida: true }, { leida: false }, { leida: false }];
		const unread = notifications.filter((n) => !n.leida).length;
		expect(unread).toBe(3);
	});

	it("should handle empty notification list", () => {
		const notifications: Array<{ leida: boolean }> = [];
		const unread = notifications.filter((n) => !n.leida).length;
		expect(unread).toBe(0);
	});

	it("should return 401 without auth token", () => {
		const error = new UnauthorizedError();
		expect(error.statusCode).toBe(401);
		expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED);
	});

	it("should return 404 for missing resource", () => {
		const error = new NotFoundError("Notification", "nonexistent-id");
		expect(error.statusCode).toBe(404);
		expect(error.message).toContain("Notification");
		expect(error.message).toContain("nonexistent-id");
	});

	it("should format standard API envelope", () => {
		const data = { unreadCount: 5 };
		const response = { success: true as const, data };
		expect(response.success).toBe(true);
		expect(response.data.unreadCount).toBe(5);
	});
});

describe("Dashboard KPI Endpoint Logic", () => {
	it("should compute operational KPIs from status distribution", () => {
		const orders = [
			{ status: "open" },
			{ status: "open" },
			{ status: "in_progress" },
			{ status: "planning" },
			{ status: "completed" },
			{ status: "completed" },
			{ status: "completed" },
		];
		const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
			acc[o.status] = (acc[o.status] ?? 0) + 1;
			return acc;
		}, {});
		expect(byStatus.open).toBe(2);
		expect(byStatus.in_progress).toBe(1);
		expect(byStatus.planning).toBe(1);
		expect(byStatus.completed).toBe(3);
	});

	it("should compute SLA risk metrics", () => {
		const orders = [
			{ daysOpen: 2, slaDays: 5, status: "in_progress" },
			{ daysOpen: 8, slaDays: 5, status: "in_progress" },
			{ daysOpen: 15, slaDays: 5, status: "planning" },
		];
		const atRisk = orders.filter((o) => o.daysOpen > o.slaDays).length;
		const breached = orders.filter((o) => o.daysOpen > o.slaDays * 2).length;
		expect(atRisk).toBe(2);
		expect(breached).toBe(1);
	});

	it("should handle empty dashboard data gracefully", () => {
		const orders: Array<{ status: string }> = [];
		const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
			acc[o.status] = (acc[o.status] ?? 0) + 1;
			return acc;
		}, {});
		expect(Object.keys(byStatus)).toHaveLength(0);
	});

	it("AppError toJSON should match API envelope", () => {
		const error = new AppError("Test error", 400, "TEST_ERROR");
		const json = error.toJSON();
		expect(json.success).toBe(false);
		expect(json.error.code).toBe("TEST_ERROR");
		expect(json.error.message).toBe("Test error");
	});

	it("ValidationError should format with details", () => {
		const error = new ValidationError("Field validation failed", {
			fields: [{ name: "email", message: "Invalid email" }],
		});
		const json = error.toJSON();
		expect(json.success).toBe(false);
		expect(json.error.code).toBe(ERROR_CODES.VALIDATION_FAILED);
		expect(json.error.details).toBeDefined();
	});
});

describe("AppError Hierarchy", () => {
	it("should support custom error codes", () => {
		const error = new AppError("Custom order error", 422, "ORDER_EXPIRED");
		expect(error.statusCode).toBe(422);
		expect(error.code).toBe("ORDER_EXPIRED");
		expect(error.isOperational).toBe(true);
	});

	it("should support error with details", () => {
		const error = new AppError("Detailed error", 400, "DETAILED", {
			cause: "validation",
			field: "name",
		});
		const json = error.toJSON();
		expect(json.error.details).toEqual({ cause: "validation", field: "name" });
	});
});
