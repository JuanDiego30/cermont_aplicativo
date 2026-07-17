import { describe, expect, it } from "vitest";
import { EvidenceSchemaV2 } from "../../src";

const objectId = "507f1f77bcf86cd799439011";
const isoDate = "2026-07-10T00:00:00.000Z";

function createEvidence(checksum: string) {
	return {
		code: "EVID-2026-0001",
		phase: "during",
		category: "safety",
		serviceCaseId: objectId,
		mimeType: "image/webp",
		sizeBytes: 1024,
		url: "https://files.example.com/evidence.webp",
		variants: [
			{
				url: "https://files.example.com/evidence-web.webp",
				variant: "web",
				checksum,
				width: 1200,
				height: 800,
				sizeBytes: 512,
				uploadedAt: isoDate,
			},
		],
		uploadedBy: objectId,
		uploadedAt: isoDate,
		gpsLocation: { lat: 4.711, lng: -74.0721, accuracy: 5, capturedAt: isoDate },
		fsmStatus: "uploaded",
		source: "upload",
		relation: { type: "order", id: objectId },
		rejection: { status: "absent" },
		replacement: { status: "absent" },
		lock: { status: "absent" },
		createdAt: isoDate,
		updatedAt: isoDate,
	};
}

describe("evidence integrity contract", () => {
	it("accepts SHA-256 metadata and bounded GPS coordinates", () => {
		const result = EvidenceSchemaV2.safeParse(
			createEvidence("abc123def456abc123def456abc123def456abc123def456abc1"),
		);

		expect(result.success).toBe(true);
	});

	it("rejects oversized checksum metadata", () => {
		const result = EvidenceSchemaV2.safeParse(createEvidence("x".repeat(121)));

		expect(result.success).toBe(false);
	});
});
