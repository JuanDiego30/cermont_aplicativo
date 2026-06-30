import { describe, expect, it } from "vitest";
import {
	classifyClosingEvidence,
	mapClassificationToStepCode,
} from "../../src/services/closing-evidence-routing.service";

describe("closing-evidence-routing", () => {
	it("clasifica acta de entrega al paso 9 (canonical)", () => {
		expect(classifyClosingEvidence("acta_entrega_obra.pdf")).toBe("acta_delivery");
		expect(mapClassificationToStepCode("acta_delivery")).toBe("step_09_delivery_record");
	});

	it("clasifica firma del cliente al paso 10 (canonical)", () => {
		expect(classifyClosingEvidence("acta_firmada_cliente.pdf")).toBe("client_signature");
		expect(mapClassificationToStepCode("client_signature")).toBe("step_10_client_signature");
	});

	it("clasifica radicación y aprobación SES en paso 11 (canonical, merged)", () => {
		expect(classifyClosingEvidence("comprobante_ses_ariba.pdf")).toBe("ses_filing");
		expect(classifyClosingEvidence("ses_aprobada_cliente.pdf")).toBe("ses_approval");
		expect(mapClassificationToStepCode("ses_filing")).toBe("step_11_ses");
		expect(mapClassificationToStepCode("ses_approval")).toBe("step_11_ses");
	});

	it("clasifica factura y pago en pasos 12–14 (canonical)", () => {
		expect(classifyClosingEvidence("factura_venta_001.pdf")).toBe("invoice_sent");
		expect(classifyClosingEvidence("factura_aprobada_pago.pdf")).toBe("invoice_approval");
		expect(classifyClosingEvidence("comprobante_pago_transferencia.pdf")).toBe("payment_support");
		expect(mapClassificationToStepCode("payment_support")).toBe("step_14_payment");
	});
});
