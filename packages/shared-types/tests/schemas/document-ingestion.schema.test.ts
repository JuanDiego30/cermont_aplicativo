import { describe, expect, it } from "vitest";
import {
	DocumentExtractionAdapterSchema,
	DocumentExtractionJobSchema,
	DocumentLinkedEntityTypeSchema,
	DocumentSourceFileSchema,
	DocumentSourceKindSchema,
	ExtractedDocumentLayoutSchema,
	TemplateDraftSchema,
	TemplateResponseSchema,
	TemplateStageRequirementSchema,
} from "../../src";

const objectId = "507f1f77bcf86cd799439011";
const isoDate = "2026-05-11T00:00:00.000Z";

describe("document ingestion contracts", () => {
	it("parses source files, extraction jobs, layouts, drafts and stage requirements", () => {
		expect(
			DocumentSourceFileSchema.parse({
				id: objectId,
				originalName: "FORMATO DE PLANEACION DE OBRA.xlsx",
				mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				extension: ".xlsx",
				sizeBytes: 1024,
				hashSha256: "a".repeat(64),
				storageKey: "documents/source/formato-planeacion-obra.xlsx",
				sourceKind: DocumentSourceKindSchema.enum.xlsx,
				uploadedBy: objectId,
				uploadedAt: isoDate,
				linkedEntityType: DocumentLinkedEntityTypeSchema.enum.template_library,
				linkedEntityId: objectId,
				scanStatus: "clean",
				importStatus: "review_required",
				createdAt: isoDate,
				updatedAt: isoDate,
			}),
		).toMatchObject({
			linkedEntityType: "template_library",
			importStatus: "review_required",
		});

		expect(
			DocumentExtractionJobSchema.parse({
				id: objectId,
				documentSourceFileId: objectId,
				adapter: DocumentExtractionAdapterSchema.enum.sheetjs,
				status: "queued",
				retryCount: 0,
				requiresHumanReview: true,
				createdBy: objectId,
			}),
		).toMatchObject({
			adapter: "sheetjs",
			status: "queued",
		});

		expect(
			ExtractedDocumentLayoutSchema.parse({
				id: objectId,
				documentSourceFileId: objectId,
				extractionJobId: objectId,
				pages: [
					{
						pageNumber: 1,
						width: 2100,
						height: 2970,
						confidence: 0.91,
					},
				],
				sheets: [],
				blocks: [],
				tables: [],
				detectedFields: [],
				detectedCheckboxes: [],
				detectedSignatures: [],
				detectedPhotoAreas: [],
				detectedGpsAreas: [],
				language: "es",
				confidence: 0.93,
				rawTextPreview: "Formato de planeación de obra",
				normalizedMarkdown: "# Formato de planeación de obra",
				createdAt: isoDate,
			}),
		).toMatchObject({ language: "es" });

		expect(
			TemplateDraftSchema.parse({
				_id: objectId,
				documentSourceFileId: objectId,
				extractionJobId: objectId,
				name: "Formato de planeación de obra",
				serviceTypes: ["construction"],
				targetStages: ["planning"],
				sections: [
					{
						sectionId: "general",
						title: "General",
						order: 0,
						fields: [
							{
								fieldId: "responsible-name",
								label: "Responsable",
								normalizedName: "responsibleName",
								fieldKind: "text",
								required: true,
								confidence: 0.95,
								options: [],
								validationRules: [],
								sourceReference: "page-1:label-responsable",
							},
						],
						tables: [],
						repeatable: false,
						required: true,
						sourceReference: "page-1:heading-1",
					},
				],
				rules: [],
				exportHints: [{ format: "pdf" }],
				confidence: 0.9,
				status: "review_required",
				createdBy: objectId,
				createdAt: isoDate,
				updatedAt: isoDate,
			}),
		).toMatchObject({ status: "review_required" });

		expect(
			TemplateStageRequirementSchema.parse({
				id: objectId,
				serviceType: "construction",
				stage: "planning",
				templateVersionId: objectId,
				required: true,
				blocksTransition: true,
				allowedRoles: ["gerente", "residente"],
				offlineRequired: true,
				evidenceRequired: false,
				signatureRequired: false,
				gpsRequired: false,
				createdAt: isoDate,
				updatedAt: isoDate,
			}),
		).toMatchObject({ stage: "planning", blocksTransition: true });
	});

	it("supports the additive template response runtime fields without breaking legacy fields", () => {
		expect(
			TemplateResponseSchema.parse({
				_id: objectId,
				linkedEntityType: "work_request",
				linkedEntityId: objectId,
				stage: "work_request",
				values: {
					responsibleName: "Juan Diego",
					workItems: ["item-1", "item-2"],
					gpsPoint: {
						latitude: 4.711,
						longitude: -74.0721,
						accuracy: 12,
						timestamp: isoDate,
					},
					evidenceBlock: {
						notes: "Evidencia tomada en campo",
						documentIds: [objectId],
					},
					repeatableRows: [{ activity: "Aislamiento", done: true }],
				},
				attachments: [],
				photos: [],
				signatures: [],
				gpsPoints: [],
				offlineState: "offline_draft",
				syncState: "queued",
				validationState: "draft",
				submittedBy: objectId,
				approvedBy: objectId,
				approvedAt: isoDate,
				documentTemplateId: objectId,
				documentTemplateVersionId: objectId,
				versionNumber: 1,
				sections: [
					{
						sectionId: "general",
						order: 0,
						fields: [
							{
								fieldId: "responsible-name",
								sectionId: "general",
								value: "Juan Diego",
								modifiedAt: isoDate,
								modifiedBy: objectId,
							},
							{
								fieldId: "evidence-block",
								sectionId: "general",
								value: {
									notes: "Evidencia tomada en campo",
									documentIds: [objectId],
								},
								modifiedAt: isoDate,
								modifiedBy: objectId,
							},
						],
						completionStatus: "complete",
					},
				],
				startedAt: isoDate,
				createdBy: objectId,
				updatedBy: objectId,
			}),
		).toMatchObject({
			linkedEntityType: "work_request",
			offlineState: "offline_draft",
		});
	});

	it("rejects unsupported linked entities and adapters", () => {
		expect(() =>
			DocumentSourceFileSchema.parse({
				id: objectId,
				originalName: "malware.exe",
				mimeType: "application/x-msdownload",
				extension: ".exe",
				sizeBytes: 1,
				hashSha256: "a".repeat(64),
				storageKey: "documents/source/malware.exe",
				sourceKind: "manual",
				uploadedBy: objectId,
				uploadedAt: isoDate,
				linkedEntityType: "service_case",
				linkedEntityId: objectId,
				scanStatus: "pending",
				importStatus: "not_started",
				createdAt: isoDate,
				updatedAt: isoDate,
			}),
		).toThrow();

		expect(() =>
			DocumentExtractionJobSchema.parse({
				id: objectId,
				documentSourceFileId: objectId,
				adapter: "unsupported",
				status: "queued",
				retryCount: 0,
				requiresHumanReview: true,
				createdBy: objectId,
			}),
		).toThrow();
	});
});
