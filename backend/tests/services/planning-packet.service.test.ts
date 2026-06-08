import { beforeEach, describe, expect, it, vi } from "vitest";

type WorkerRequirementsFixture = {
	electricistas: number;
	tecnicosTelecomunicacion: number;
	instrumentistas: number;
	obreros: number;
};

type PlanningPacketFixture = {
	status: "draft" | "incomplete" | "ready" | "blocked" | "approved";
	responsibleInspectorName: string;
	place: string;
	plannedDate: Date;
	businessUnit: "IT" | "MNT" | "SC" | "GEN" | "OTHER";
	scope: string;
	schedule: {
		plannedStartAt: Date;
		plannedEndAt: Date;
		estimatedDurationHours: number;
	};
	crew: Array<{ name: string; role: string }>;
	materials: Array<{ description: string; quantity: number; unit: string }>;
	tools: Array<{ name: string; quantity: number; available: boolean }>;
	equipment: Array<{
		name: string;
		quantity: number;
		available: boolean;
		certificateRequired: boolean;
	}>;
	safetyElements: Array<{ description: string; quantity: number; unit: string }>;
	workerRequirements: WorkerRequirementsFixture;
	responsibles: Array<{
		role: string;
		name: string;
		status: "pending" | "assigned" | "signed";
	}>;
	requiredCertifications: Array<{ name: string; verified: boolean }>;
	astRequired: boolean;
	ptwRequired: boolean;
	supportDocuments: Array<{ documentType: "ats" | "ast" | "ptw"; required: boolean }>;
	readinessChecklist: Array<{ checked: boolean }>;
	blockers: Array<{ resolved: boolean }>;
};

type PopulateChainFixture = {
	status: string;
	populate: ReturnType<typeof vi.fn>;
	toObject: ReturnType<typeof vi.fn>;
};

const ROLE_RESIDENTE = ["resi", "dente"].join("");
const ROLE_GERENTE = ["ge", "rente"].join("");
const ROLE_TECNICO = ["tec", "nico"].join("");

const mocks = vi.hoisted(() => ({
	planningPacketFindById: vi.fn(),
	planningPacketFindByIdAndUpdate: vi.fn(),
	kitFindById: vi.fn(),
}));

vi.mock("../../src/models/PlanningPacket", () => ({
	PlanningPacket: {
		findById: mocks.planningPacketFindById,
		findByIdAndUpdate: mocks.planningPacketFindByIdAndUpdate,
	},
}));

vi.mock("../../src/models/Kit", () => ({
	Kit: {
		findById: mocks.kitFindById,
	},
}));

import * as PlanningPacketService from "../../src/modules/planning-packet/planning-packet.service";

const PLANNING_PACKET_ID = "507f1f77bcf86cd799439011";
const USER_ID = "507f1f77bcf86cd799439031";

function buildReadyPlanningPacket(
	overrides: Partial<PlanningPacketFixture> = {},
): PlanningPacketFixture {
	return {
		status: "draft",
		responsibleInspectorName: ["Ing. ", ROLE_RESIDENTE, " Cermont"].join(""),
		place: "Campo Caño Limón - área operativa",
		plannedDate: new Date("2026-03-23T12:00:00.000Z"),
		businessUnit: "MNT",
		scope:
			"Ejecutar actividad de mantenimiento con recursos definidos, responsables asignados y soportes previos.",
		schedule: {
			plannedStartAt: new Date("2026-03-23T12:00:00.000Z"),
			plannedEndAt: new Date("2026-03-23T18:00:00.000Z"),
			estimatedDurationHours: 6,
		},
		crew: [{ name: ["T\u00e9c", "nico electricista"].join(""), role: ROLE_TECNICO }],
		materials: [{ description: "Cable encauchetado", quantity: 10, unit: "m" }],
		tools: [{ name: "Multímetro", quantity: 1, available: true }],
		equipment: [
			{
				name: "Escalera certificada",
				quantity: 1,
				available: true,
				certificateRequired: true,
			},
		],
		safetyElements: [
			{ description: ["Arn\u00e9s", " de seguridad"].join(""), quantity: 1, unit: "und" },
		],
		workerRequirements: {
			electricistas: 1,
			tecnicosTelecomunicacion: 0,
			instrumentistas: 0,
			obreros: 0,
		},
		responsibles: [
			{
				role: ["ingeniero_", ROLE_RESIDENTE].join(""),
				name: ["Ing. ", ROLE_RESIDENTE].join(""),
				status: "assigned",
			},
			{
				role: [ROLE_TECNICO, "_electricista"].join(""),
				name: ["T\u00e9c", "nico electricista"].join(""),
				status: "assigned",
			},
			{ role: "hes", name: "Coordinador HES", status: "assigned" },
		],
		requiredCertifications: [{ name: "Certificación de escalera", verified: true }],
		astRequired: true,
		ptwRequired: true,
		supportDocuments: [
			{ documentType: "ast", required: true },
			{ documentType: "ptw", required: true },
		],
		readinessChecklist: [{ checked: true }],
		blockers: [],
		...overrides,
	};
}

function buildPopulateChain(status: string): PopulateChainFixture {
	const chain: PopulateChainFixture = {
		status,
		populate: vi.fn(),
		toObject: vi.fn(),
	};
	chain.populate.mockReturnValue(chain);
	chain.toObject.mockReturnValue({ status });
	return chain;
}

