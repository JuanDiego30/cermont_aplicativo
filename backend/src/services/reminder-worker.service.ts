import type { ReminderType } from "@cermont/shared-types";
import { createLogger } from "../common/utils/logger";
import { User } from "../models";
import { createNotificationFromTemplate } from "../modules/notifications/notification.service";
import { SystemConfigService } from "../modules/system-config/system-config.service";
import { checkCertificationReminders } from "./reminder-checks/certification-reminder.check";
import {
	checkInvoiceReminders,
	checkPaymentOverdueReminders,
} from "./reminder-checks/invoice-reminder.check";
import { checkMaintenanceReminders } from "./reminder-checks/maintenance-reminder.check";
import type { ReminderCandidate, ReminderCheck } from "./reminder-checks/reminder.types";
import { checkSlaReminders } from "./reminder-checks/sla-reminder.check";
import { checkStaleCaseReminders } from "./reminder-checks/stale-case-reminder.check";

const log = createLogger("reminder-worker");
const MINUTE_MS = 60 * 1000;

const REMINDER_CHECKS: Record<ReminderType, ReminderCheck> = {
	certification_expiring: checkCertificationReminders,
	maintenance_due: checkMaintenanceReminders,
	payment_overdue: checkPaymentOverdueReminders,
	sla_breach_warning: checkSlaReminders,
	invoice_due: checkInvoiceReminders,
	stale_case: checkStaleCaseReminders,
};

interface ReminderRecipient {
	_id: { toString(): string };
	role: Parameters<typeof createNotificationFromTemplate>[3];
	email: string;
	phone?: string;
}

export interface ReminderCycleResult {
	status: "disabled" | "completed";
	checkedRules: number;
	candidates: number;
	deliveries: number;
	nextIntervalMinutes: number;
}

function buildDedupeKey(candidate: ReminderCandidate, recipientId: string): string {
	return [
		"reminder",
		candidate.type,
		candidate.occurrenceKey,
		candidate.threshold,
		recipientId,
	].join(":");
}

export async function runReminderCycle(now = new Date()): Promise<ReminderCycleResult> {
	const config = await SystemConfigService.getConfig();
	if (!config.reminderWorkerEnabled) {
		return {
			status: "disabled",
			checkedRules: 0,
			candidates: 0,
			deliveries: 0,
			nextIntervalMinutes: config.reminderWorkerIntervalMinutes,
		};
	}

	let checkedRules = 0;
	let candidateCount = 0;
	let deliveries = 0;

	for (const rule of config.reminderRules) {
		if (!rule.enabled) {
			continue;
		}
		checkedRules += 1;
		const candidates = await REMINDER_CHECKS[rule.type](rule, now);
		candidateCount += candidates.length;
		if (candidates.length === 0) {
			continue;
		}
		const recipients = await User.find({
			isActive: true,
			role: { $in: rule.recipientRoles },
		})
			.select("_id role email phone")
			.lean<ReminderRecipient[]>();

		for (const candidate of candidates) {
			for (const recipient of recipients) {
				const recipientId = recipient._id.toString();
				await createNotificationFromTemplate(
					candidate.templateName,
					candidate.variables,
					recipientId,
					recipient.role,
					recipient.email,
					recipient.phone,
					candidate.relatedEntity,
					rule.channels,
					buildDedupeKey(candidate, recipientId),
				);
				deliveries += 1;
			}
		}
	}

	return {
		status: "completed",
		checkedRules,
		candidates: candidateCount,
		deliveries,
		nextIntervalMinutes: config.reminderWorkerIntervalMinutes,
	};
}

export function startReminderWorker(): () => void {
	let stopped = false;
	let timer: NodeJS.Timeout | undefined;

	async function runAndSchedule(): Promise<void> {
		let intervalMinutes = 5;
		try {
			const result = await runReminderCycle();
			intervalMinutes = result.nextIntervalMinutes;
			log.info("Reminder cycle completed", {
				status: result.status,
				checkedRules: result.checkedRules,
				candidates: result.candidates,
				deliveries: result.deliveries,
				nextIntervalMinutes: result.nextIntervalMinutes,
			});
		} catch (error) {
			log.error("Reminder cycle failed", { reason: String(error) });
		}
		if (!stopped) {
			timer = setTimeout(() => {
				void runAndSchedule();
			}, intervalMinutes * MINUTE_MS);
		}
	}

	void runAndSchedule();

	return () => {
		stopped = true;
		if (timer) {
			clearTimeout(timer);
		}
	};
}
