import type { SystemConfig } from "@cermont/shared-types";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReminderSettingsForm } from "@/app/(dashboard)/admin/settings/ReminderSettingsForm";

const CONFIG: SystemConfig = {
	featureFlags: [],
	maintenanceMode: false,
	maintenanceMessage: "",
	maxUploadSizeMb: 20,
	sessionTimeoutMinutes: 480,
	defaultLanguage: "es",
	allowedFileTypes: ["pdf"],
	reminderWorkerEnabled: true,
	reminderWorkerIntervalMinutes: 5,
	reminderRules: [
		{
			type: "maintenance_due",
			enabled: true,
			scheduleMode: "days_before",
			thresholds: [7, 3, 1],
			channels: ["in_app"],
			recipientRoles: ["gerente"],
		},
	],
};

describe("ReminderSettingsForm", () => {
	it("submits worker cadence and reminder rules", () => {
		const onSave = vi.fn();
		render(<ReminderSettingsForm config={CONFIG} isPending={false} onSave={onSave} />);

		fireEvent.change(screen.getByLabelText("Frecuencia de evaluación (minutos)"), {
			target: { value: "10" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Guardar recordatorios" }));

		expect(onSave).toHaveBeenCalledWith(
			expect.objectContaining({
				reminderWorkerEnabled: true,
				reminderWorkerIntervalMinutes: 10,
				reminderRules: CONFIG.reminderRules,
			}),
		);
	});

	it("blocks duplicate thresholds before submitting", () => {
		const onSave = vi.fn();
		render(<ReminderSettingsForm config={CONFIG} isPending={false} onSave={onSave} />);

		fireEvent.change(screen.getByLabelText("Umbrales"), {
			target: { value: "7, 7" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Guardar recordatorios" }));

		expect(screen.getByRole("alert").textContent).toContain("Reminder thresholds must be unique");
		expect(onSave).not.toHaveBeenCalled();
	});
});
