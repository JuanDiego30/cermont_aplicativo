/**
 * AI Provider Adapter — Pluggable LLM backend for Cermont AI
 *
 * Supports OpenAI, Gemini, and Ollama (local) providers.
 * Includes rate limiting, content redaction, and audit logging.
 */

import { ServiceUnavailableError } from "../../common/errors/AppError";
import { createLogger } from "../../common/utils/logger";
import { env } from "../../config/env";
import { createAuditLog } from "../audit/audit.service";

const log = createLogger("ai-provider");

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AIProviderAdapter {
	generateResponse(systemPrompt: string, userMessage: string): Promise<string>;
	isAvailable(): boolean;
	getProviderName(): string;
}

export interface AIContext {
	serviceCaseId: string;
	threadId?: string;
	currentModule?: string;
	userRole?: string;
	userId: string;
}

export interface AIInteractionAudit {
	action: string;
	entityId: string;
	userId: string;
	promptLength: number;
	responseLength: number;
	provider: string;
	success: boolean;
	error?: string;
}

// ─── Rate Limiter ───────────────────────────────────────────────────────────

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

class RateLimiter {
	private readonly store = new Map<string, RateLimitEntry>();
	private readonly maxRequests: number;
	private readonly windowMs: number;

	constructor(maxRequests: number, windowMs: number = 60_000) {
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;
	}

	check(key: string): boolean {
		const now = Date.now();
		const entry = this.store.get(key);

		if (!entry || now >= entry.resetAt) {
			this.store.set(key, { count: 1, resetAt: now + this.windowMs });
			return true;
		}

		if (entry.count >= this.maxRequests) {
			return false;
		}

		entry.count++;
		return true;
	}

	reset(key: string): void {
		this.store.delete(key);
	}
}

// ─── Content Redaction ──────────────────────────────────────────────────────

const REDACTION_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
	// Colombian NIT: 123.456.789-0 or 123456789-0
	{ pattern: /\b\d{3}\.?\d{3}\.?\d{3}-?\d\b/g, replacement: "[NIT_REDACTED]" },
	// Colombian ID (CC): 1234567890 (10 digits)
	{ pattern: /\b\d{8,10}\b/g, replacement: "[ID_REDACTED]" },
	// Email addresses
	{ pattern: /\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, replacement: "[EMAIL_REDACTED]" },
	// Phone numbers (Colombian: +57 300 123 4567, 3001234567, etc.)
	{ pattern: /(?:\+?57)?\s*3\d{2}\s*\d{3}\s*\d{4}\b/g, replacement: "[PHONE_REDACTED]" },
	// URLs with sensitive paths
	{ pattern: /https?:\/\/[^\s]+/g, replacement: "[URL_REDACTED]" },
];

export function redactSensitiveContent(content: string): string {
	let redacted = content;
	for (const { pattern, replacement } of REDACTION_PATTERNS) {
		redacted = redacted.replace(pattern, replacement);
	}
	return redacted;
}

// ─── Provider Implementations ───────────────────────────────────────────────

class OpenAIAdapter implements AIProviderAdapter {
	private available: boolean;
	private readonly apiKey: string;

	constructor() {
		this.apiKey = process.env.OPENAI_API_KEY || "";
		this.available = this.apiKey.length > 0;
	}

	async generateResponse(systemPrompt: string, userMessage: string): Promise<string> {
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify({
				model: "gpt-4o-mini",
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: userMessage },
				],
				temperature: 0.7,
				max_tokens: 2048,
			}),
		});

		if (!response.ok) {
			const errText = await response.text();
			throw new ServiceUnavailableError(`OpenAI API error: ${errText}`, "AI_SERVICE_UNAVAILABLE");
		}

		const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
		return data.choices?.[0]?.message?.content || "";
	}

	isAvailable(): boolean {
		return this.available;
	}

	getProviderName(): string {
		return "openai";
	}
}

class GeminiAdapter implements AIProviderAdapter {
	private available: boolean;
	private readonly apiKey: string;

	constructor() {
		this.apiKey = process.env.GEMINI_API_KEY || "";
		this.available = this.apiKey.length > 0;
	}

	async generateResponse(systemPrompt: string, userMessage: string): Promise<string> {
		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }],
					generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
				}),
			},
		);

		if (!response.ok) {
			const errText = await response.text();
			throw new ServiceUnavailableError(`Gemini API error: ${errText}`, "AI_SERVICE_UNAVAILABLE");
		}

		const data = (await response.json()) as {
			candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
		};
		return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
	}

	isAvailable(): boolean {
		return this.available;
	}

	getProviderName(): string {
		return "gemini";
	}
}

