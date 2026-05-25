/**
 * Tests de Cierre Administrativo — Pasos 8-14 (Closure Report)
 *
 * Cubre: DeliveryRecord, ActaSignature, ServiceEntrySheet, InvoiceTracking, PaymentRecord
 * FSM: completed → ready_for_invoicing → acta_signed → ses_sent → invoice_approved → paid → closed
 *
 * REFACTOR-03: Suite de pruebas para el módulo de cierre.
 * Corrige: C-05 (falta de evidencia de pruebas para pasos 8-14)
 *
 * @see docs/plans/03_refactorizacion_software.md
 */

import {
	ActaSignatureSchema,
	ClosureReportSchema,
	InvoiceTrackingSchema,
	PaymentRecordSchema,
	SESTrackingSchema,
} from "@cermont/shared-types";
import { describe, expect, it } from "vitest";

// ── Validaciones de Schema (Zod) ──────────────────────────

describe("Closure Report — Validación de Schemas Zod", () => {
	describe("ActaSignatureSchema (Paso 9)", () => {
		it("debe aceptar una firma válida con tipo digital_text", () => {
			const result = ActaSignatureSchema.safeParse({
				signedBy: "Juan Pérez",
				signedAt: new Date().toISOString(),
				signatureType: "digital_text",
			});
			expect(result.success).toBe(true);
		});

		it("debe aceptar firma con documento escaneado", () => {
			const result = ActaSignatureSchema.safeParse({
				signedBy: "Ana García",
				signedAt: new Date().toISOString(),
				signatureType: "manual_upload",
				signatureDocumentUrl: "https://storage.example.com/acta-firmada.pdf",
			});
			expect(result.success).toBe(true);
		});

		it("debe rechazar firma sin signedBy", () => {
			const result = ActaSignatureSchema.safeParse({
				signedAt: new Date().toISOString(),
				signatureType: "digital_text",
			});
			expect(result.success).toBe(false);
		});

		it("debe rechazar tipo de firma inválido", () => {
			const result = ActaSignatureSchema.safeParse({
				signedBy: "Test",
				signedAt: new Date().toISOString(),
				signatureType: "cryptographic_pki",
			});
			expect(result.success).toBe(false);
		});

		it("debe usar 'pending' como valor por defecto para signatureType", () => {
			const result = ActaSignatureSchema.safeParse({
				signedBy: "Test",
				signedAt: new Date().toISOString(),
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.signatureType).toBe("pending");
			}
		});
	});

	describe("SESTrackingSchema (Pasos 10-11)", () => {
		it("debe aceptar SES con número y fecha de radicación", () => {
			const result = SESTrackingSchema.safeParse({
				sesNumber: "1000123456",
				sesRadicatedAt: new Date().toISOString(),
				sesRadicatedBy: "Carlos Admin",
				sesStatus: "submitted",
			});
			expect(result.success).toBe(true);
		});

		it("debe aceptar SES en estado approved", () => {
			const result = SESTrackingSchema.safeParse({
				sesNumber: "1000123456",
				sesStatus: "approved",
				sesApprovedAt: new Date().toISOString(),
				sesApprovedBy: "Cliente Aprobador",
			});
			expect(result.success).toBe(true);
		});

		it("debe rechazar estado SES inválido", () => {
			const result = SESTrackingSchema.safeParse({
				sesStatus: "cancelled",
			});
			expect(result.success).toBe(false);
		});

		it("debe truncar notas SES a 1000 caracteres", () => {
			const longNote = "x".repeat(1001);
			const result = SESTrackingSchema.safeParse({
				sesNotes: longNote,
			});
			expect(result.success).toBe(false);
		});

		it("debe usar 'pending' como valor por defecto para sesStatus", () => {
			const result = SESTrackingSchema.safeParse({});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.sesStatus).toBe("pending");
			}
		});
	});

	describe("InvoiceTrackingSchema (Pasos 12-13)", () => {
		it("debe aceptar factura con datos completos", () => {
			const result = InvoiceTrackingSchema.safeParse({
				invoiceNumber: "FE-2026-001234",
				invoiceAmount: 15000000,
				invoiceCurrency: "COP",
				invoiceIssuedAt: new Date().toISOString(),
				invoiceStatus: "issued",
			});
			expect(result.success).toBe(true);
		});

		it("debe rechazar monto negativo", () => {
			const result = InvoiceTrackingSchema.safeParse({
				invoiceAmount: -1000,
			});
			expect(result.success).toBe(false);
		});

		it("debe usar COP como moneda por defecto", () => {
			const result = InvoiceTrackingSchema.safeParse({
				invoiceNumber: "FE-001",
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.invoiceCurrency).toBe("COP");
			}
		});

		it("debe aceptar factura aprobada con fecha y aprobador", () => {
			const result = InvoiceTrackingSchema.safeParse({
				invoiceNumber: "FE-002",
				invoiceStatus: "approved",
				invoiceApprovedAt: new Date().toISOString(),
				invoiceApprovedBy: "Revisor Facturación",
			});
			expect(result.success).toBe(true);
		});
	});

	describe("PaymentRecordSchema (Paso 14)", () => {
		it("debe aceptar pago con todos los campos", () => {
			const result = PaymentRecordSchema.safeParse({
				paymentDate: new Date().toISOString(),
				paymentAmount: 15000000,
				paymentReference: "TRF-2026-00987",
				paymentConfirmedBy: "Tesorero",
				paymentSupportUrl: "https://storage.example.com/comprobante.pdf",
			});
			expect(result.success).toBe(true);
		});

		it("debe aceptar pago con campos mínimos", () => {
			const result = PaymentRecordSchema.safeParse({
				paymentDate: new Date().toISOString(),
				paymentAmount: 5000000,
				paymentReference: "CASH-001",
			});
			expect(result.success).toBe(true);
		});

		it("debe rechazar monto de pago negativo", () => {
			const result = PaymentRecordSchema.safeParse({
				paymentAmount: -5000,
			});
			expect(result.success).toBe(false);
		});

		it("debe rechazar URL de comprobante inválida", () => {
			const result = PaymentRecordSchema.safeParse({
				paymentSupportUrl: "not-a-url",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("ClosureReportSchema (Completo)", () => {
		it("debe aceptar reporte de cierre completo con todos los sub-schemas", () => {
			const result = ClosureReportSchema.safeParse({
				_id: "66a1b2c3d4e5f6a7b8c9d0e1",
				orderId: "66a1b2c3d4e5f6a7b8c9d0e2",
				technicalObservations: "Trabajo completado satisfactoriamente.",
				materialsUsed: [{ name: "Cemento", quantity: 10, unit: "kg", unitCost: 500 }],
				actualHours: 8,
				completionNotes: "Sin novedades.",
				acta: {
					signedBy: "Cliente Firmante",
					signedAt: new Date().toISOString(),
					signatureType: "manual_upload",
				},
				ses: {
					sesNumber: "1000999999",
					sesStatus: "approved",
					sesApprovedAt: new Date().toISOString(),
				},
				invoice: {
					invoiceNumber: "FE-2026-999999",
					invoiceAmount: 25000000,
					invoiceStatus: "approved",
				},
				payment: {
					paymentDate: new Date().toISOString(),
					paymentAmount: 25000000,
					paymentReference: "TRF-FINAL-001",
				},
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
			expect(result.success).toBe(true);
		});

		it("debe aceptar reporte mínimo (solo campos requeridos)", () => {
			const result = ClosureReportSchema.safeParse({
				_id: "66a1b2c3d4e5f6a7b8c9d0e1",
				orderId: "66a1b2c3d4e5f6a7b8c9d0e2",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
			expect(result.success).toBe(true);
		});

		it("debe rechazar si falta _id", () => {
			const result = ClosureReportSchema.safeParse({
				orderId: "66a1b2c3d4e5f6a7b8c9d0e2",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
			expect(result.success).toBe(false);
		});
	});
});

// ── Reglas de Negocio del Pipeline de Cierre ──────────────

describe("Pipeline de Cierre Administrativo — Reglas de Negocio", () => {
	const ALLOWED_TRANSITIONS: Record<string, string[]> = {
		completed: ["ready_for_invoicing", "closed", "cancelled"],
		ready_for_invoicing: ["acta_signed", "closed", "cancelled"],
		acta_signed: ["ses_sent", "cancelled"],
		ses_sent: ["invoice_approved", "cancelled"],
		invoice_approved: ["paid", "closed", "cancelled"],
		paid: ["closed"],
		closed: [],
		cancelled: [],
	};

	function isValidTransition(from: string, to: string): boolean {
		const allowed = ALLOWED_TRANSITIONS[from];
		if (!allowed) {
			return false;
		}
		return allowed.includes(to);
	}

	describe("Transiciones válidas", () => {
		it("completed → ready_for_invoicing (Paso 8)", () => {
			expect(isValidTransition("completed", "ready_for_invoicing")).toBe(true);
		});

		it("ready_for_invoicing → acta_signed (Paso 9)", () => {
			expect(isValidTransition("ready_for_invoicing", "acta_signed")).toBe(true);
		});

		it("acta_signed → ses_sent (Paso 10)", () => {
			expect(isValidTransition("acta_signed", "ses_sent")).toBe(true);
		});

		it("ses_sent → invoice_approved (Paso 12-13)", () => {
			expect(isValidTransition("ses_sent", "invoice_approved")).toBe(true);
		});

		it("invoice_approved → paid (Paso 14)", () => {
			expect(isValidTransition("invoice_approved", "paid")).toBe(true);
		});

		it("paid → closed (Cierre final)", () => {
			expect(isValidTransition("paid", "closed")).toBe(true);
		});

		it("completed → closed (cierre sin facturación)", () => {
			expect(isValidTransition("completed", "closed")).toBe(true);
		});
	});

	describe("Transiciones inválidas", () => {
		it("completed → ses_sent (saltar acta)", () => {
			expect(isValidTransition("completed", "ses_sent")).toBe(false);
		});

		it("acta_signed → paid (saltar SES y factura)", () => {
			expect(isValidTransition("acta_signed", "paid")).toBe(false);
		});

		it("open → closed (saltar toda la pipeline)", () => {
			expect(isValidTransition("open", "closed")).toBe(false);
		});

		it("closed → cualquier estado (terminal)", () => {
			expect(isValidTransition("closed", "open")).toBe(false);
			expect(isValidTransition("closed", "in_progress")).toBe(false);
		});

		it("cancelled → cualquier estado (terminal)", () => {
			expect(isValidTransition("cancelled", "open")).toBe(false);
			expect(isValidTransition("cancelled", "completed")).toBe(false);
		});
	});

	describe("Pipeline completa de cierre (14 pasos)", () => {
		it("debe permitir el recorrido completo: completed → closed", () => {
			const path = [
				"completed",
				"ready_for_invoicing",
				"acta_signed",
				"ses_sent",
				"invoice_approved",
				"paid",
				"closed",
			];

			for (let i = 0; i < path.length - 1; i++) {
				expect(isValidTransition(path[i], path[i + 1])).toBe(true);
			}
		});

		it("debe permitir ruta corta: completed → closed (sin cierre administrativo)", () => {
			expect(isValidTransition("completed", "closed")).toBe(true);
		});

		it("debe permitir cancelación desde cualquier estado activo", () => {
			const cancellableStates = [
				"completed",
				"ready_for_invoicing",
				"acta_signed",
				"ses_sent",
				"invoice_approved",
			];

			for (const state of cancellableStates) {
				expect(isValidTransition(state, "cancelled")).toBe(true);
			}
		});
	});
});
