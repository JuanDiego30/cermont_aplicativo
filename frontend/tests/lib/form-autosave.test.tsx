import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useStateAutosave } from "../../src/_shared/lib/form";

describe("useStateAutosave", () => {
	it("stores form drafts in session storage only", async () => {
		window.localStorage.clear();
		window.sessionStorage.clear();
		const { rerender } = renderHook(
			({ value }) =>
				useStateAutosave({
					draftId: "cost-form",
					value,
				}),
			{
				initialProps: {
					value: { clientName: "" },
				},
			},
		);

		act(() => {
			rerender({ value: { clientName: "ACME Colombia" } });
		});

		await waitFor(() =>
			expect(window.sessionStorage.getItem("cermont:draft:cost-form")).toBe(
				JSON.stringify({ clientName: "ACME Colombia" }),
			),
		);
		expect(window.localStorage.getItem("cermont:draft:cost-form")).toBeNull();
	});

	it("removes legacy local storage drafts for the same form", async () => {
		window.localStorage.clear();
		window.sessionStorage.clear();
		window.localStorage.setItem(
			"cermont:draft:cost-form",
			JSON.stringify({ clientName: "Legacy draft" }),
		);

		const { result } = renderHook(() =>
			useStateAutosave({
				draftId: "cost-form",
				value: { clientName: "" },
			}),
		);

		await waitFor(() => expect(window.localStorage.getItem("cermont:draft:cost-form")).toBeNull());
		expect(result.current.hasDraft).toBe(false);
	});
});
