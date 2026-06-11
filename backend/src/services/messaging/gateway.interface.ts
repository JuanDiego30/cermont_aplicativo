/**
 * Message Gateway Interface
 *
 * Abstraction for sending notifications through different channels.
 * Supports email, SMS, and in-app notification delivery with
 * retry logic and delivery status tracking.
 */

export interface MessagePayload {
	to: string;
	subject?: string;
	body: string;
	htmlBody?: string;
	metadata?: Record<string, unknown>;
}

export interface MessageResult {
	success: boolean;
	messageId?: string;
	error?: string;
	sentAt: Date;
}

export interface MessageGateway {
	readonly channel: "email" | "sms";
	send(payload: MessagePayload): Promise<MessageResult>;
}

// ─── Gateway Registry ──────────────────────────────────────────────────────

const gatewayRegistry = new Map<string, MessageGateway>();

export function registerGateway(gateway: MessageGateway): void {
	gatewayRegistry.set(gateway.channel, gateway);
}

export function getGateway(channel: "email" | "sms"): MessageGateway | undefined {
	return gatewayRegistry.get(channel);
}

export function hasGateway(channel: "email" | "sms"): boolean {
	return gatewayRegistry.has(channel);
}

export function getAllGateways(): MessageGateway[] {
	return Array.from(gatewayRegistry.values());
}
