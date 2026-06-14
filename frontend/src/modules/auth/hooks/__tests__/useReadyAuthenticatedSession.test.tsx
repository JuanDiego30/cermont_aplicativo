import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/store/auth.store";
import { useReadyAuthenticatedSession } from "../useReadyAuthenticatedSession";

function SessionProbe() {
	const isReady = useReadyAuthenticatedSession();
	return <span>{isReady ? "ready" : "waiting"}</span>;
}

describe("useReadyAuthenticatedSession", () => {
	beforeEach(() => {
		useAuthStore.getState().clearAuth();
	});

	it("reacts when AuthInitializer restores the in-memory session", () => {
		render(<SessionProbe />);
		expect(screen.getByText("waiting")).toBeTruthy();

		act(() => {
			useAuthStore.getState().setAuth(
				{
					id: "user-1",
					name: "Gerencia",
					email: "gerencia@cermont.co",
					role: "gerente",
				},
				"access-token",
			);
		});

		expect(screen.getByText("ready")).toBeTruthy();
	});
});
