/**
 * Notification Preference Service — Per-user notification channel and type configuration
 */

import type {
	UpdateNotificationPreferences,
	UserNotificationPreferences,
} from "@cermont/shared-types";
import { Types } from "mongoose";

type NotificationPrefType =
	| "state_transition"
	| "approval_required"
	| "document_upload"
	| "deadline_warning"
	| "payment"
	| "system_alert";

import type { INotificationPreferenceDocument } from "../../models/NotificationPreference";
import { NotificationPreference } from "../../models/NotificationPreference";

const DEFAULT_TYPE_PREFERENCES: Array<{
	type: NotificationPrefType;
	enabled: boolean;
	channels: ("in_app" | "email" | "sms")[];
}> = [
	{ type: "state_transition", enabled: true, channels: ["in_app", "email"] },
	{ type: "approval_required", enabled: true, channels: ["in_app", "email"] },
	{ type: "document_upload", enabled: true, channels: ["in_app"] },
	{ type: "deadline_warning", enabled: true, channels: ["in_app", "email"] },
	{ type: "payment", enabled: true, channels: ["in_app", "email"] },
	{ type: "system_alert", enabled: true, channels: ["in_app"] },
];

function formatDocument(doc: INotificationPreferenceDocument): UserNotificationPreferences {
	return {
		userId: doc.userId.toString(),
		quietHoursEnabled: doc.quietHoursEnabled,
		quietHoursStart: doc.quietHoursStart,
		quietHoursEnd: doc.quietHoursEnd,
		pushEnabled: doc.pushEnabled,
		emailDigest: doc.emailDigest,
		typePreferences: doc.typePreferences.map((tp) => ({
			type: tp.type as NotificationPrefType,
			enabled: tp.enabled,
			channels: tp.channels as ("in_app" | "email" | "sms")[],
		})),
		updatedAt: doc.updatedAt.toISOString(),
	};
}

export async function getPreferences(userId: string): Promise<UserNotificationPreferences> {
	const doc = await NotificationPreference.findOne({
		userId: new Types.ObjectId(userId),
	}).lean<INotificationPreferenceDocument | null>();

	if (!doc) {
		return {
			userId,
			quietHoursEnabled: false,
			pushEnabled: true,
			emailDigest: "instant",
			typePreferences: DEFAULT_TYPE_PREFERENCES,
			updatedAt: new Date().toISOString(),
		};
	}

	return {
		userId: doc.userId.toString(),
		quietHoursEnabled: doc.quietHoursEnabled,
		quietHoursStart: doc.quietHoursStart,
		quietHoursEnd: doc.quietHoursEnd,
		pushEnabled: doc.pushEnabled,
		emailDigest: doc.emailDigest,
		typePreferences: doc.typePreferences.map((tp) => ({
			type: tp.type as NotificationPrefType,
			enabled: tp.enabled,
			channels: tp.channels as ("in_app" | "email" | "sms")[],
		})),
		updatedAt: doc.updatedAt.toISOString(),
	};
}

export async function updatePreferences(
	userId: string,
	data: UpdateNotificationPreferences,
): Promise<UserNotificationPreferences> {
	const existing = await NotificationPreference.findOne({
		userId: new Types.ObjectId(userId),
	});

	if (!existing) {
		const doc = await NotificationPreference.create({
			userId: new Types.ObjectId(userId),
			quietHoursEnabled: data.quietHoursEnabled ?? false,
			quietHoursStart: data.quietHoursStart,
			quietHoursEnd: data.quietHoursEnd,
			pushEnabled: data.pushEnabled ?? true,
			emailDigest: data.emailDigest ?? "instant",
			typePreferences: data.typePreferences ?? DEFAULT_TYPE_PREFERENCES,
		});
		return formatDocument(doc);
	}

	if (data.quietHoursEnabled !== undefined) {
		existing.quietHoursEnabled = data.quietHoursEnabled;
	}
	if ("quietHoursStart" in data) {
		existing.quietHoursStart = data.quietHoursStart;
	}
	if ("quietHoursEnd" in data) {
		existing.quietHoursEnd = data.quietHoursEnd;
	}
	if (data.pushEnabled !== undefined) {
		existing.pushEnabled = data.pushEnabled;
	}
	if (data.emailDigest !== undefined) {
		existing.emailDigest = data.emailDigest;
	}
	if (data.typePreferences !== undefined) {
		existing.typePreferences = data.typePreferences;
	}

	await existing.save();
	return formatDocument(existing);
}
