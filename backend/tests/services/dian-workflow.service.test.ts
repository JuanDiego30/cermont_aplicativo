import { beforeEach, describe, expect, it, vi } from "vitest";

const NO_DOCUMENT = Object.getPrototypeOf(Object.prototype);

const mocks = vi.hoisted(() => ({
	configFindOne: vi.fn(),
	configFindOneAndUpdate: vi.fn(),
	invoiceFindOneAndUpdate: vi.fn(),
	invoiceFindById: vi.fn(),
	invoiceUpdateOne: vi.fn(),
	createAuditLog: vi.fn(),
}));

vi.mock("../../src/modules/dian/dian.config.model", () => ({
	DianConfigurationModel: {
		findOne: mocks.configFindOne,
		findOneAndUpdate: mocks.configFindOneAndUpdate,
	},
}));

vi.mock("../../src/models/Invoice", () => ({
	Invoice: {
		findOneAndUpdate: mocks.invoiceFindOneAndUpdate,
		findById: mocks.invoiceFindById,
		updateOne: mocks.invoiceUpdateOne,
		find: vi.fn(),
	},
}));

vi.mock("../../src/modules/audit/audit.service", () => ({
	createAuditLog: mocks.createAuditLog,
}));

const { DianService } = await import("../../src/modules/dian/dian.service");

function createConfiguration() {
	return {
		_id: { toString: () => "507f1f77bcf86cd799439010" },
		singletonKey: "dian",
		testSetId: "test-set",
		softwareId: "software",
		softwarePin: "secret-pin",
		technicalKey: "secret-key",
		resolutionNumber: "187640000001",
		resolutionDate: new Date("2026-01-01T00:00:00.000Z"),
		resolutionStartDate: new Date("2026-01-01T00:00:00.000Z"),
		resolutionEndDate: new Date("2027-01-01T00:00:00.000Z"),
		resolutionPrefix: "FV",
		resolutionFrom: 10,
		resolutionTo: 1000,
		environment: "test",
		isEnabled: true,
		lastInvoiceNumber: 0,
	};
}

function mockConfigurationQuery(configuration = createConfiguration()) {
	mocks.configFindOne.mockReturnValue({
		select: vi.fn().mockResolvedValue(configuration),
	});
}

describe("DIAN workflow service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns a secret-safe public configuration", async () => {
		mockConfigurationQuery();

		const result = await DianService.getConfiguration();

		expect(result.status).toBe("configured");
		if (result.status === "configured") {
			expect(result.configuration).not.toHaveProperty("softwarePin");
			expect(result.configuration).not.toHaveProperty("technicalKey");
			expect(result.configuration.credentialStatus).toEqual({
				softwarePin: "configured",
				technicalKey: "configured",
			});
		}
	});

	it("rejects a concurrent submission claim", async () => {
		mockConfigurationQuery();
		mocks.invoiceFindOneAndUpdate.mockResolvedValue(NO_DOCUMENT);
		mocks.invoiceFindById.mockResolvedValue({
			dianStatus: "submitting",
		});

		await expect(
			DianService.sendInvoice("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"),
		).rejects.toMatchObject({
			statusCode: 409,
			code: "DIAN_SUBMISSION_IN_PROGRESS",
		});
	});

	it("prevents clients from reading another client's DIAN status", async () => {
		mocks.invoiceFindById.mockResolvedValue({
			clientId: { toString: () => "507f1f77bcf86cd799439099" },
			cufe: "CUFE",
		});

		await expect(
			DianService.checkInvoiceStatus("507f1f77bcf86cd799439011", {
				_id: "507f1f77bcf86cd799439012",
				role: "cliente",
			}),
		).rejects.toMatchObject({ statusCode: 403 });
		expect(mocks.configFindOne).not.toHaveBeenCalled();
	});

	it("atomically reserves the first authorized number and persists accepted test status", async () => {
		const configuration = createConfiguration();
		mockConfigurationQuery(configuration);
		const invoice = {
			_id: { toString: () => "507f1f77bcf86cd799439011" },
			status: "draft",
			dianStatus: "submitting",
			clientId: { toString: () => "507f1f77bcf86cd799439099" },
			seller: {
				nit: "900123456",
				businessName: "Cermont",
				address: "Bogotá",
				phone: "1234567",
				email: "facturacion@cermont.co",
			},
			buyer: {
				documentType: "NIT",
				documentNumber: "800123456",
				businessName: "Cliente",
				address: "Bogotá",
				email: "cliente@example.com",
			},
			issueDate: new Date("2026-06-11T12:00:00.000Z"),
			totalAmount: 119000,
			taxAmount: 19000,
			currency: "COP",
			invoiceLines: [
				{
					description: "Servicio técnico",
					quantity: 1,
					unit: "unidad",
					unitPrice: 100000,
					total: 100000,
				},
			],
			commandHistory: [],
			save: vi.fn(),
		};
		mocks.invoiceFindOneAndUpdate.mockResolvedValue(invoice);
		mocks.configFindOneAndUpdate.mockReturnValue({
			select: vi.fn().mockResolvedValue({
				...configuration,
				lastInvoiceNumber: 10,
			}),
		});

		const result = await DianService.sendInvoice(
			"507f1f77bcf86cd799439011",
			"507f1f77bcf86cd799439012",
		);

		expect(mocks.configFindOneAndUpdate).toHaveBeenCalledWith(
			{
				_id: configuration._id,
				lastInvoiceNumber: 0,
			},
			{ $set: { lastInvoiceNumber: 10 } },
			{ returnDocument: "after" },
		);
		expect(result.invoiceNumber).toBe("FV10");
		expect(result.dianStatus).toBe("accepted");
		expect(invoice.save).toHaveBeenCalledOnce();
		expect(mocks.createAuditLog).toHaveBeenCalledOnce();
	});
});
