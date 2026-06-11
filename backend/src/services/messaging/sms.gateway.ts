/**
 * SMS Gateway — Send SMS messages
 *
 * Placeholder implementation that logs to console in development.
 * In production, configure SMS_* environment variables for Twilio or other provider.
 */

import { createLogger } from "../../common/utils/logger";
import type { MessageGateway, MessagePayload, MessageResult } from "./gateway.interface";

const log = createLogger("sms-gateway");

const SMS_ENABLED = process.env.SMS_ENABLED === "true";

/**
 * SMS Gateway implementation (placeholder)
 * Logs SMS messages in development. For production, integrate with Twilio, AWS SNS, etc.
 */
export const smsGateway: MessageGateway = {
	channel: "sms" as const,

	async send(payload: MessagePayload): Promise<MessageResult> {
		if (!SMS_ENABLED) {
			log.info("[DEV SMS]", {
				to: payload.to,
				body: payload.body.substring(0, 160),
			});
			return {
				success: true,
				messageId: `sms_dev_${Date.now()}`,
				sentAt: new Date(),
			};
		}

		// TODO: Integrate with Twilio or SMS provider
		log.warn("SMS Gateway not configured — message not sent", {
			to: payload.to,
			body: payload.body.substring(0, 100),
		});

		return {
			success: false,
			error: "SMS provider not configured",
			sentAt: new Date(),
		};
	},
};
