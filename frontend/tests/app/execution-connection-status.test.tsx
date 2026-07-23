import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConnectionStatus } from "@/app/(dashboard)/execution/page";

describe("ConnectionStatus", () => {
	it("announces connected state and pending synchronization count", () => {
		render(<ConnectionStatus isOnline pendingSyncCount={2} />);

		expect(screen.getByRole("status").textContent).toContain("Conectado");
		expect(screen.getByRole("status").textContent).toContain("Sync pendiente: 2");
	});

	it("announces the offline state without relying only on color", () => {
		render(<ConnectionStatus isOnline={false} pendingSyncCount={1} />);

		expect(screen.getByRole("status").textContent).toContain("Sin conexión");
		expect(screen.getByRole("status").textContent).toContain("Sync pendiente: 1");
	});
});
