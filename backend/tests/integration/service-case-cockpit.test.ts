import mongoose from "mongoose";
import { beforeAll, describe, expect, it } from "vitest";

describe("ServiceCase Cockpit Integration", () => {
	beforeAll(async () => {
		const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cermont_test";
		if (mongoose.connection.readyState !== 1) {
			await mongoose.connect(uri);
		}
	});

	it("should handle non-existent service case gracefully", async () => {
		const fakeId = new mongoose.Types.ObjectId();
		const ServiceCase = mongoose.model("ServiceCase");
		const doc = await ServiceCase.findById(fakeId).lean();
		expect(doc).toBeNull();
	});

	it("should find existing service case and return valid structure", async () => {
		const ServiceCase = mongoose.model("ServiceCase");
		const sc = await ServiceCase.findOne().lean();
		if (!sc) {
			return; // skip if no data
		}

		expect(sc).toHaveProperty("_id");
		expect(sc).toHaveProperty("code");
		expect(sc).toHaveProperty("title");
		expect(sc).toHaveProperty("currentStep");
		expect(sc).toHaveProperty("status");
	});

	it("should have valid current step range", async () => {
		const ServiceCase = mongoose.model("ServiceCase");
		const sc = await ServiceCase.findOne().lean();
		if (!sc) {
			return;
		}

		const step = (sc as Record<string, unknown>).currentStep as number;
		expect(step).toBeGreaterThanOrEqual(0);
		expect(step).toBeLessThanOrEqual(14);
	});
});