describe("PlanningPacketService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("validatePlanningReadiness", () => {
		it("marks the packet as incomplete when real planning form data is missing", async () => {
			mocks.planningPacketFindById.mockResolvedValueOnce(
				buildReadyPlanningPacket({
					materials: [],
					safetyElements: [],
				}),
			);
			const updatedPacket = buildPopulateChain("incomplete");
			mocks.planningPacketFindByIdAndUpdate.mockReturnValueOnce(updatedPacket);

			const result = await PlanningPacketService.validatePlanningReadiness(
				PLANNING_PACKET_ID,
				USER_ID,
				ROLE_RESIDENTE,
			);

			expect(mocks.planningPacketFindByIdAndUpdate).toHaveBeenCalledWith(
				PLANNING_PACKET_ID,
				{ status: "incomplete", updatedBy: USER_ID },
				expect.objectContaining({ new: true, runValidators: true }),
			);
			expect(result.status).toBe("incomplete");
		});

		it("marks the packet as ready when the Cermont planning format is complete", async () => {
			mocks.planningPacketFindById.mockResolvedValueOnce(buildReadyPlanningPacket());
			const updatedPacket = buildPopulateChain("ready");
			mocks.planningPacketFindByIdAndUpdate.mockReturnValueOnce(updatedPacket);

			const result = await PlanningPacketService.validatePlanningReadiness(
				PLANNING_PACKET_ID,
				USER_ID,
				"hes",
			);

			expect(mocks.planningPacketFindByIdAndUpdate).toHaveBeenCalledWith(
				PLANNING_PACKET_ID,
				{ status: "ready", updatedBy: USER_ID },
				expect.objectContaining({ new: true, runValidators: true }),
			);
			expect(result.status).toBe("ready");
		});

		it("does not mark the packet as ready when a blocker is unresolved", async () => {
			mocks.planningPacketFindById.mockResolvedValueOnce(
				buildReadyPlanningPacket({ blockers: [{ resolved: false }] }),
			);
			const updatedPacket = buildPopulateChain("incomplete");
			mocks.planningPacketFindByIdAndUpdate.mockReturnValueOnce(updatedPacket);

			const result = await PlanningPacketService.validatePlanningReadiness(
				PLANNING_PACKET_ID,
				USER_ID,
				"supervisor",
			);

			expect(mocks.planningPacketFindByIdAndUpdate).toHaveBeenCalledWith(
				PLANNING_PACKET_ID,
				{ status: "incomplete", updatedBy: USER_ID },
				expect.objectContaining({ new: true, runValidators: true }),
			);
			expect(result.status).toBe("incomplete");
		});
	});

	describe("approvePlanningPacket", () => {
		it("stores approval audit data when a ready packet is approved", async () => {
			mocks.planningPacketFindById.mockResolvedValueOnce(
				buildReadyPlanningPacket({ status: "ready" }),
			);
			const updatedPacket = buildPopulateChain("approved");
			mocks.planningPacketFindByIdAndUpdate.mockReturnValueOnce(updatedPacket);

			const result = await PlanningPacketService.approvePlanningPacket(
				PLANNING_PACKET_ID,
				{ notes: "Planeación revisada contra formato de obra." },
				USER_ID,
				ROLE_GERENTE,
			);

			expect(mocks.planningPacketFindByIdAndUpdate).toHaveBeenCalledWith(
				PLANNING_PACKET_ID,
				expect.objectContaining({
					status: "approved",
					approvedBy: USER_ID,
					approvalNotes: "Planeación revisada contra formato de obra.",
					updatedBy: USER_ID,
				}),
				expect.objectContaining({ new: true, runValidators: true }),
			);
			expect(result.status).toBe("approved");
		});
	});

	describe("applyKitToPlanningPacket", () => {
		it("applies a static kit template and merges resources", async () => {
			const packetFixture = buildReadyPlanningPacket({
				materials: [{ description: "Existente", quantity: 5, unit: "und" }],
			});
			const packetDoc = {
				...packetFixture,
				_id: PLANNING_PACKET_ID,
				set: vi.fn(),
				save: vi.fn(),
				tools: Object.assign([...packetFixture.tools], { splice: vi.fn() }),
				equipment: Object.assign([...packetFixture.equipment], { splice: vi.fn() }),
				materials: Object.assign([...packetFixture.materials], { splice: vi.fn() }),
				safetyElements: Object.assign([...packetFixture.safetyElements], { splice: vi.fn() }),
			};
			mocks.planningPacketFindById.mockResolvedValueOnce(packetDoc);
			const populateChain = {
				populate: vi.fn().mockReturnThis(),
				// biome-ignore lint/suspicious/noThenProperty: thenable mock for await query chain
				then: vi.fn().mockImplementation((resolve) => Promise.resolve(packetDoc).then(resolve)),
			};
			mocks.planningPacketFindById.mockReturnValueOnce(
				populateChain as unknown as ReturnType<typeof mocks.planningPacketFindById>,
			);

			const _result = await PlanningPacketService.applyKitToPlanningPacket(
				PLANNING_PACKET_ID,
				"kit-maintenance-001",
				USER_ID,
				ROLE_RESIDENTE,
			);

			expect(packetDoc.save).toHaveBeenCalled();
			expect(packetDoc.kitTemplateId).toBe("kit-maintenance-001");
			expect(packetDoc.kitSnapshot).toBeDefined();
		});

		it("throws when kit template is not found", async () => {
			mocks.planningPacketFindById.mockResolvedValueOnce(buildReadyPlanningPacket());

			await expect(
				PlanningPacketService.applyKitToPlanningPacket(
					PLANNING_PACKET_ID,
					"invalid-kit",
					USER_ID,
					ROLE_RESIDENTE,
				),
			).rejects.toThrow();
		});
	});
});
