import { describe, expect, it } from "vitest";
import { UpdateChecklistItemSchema } from "../../src/schemas/checklist.schema";

describe("UpdateChecklistItemSchema", () => {
	it("acepta un resultado aprobado sin comentario", () => {
		const result = UpdateChecklistItemSchema.safeParse({ result: "passed" });

		expect(result.success).toBe(true);
	});

	it("exige comentario cuando el resultado es fallido", () => {
		const result = UpdateChecklistItemSchema.safeParse({ result: "failed", observation: "  " });

		expect(result.success).toBe(false);
	});

	it("acepta un resultado fallido con hallazgo documentado", () => {
		const result = UpdateChecklistItemSchema.safeParse({
			result: "failed",
			observation: "Arnes con cinta cortada; retirar de servicio.",
		});

		expect(result.success).toBe(true);
	});
});
