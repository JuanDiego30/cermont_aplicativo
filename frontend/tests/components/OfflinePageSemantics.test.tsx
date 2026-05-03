import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import OfflinePage from "../../src/app/offline/page";

describe("OfflinePage semantics", () => {
	it("exposes accessible landmarks for recovery actions and status details", () => {
		render(<OfflinePage />);

		expect(screen.getByRole("main")).toBeInTheDocument();
		expect(
			screen.getByRole("navigation", { name: "Offline recovery actions" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("complementary", { name: "Offline recovery details" }),
		).toBeInTheDocument();
		expect(screen.getByRole("list", { name: "Offline capabilities" })).toBeInTheDocument();
	});
});
