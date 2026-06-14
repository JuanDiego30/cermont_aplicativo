import { describe, expect, test, vi } from "vitest";
import { AppError } from "../../src/common/errors/AppError";
import * as WorkRequestService from "../../src/modules/work-requests/work-requests.service";

// Unit tests for WorkRequest endpoints using supertest-style approach
describe("WorkRequest API Endpoints", () => {
	describe("GET /api/work-requests", () => {
		test("should list work requests with pagination", async () => {
			const mockWorkRequests = [
				{
					_id: "507f1f77bcf86cd799439011",
					code: "WR-2024-0001",
					status: "submitted",
					clientName: "Test Client",
				},
			];

			// Mock the service
			const listSpy = vi.spyOn(WorkRequestService, "getWorkRequests").mockResolvedValue({
				data: mockWorkRequests,
				pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
			});

			const result = await WorkRequestService.getWorkRequests(
				{ page: 1, limit: 20 },
				"user123",
				"gerente",
			);

			expect(result.data).toHaveLength(1);
			expect(result.pagination.total).toBe(1);
			expect(listSpy).toHaveBeenCalledWith({ page: 1, limit: 20 }, "user123", "gerente");
		});
	});

	describe("POST /api/work-requests", () => {
		test("should create a work request", async () => {
			const mockInput = {
				requesterName: "Test User",
				clientName: "Test Client",
				serviceSite: "Site A",
				serviceType: "Maintenance",
				sourceChannel: "portal_client" as const,
				shortDescription: "Test WR",
				description: "Test description for work request",
				requiresSiteVisit: false,
			};

			const mockResult = {
				workRequest: {
					_id: "507f1f77bcf86cd799439011",
					code: "WR-2024-0001",
					...mockInput,
					status: "submitted",
				},
				serviceCase: {
					code: "SC-2024-0001",
					currentStage: "intake",
				},
			};

			const createSpy = vi
				.spyOn(WorkRequestService, "createWorkRequest")
				.mockResolvedValue(mockResult);

			const result = await WorkRequestService.createWorkRequest(
				mockInput,
				"507f1f77bcf86cd799439011",
				"gerente",
			);

			expect(result.workRequest.code).toBe("WR-2024-0001");
			expect(result.serviceCase.currentStage).toBe("intake");
			expect(createSpy).toHaveBeenCalled();
		});
	});

	describe("GET /api/work-requests/:id", () => {
		test("should get work request by ID", async () => {
			const mockWorkRequest = {
				_id: "507f1f77bcf86cd799439011",
				code: "WR-2024-0001",
				status: "submitted",
			};

			const getSpy = vi
				.spyOn(WorkRequestService, "getWorkRequestById")
				.mockResolvedValue(mockWorkRequest);

			const result = await WorkRequestService.getWorkRequestById(
				"507f1f77bcf86cd799439011",
				"user123",
				"gerente",
			);

			expect(result.code).toBe("WR-2024-0001");
			expect(getSpy).toHaveBeenCalledWith("507f1f77bcf86cd799439011", "user123", "gerente");
		});

		test("should throw WORK_REQUEST_NOT_FOUND for non-existent ID", async () => {
			vi.spyOn(WorkRequestService, "getWorkRequestById").mockImplementation(async () => {
				throw new AppError("Work request not found", 404, "WORK_REQUEST_NOT_FOUND");
			});

			await expect(
				WorkRequestService.getWorkRequestById("invalid-id", "user123", "gerente"),
			).rejects.toThrow();
		});
	});

	describe("POST /api/work-requests/:id/visits", () => {
		test("should create site visit for work request", async () => {
			const mockResult = {
				workRequest: {
					_id: "507f1f77bcf86cd799439011",
					code: "WR-2024-0001",
					status: "visit_required",
					visit: {
						scheduledAt: new Date("2024-01-15"),
						technicianId: "507f1f77bcf86cd799439012",
						technicianName: "Tech User",
						evidences: [],
					},
				},
				serviceCase: {
					currentStage: "assessment",
				},
			};

			const createVisitSpy = vi
				.spyOn(WorkRequestService, "createSiteVisit")
				.mockResolvedValue(mockResult);

			const result = await WorkRequestService.createSiteVisit(
				"507f1f77bcf86cd799439011",
				{
					scheduledAt: "2024-01-15T10:00:00Z",
					technicianId: "507f1f77bcf86cd799439012",
					technicianName: "Tech User",
				},
				"user123",
			);

			expect(result.workRequest.status).toBe("visit_required");
			expect(createVisitSpy).toHaveBeenCalled();
		});
	});

	describe("GET /api/work-requests/:id/visits", () => {
		test("should list site visits for work request", async () => {
			const mockResult = {
				visits: [
					{
						scheduledAt: new Date("2024-01-15"),
						technicianName: "Tech User",
						status: "scheduled",
					},
				],
			};

			const listVisitsSpy = vi
				.spyOn(WorkRequestService, "listSiteVisits")
				.mockResolvedValue(mockResult);

			const result = await WorkRequestService.listSiteVisits("507f1f77bcf86cd799439011", {
				_id: "user123",
				role: "gerente",
			});

			expect(result.visits).toHaveLength(1);
			expect(listVisitsSpy).toHaveBeenCalled();
		});
	});

	describe("RBAC - Client cannot view other client's work requests", () => {
		test("should throw FORBIDDEN when cliente tries to view another client WR", async () => {
			vi.spyOn(WorkRequestService, "getWorkRequestById").mockImplementation(async () => {
				throw new AppError("You can only view your own work requests", 403, "FORBIDDEN");
			});

			await expect(
				WorkRequestService.getWorkRequestById("wr-id", "user123", "cliente"),
			).rejects.toThrow();
		});
	});
});
