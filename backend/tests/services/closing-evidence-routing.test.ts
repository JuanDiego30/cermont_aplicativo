import { describe, expect, it } from "vitest";
import {
	classifyClosingEvidence,
	mapClassificationToStepCode,
} from "../../src/services/closing-evidence-routing.service";

describe("closing-evidence-routing", () => {
	it("clasifica acta de entrega al paso 8", () => {
		expect(classifyClosingEvidence("acta_entrega_obra.pdf")).toBe("acta_delivery");
		expect(mapClassificationToStepCode("acta_delivery")).toBe("step_08_delivery_record");
	});

	it("clasifica firma del cliente al paso 9", () => {
		expect(classifyClosingEvidence("acta_firmada_cliente.pdf")).toBe("client_signature");
		expect(mapClassificationToStepCode("client_signature")).toBe("step_09_client_signature");
	});

	it("clasifica radicación y aprobación SES en pasos 10 y 11", () => {
		expect(classifyClosingEvidence("comprobante_ses_ariba.pdf")).toBe("ses_filing");
		expect(classifyClosingEvidence("ses_aprobada_cliente.pdf")).toBe("ses_approval");
		expect(mapClassificationToStepCode("ses_filing")).toBe("step_10_ses_submission");
		expect(mapClassificationToStepCode("ses_approval")).toBe("step_11_ses_approval");
	});

	it("clasifica factura y pago en pasos 12–14", () => {
		expect(classifyClosingEvidence("factura_venta_001.pdf")).toBe("invoice_sent");
		expect(classifyClosingEvidence("factura_aprobada_pago.pdf")).toBe("invoice_approval");
		expect(classifyClosingEvidence("comprobante_pago_transferencia.pdf")).toBe("payment_support");
		expect(mapClassificationToStepCode("payment_support")).toBe("step_14_payment_closure");
	});
});
