import { describe, expect, it } from "vitest";

import { HES_TEMPLATES } from "../../src/_shared/lib/data/hes-checklist-templates";

describe("HES checklist templates", () => {
	it("uses English property names for templates and questions", () => {
		const template = HES_TEMPLATES["FT-HES-42"];
		const firstQuestion = template.items[0];

		expect(template).toHaveProperty("code", "FT-HES-42");
		expect(template).toHaveProperty("name");
		expect(template).toHaveProperty("description");
		expect(firstQuestion).toHaveProperty("category");
		expect(firstQuestion).toHaveProperty("question");
		expect(firstQuestion).toHaveProperty("critical");
		expect(template).not.toHaveProperty("codigo");
		expect(template).not.toHaveProperty("nombre");
		expect(firstQuestion).not.toHaveProperty("pregunta");
		expect(firstQuestion).not.toHaveProperty("critica");
	});
});