class OllamaAdapter implements AIProviderAdapter {
	private available: boolean;
	private readonly baseUrl: string;
	private readonly model: string;

	constructor() {
		this.baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
		this.model = process.env.OLLAMA_MODEL || "llama3.2";
		this.available = true;
	}

	async generateResponse(systemPrompt: string, userMessage: string): Promise<string> {
		const response = await fetch(`${this.baseUrl}/api/chat`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model: this.model,
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: userMessage },
				],
				stream: false,
				options: { temperature: 0.7 },
			}),
		});

		if (!response.ok) {
			const errText = await response.text();
			throw new ServiceUnavailableError(`Ollama API error: ${errText}`, "AI_SERVICE_UNAVAILABLE");
		}

		const data = (await response.json()) as { message?: { content?: string } };
		return data.message?.content || "";
	}

	isAvailable(): boolean {
		return this.available;
	}

	getProviderName(): string {
		return `ollama-${this.model}`;
	}
}

// ─── Provider Registry ─────────────────────────────────────────────────────

const rateLimiter = new RateLimiter(env.AI_RATE_LIMIT_RPM);

let activeProvider: AIProviderAdapter | null = null;

function initializeProvider(): AIProviderAdapter | null {
	if (!env.ENABLE_CERMONT_AI) {
		return null;
	}

	if (process.env.OPENAI_API_KEY) {
		return new OpenAIAdapter();
	}
	if (process.env.GEMINI_API_KEY) {
		return new GeminiAdapter();
	}
	if (process.env.OLLAMA_BASE_URL) {
		return new OllamaAdapter();
	}

	return null;
}

function getProvider(): AIProviderAdapter | null {
	if (!activeProvider) {
		activeProvider = initializeProvider();
	}
	return activeProvider;
}

export function resetProvider(): void {
	activeProvider = null;
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function generateWithProvider(
	systemPrompt: string,
	userMessage: string,
	context: AIContext,
): Promise<{ content: string; provider: string }> {
	const provider = getProvider();

	if (!provider?.isAvailable()) {
		log.warn("No AI provider available for request", { userId: context.userId });
		throw new ServiceUnavailableError(
			"No hay proveedor de IA configurado. Contacta al administrador.",
			"AI_SERVICE_UNAVAILABLE",
		);
	}

	// Rate limiting check
	const rateLimitKey = `ai:${context.userId}`;
	if (!rateLimiter.check(rateLimitKey)) {
		log.warn("Rate limit hit for user", { userId: context.userId });
		throw new ServiceUnavailableError(
			"Has alcanzado el límite de solicitudes. Intenta de nuevo en un minuto.",
			"RATE_LIMITED",
		);
	}

	// Content redaction
	const redactedUserMessage = redactSensitiveContent(userMessage);
	const redactedSystemPrompt = redactSensitiveContent(systemPrompt);

	try {
		const content = await provider.generateResponse(redactedSystemPrompt, redactedUserMessage);

		// Audit log
		await createAuditLog({
			action: "AI_CHAT_COMPLETION",
			entity: "AIInteraction",
			entityId: context.serviceCaseId,
			userId: context.userId,
			metadata: {
				provider: provider.getProviderName(),
				promptLength: redactedUserMessage.length,
				responseLength: content.length,
				success: true,
			},
		}).catch((err) => log.error("Failed to audit AI interaction", { error: err }));

		return { content, provider: provider.getProviderName() };
	} catch (error) {
		// Audit failure
		await createAuditLog({
			action: "AI_CHAT_COMPLETION",
			entity: "AIInteraction",
			entityId: context.serviceCaseId,
			userId: context.userId,
			metadata: {
				provider: provider.getProviderName(),
				promptLength: redactedUserMessage.length,
				responseLength: 0,
				success: false,
				error: error instanceof Error ? error.message : String(error),
			},
		}).catch((err) => log.error("Failed to audit AI interaction failure", { error: err }));

		throw error;
	}
}

export function isAiAvailable(): boolean {
	if (!env.ENABLE_CERMONT_AI) {
		return false;
	}
	const provider = getProvider();
	return provider?.isAvailable() ?? false;
}

export function getActiveProviderName(): string {
	const provider = getProvider();
	if (!provider) {
		return "none";
	}
	return provider.getProviderName();
}

export { RateLimiter };
