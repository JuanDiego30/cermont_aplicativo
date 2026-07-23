import { describe, expect, it } from "vitest";
import { formatCOP, formatCOPCompact } from "@/lib/format/currency";

describe("COP currency formatting", () => {
	it("formats full Colombian peso values without decimals", () => {
		const formatted = formatCOP(5_000_000);
		expect(formatted).toContain("$");
		expect(formatted).toContain("5.000.000");
		expect(formatted).not.toContain(",00");
	});

	it("formats compact Colombian peso values", () => {
		const formatted = formatCOPCompact(1_200_000);
		expect(formatted).toContain("$");
		expect(formatted.toLocaleLowerCase("es-CO")).toContain("m");
	});
});
