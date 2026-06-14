import { describe, expect, it } from "vitest";
import { generateCufe, generateUblXml } from "../../src/modules/dian/dian.service";

describe("DIAN document generation", () => {
	it("generates a stable SHA-384 CUFE", () => {
		const cufe = generateCufe({
			invoiceNumber: "FV100",
			issueDate: "2026-06-11",
			issueTime: "12:00:00",
			sellerNit: "900123456",
			buyerDoc: "800123456",
			taxableAmount: 100000,
			ivaAmount: 19000,
			totalAmount: 119000,
			softwareSecurityCode: "security-code",
		});

		expect(cufe).toMatch(/^[A-F0-9]{96}$/);
		expect(cufe).toBe(
			"10B3B65C0ACD04C0FF4BCDBB6AFA1618532960FFE16735CEFC30EA96BECDA2F4C477DD7DEA3B775DA62C5F2549BAEE93",
		);
	});

	it("escapes XML-sensitive customer and line-item values", () => {
		const xml = generateUblXml({
			invoiceNumber: "100",
			prefix: "FV",
			issueDate: "2026-06-11",
			issueTime: "12:00:00",
			invoiceType: "FV",
			currency: "COP",
			seller: {
				nit: "900123456",
				businessName: "Cermont & Asociados",
				address: "Calle 1 < 2",
				phone: "123",
				email: "facturacion@cermont.co",
			},
			buyer: {
				documentType: "NIT",
				documentNumber: "800123456",
				businessName: 'Cliente "Principal"',
				address: "Carrera 1 > Avenida",
				email: "cliente@example.com",
			},
			lineItems: [
				{
					description: "Servicio A & B",
					quantity: 1,
					unitPrice: 100000,
					total: 100000,
				},
			],
			taxableAmount: 100000,
			ivaAmount: 19000,
			totalAmount: 119000,
			cufe: "CUFE",
			qrCode: "https://example.com",
			technicalKey: "key",
			softwareId: "software",
			authorizationStartDate: "2026-01-01",
			authorizationEndDate: "2027-01-01",
			authorizationFrom: 1,
			authorizationTo: 1000,
		});

		expect(xml).toContain("Cermont &amp; Asociados");
		expect(xml).toContain("Calle 1 &lt; 2");
		expect(xml).toContain("Servicio A &amp; B");
		expect(xml).not.toContain("Servicio A & B");
		expect(xml).toContain("<sts:From>1</sts:From>");
		expect(xml).toContain("<sts:To>1000</sts:To>");
	});
});
