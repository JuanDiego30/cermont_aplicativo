/**
 * ERPCoreEngine — Pluggable multi-ERP abstraction layer
 *
 * Each provider implements the ErpProviderAdapter interface.
 * The engine routes operations to the correct provider adapter.
 * Inspired by FlexDesk manager pattern.
 */
import type { ErpSyncOperation } from "@cermont/shared-types";

export interface ErpOperationResult {
	success: boolean;
	data?: unknown;
	error?: string;
	provider: string;
}

export interface ErpProviderAdapter {
	readonly provider: string;
	readonly name: string;
	readonly enabled: boolean;

	initialize(): Promise<void>;
	healthCheck(): Promise<ErpOperationResult>;

	execute(
		operation: ErpSyncOperation,
		payload: Record<string, unknown>,
	): Promise<ErpOperationResult>;
}

export class ERPCoreEngine {
	private providers = new Map<string, ErpProviderAdapter>();

	registerProvider(adapter: ErpProviderAdapter): void {
		this.providers.set(adapter.provider, adapter);
	}

	getProvider(provider: string): ErpProviderAdapter | null {
		return this.providers.get(provider) ?? null;
	}

	listProviders(): Array<{ provider: string; name: string; enabled: boolean }> {
		return Array.from(this.providers.values()).map((a) => ({
			provider: a.provider,
			name: a.name,
			enabled: a.enabled,
		}));
	}

	async executeOnAll(
		operation: ErpSyncOperation,
		payload: Record<string, unknown>,
	): Promise<ErpOperationResult[]> {
		const results: ErpOperationResult[] = [];
		for (const adapter of this.providers.values()) {
			if (!adapter.enabled) {
				continue;
			}
			try {
				const result = await adapter.execute(operation, payload);
				results.push(result);
			} catch (error) {
				results.push({
					provider: adapter.provider,
					success: false,
					error: String(error),
				});
			}
		}
		return results;
	}

	async healthCheckAll(): Promise<ErpOperationResult[]> {
		const results: ErpOperationResult[] = [];
		for (const adapter of this.providers.values()) {
			if (!adapter.enabled) {
				continue;
			}
			try {
				const result = await adapter.healthCheck();
				results.push(result);
			} catch (error) {
				results.push({
					provider: adapter.provider,
					success: false,
					error: String(error),
				});
			}
		}
		return results;
	}
}

export const erpEngine = new ERPCoreEngine();
