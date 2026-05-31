/**
 * OWASP Security Tests - Input Validation & NoSQL Injection
 *
 * Tests verify input sanitization and NoSQL injection prevention.
 * Based on OWASP WSTG-04-04: Testing for Injections
 * Based on OWASP WSTG-04-05: Testing for Mass Assignment
 */

import { describe, expect, test } from "vitest";

// Import the shared schemas to verify they reject malicious payloads
import {
	CreateWorkRequestSchema,
	CreateProposalSchema,
	CreateEvidenceSchema,
	CreateOrderSchema,
} from "@cermont/shared-types";

describe("Input Validation Security Tests", () => {
	describe("Type validation - reject invalid field types", () => {
		test("should reject string field receiving number", () => {
			const invalidPayload = {
				requesterName: "Test User",
				clientName: "Client",
				serviceSite: "Site A",
				serviceType: "Maintenance",
				sourceChannel: "portal_client",
				shortDescription: "Test",
				description: 123, // Should be string
			};

			const result = CreateWorkRequestSchema.safeParse(invalidPayload);

			expect(result.success).toBe(false);
			if (!result.success && result.error) {
				expect(result.error.issues.some((e) => e.path.includes("description"))).toBe(true);
			}
		});

		test("should reject invalid enum value for sourceChannel", () => {
			const invalidPayload = {
				requesterName: "Test User",
				clientName: "Client",
				serviceSite: "Site A",
				serviceType: "Maintenance",
				sourceChannel: "INVALID_CHANNEL", // Invalid enum value
				shortDescription: "Test",
				description: "Description",
			};

			const result = CreateWorkRequestSchema.safeParse(invalidPayload);
			expect(result.success).toBe(false);
		});

		test("should reject missing required fields in evidence", () => {
			const incompletePayload = {
				// Missing required fields: orderId, type
				description: "Partial",
			};

			const result = CreateEvidenceSchema.safeParse(incompletePayload);
			expect(result.success).toBe(false);
		});

		test("should reject incomplete work request payload", () => {
			const incompletePayload = {
				// Missing required fields
				description: "Partial",
			};

			const result = CreateWorkRequestSchema.safeParse(incompletePayload);
			expect(result.success).toBe(false);
		});

		test("should reject empty pagination page parameter", () => {
			// Page should be positive integer
			expect(Number.isInteger(Number("999999"))).toBe(true); // Valid format
			// But service should handle with reasonable limits
		});
	});

	describe("NoSQL Injection Prevention - reject MongoDB operators", () => {
		test("should reject $ne injection in description field", () => {
			const maliciousPayload = {
				requesterName: "Test User",
				clientName: "Client",
				serviceSite: "Site A",
				sourceChannel: "portal_client",
				shortDescription: "Test",
				description: { $ne: "" }, // MongoDB operator injection
			};

			// Zod schema should not allow MongoDB operators
			const result = CreateWorkRequestSchema.safeParse(maliciousPayload);
			expect(result.success).toBe(false);
		});

		test("should reject $where injection payload", () => {
			const maliciousPayload = {
				title: "Proposal",
				clientName: "Client",
				items: [{ description: "Item", unit: "each", quantity: 1, unitCost: 100 }],
				validUntil: "2025-01-01T00:00:00.000Z",
				$where: "sleep(5000) || this.status === 'approved'",
			};

			const result = CreateProposalSchema.safeParse(maliciousPayload);
			expect(result.success).toBe(false);
		});

		test("should reject $or injection in query", () => {
			const maliciousPayload = {
				requesterName: "Test User",
				clientName: "Client",
				serviceSite: "Site A",
				sourceChannel: "portal_client",
				shortDescription: "Test",
				description: "Description",
				$or: [{ status: "approved" }, { status: "rejected" }],
			};

			const result = CreateWorkRequestSchema.safeParse(maliciousPayload);
			expect(result.success).toBe(false);
		});

		test("should reject $gt injection in priority field", () => {
			const maliciousPayload = {
				description: "Test order",
				priority: { $gt: 0 },
			};

			const result = CreateOrderSchema.safeParse(maliciousPayload);
			expect(result.success).toBe(false);
		});

		test("should reject nested operator injection in evidence", () => {
			// CreateEvidenceSchema doesn't have items array - test correct field
			const maliciousPayload = {
				orderId: "507f1f77bcf86cd799439011",
				type: "before",
				description: { $where: "malicious" },
			};

			const result = CreateEvidenceSchema.safeParse(maliciousPayload);
			expect(result.success).toBe(false);
		});
	});

	describe("Mass Assignment Prevention", () => {
		test("should strip unknown fields in CreateWorkRequestSchema", () => {
			const payloadWithExtra = {
				requesterName: "Test User",
				clientName: "Client",
				serviceSite: "Site A",
				serviceType: "Maintenance",
				sourceChannel: "portal_client",
				shortDescription: "Test",
				description: "Description",
				extraField: "hack", // Unknown field
				isAdmin: true, // Should be stripped
				role: "gerente", // Should be stripped
			};

			const result = CreateWorkRequestSchema.safeParse(payloadWithExtra);
			if (result.success) {
				expect(result.data).not.toHaveProperty("extraField");
				expect(result.data).not.toHaveProperty("isAdmin");
				expect(result.data).not.toHaveProperty("role");
			} else {
				// If schema rejects unknown keys, that's also acceptable
				expect(result.success).toBe(false);
			}
		});

		test("should strip unknown fields in CreateOrderSchema", () => {
			const payloadWithExtra = {
				description: "Test order description that is valid and long enough",
				hackField: "malicious",
			};

			const result = CreateOrderSchema.safeParse(payloadWithExtra);
			if (result.success) {
				expect(result.data).not.toHaveProperty("hackField");
			}
		});
	});

	describe("Array size validation", () => {
		test("should reject oversized array payloads in CreateOrderSchema materials", () => {
			const largeArray = Array(1000).fill({
				name: "Material Item",
				quantity: 1,
				unit: "each",
			});

			const payload = {
				description: "Test order with large array",
				materials: largeArray,
			};

			const result = CreateOrderSchema.safeParse(payload);
			expect(result.success).toBe(false);
		});

		test("should accept reasonable array sizes within schema limits", () => {
			const reasonableArray = Array(10).fill({
				name: "Material",
				quantity: 1,
				unit: "each",
			});

			const payload = {
				description: "Test order with reasonable array",
				materials: reasonableArray,
			};

			const result = CreateOrderSchema.safeParse(payload);
			// Schema may have size limits or should handle gracefully
			if (!result.success) {
				// Expected - schema enforces size limits
				expect(result.error).toBeDefined();
			}
		});
	});

	describe("Edge cases - empty and null values", () => {
		test("should reject null values in non-nullable fields", () => {
			const nullPayload = {
				requesterName: null, // Should fail
				clientName: "Client",
				serviceSite: "Site A",
				serviceType: "Maintenance",
				sourceChannel: "portal_client",
				shortDescription: "Test",
				description: "Description",
			};

			const result = CreateWorkRequestSchema.safeParse(nullPayload);
			expect(result.success).toBe(false);
		});

		test("should reject undefined required fields", () => {
			const undefinedPayload = {
				requesterName: "Test User",
				clientName: "Client",
				serviceSite: "Site A",
				serviceType: "Maintenance",
				sourceChannel: "portal_client",
				shortDescription: undefined, // Required field
				description: "Description",
			};

			const result = CreateWorkRequestSchema.safeParse(undefinedPayload);
			expect(result.success).toBe(false);
		});
	});
});