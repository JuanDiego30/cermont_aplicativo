/**
 * FSSM (Field Service Management) Adapter
 *
 * Maps Cermont operations to FSSM-compatible schemas.
 * Default local mode — no external connection required.
 */

import type { ErpSyncOperation } from "@cermont/shared-types";
import type { ErpOperationResult, ErpProviderAdapter } from "../erp-core-engine";

export class FSSMAdapter implements ErpProviderAdapter {
	readonly provider = "fssm";
	readonly name = "Field Service Management";
	readonly enabled = true;

	async initialize(): Promise<void> {
		// In local mode, no external connection needed
	}

	async healthCheck(): Promise<ErpOperationResult> {
		return {
			provider: this.provider,
			success: true,
			data: { status: "local_mode", adapter: "fssm" },
		};
	}

	async execute(
		operation: ErpSyncOperation,
		payload: Record<string, unknown>,
	): Promise<ErpOperationResult> {
		switch (operation) {
			case "create_order":
				return this.createOrder(payload);
			case "update_order":
				return this.updateOrder(payload);
			case "sync_workforce":
				return this.syncWorkforce(payload);
			case "sync_assets":
				return this.syncAssets(payload);
			case "push_evidence":
				return this.pushEvidence(payload);
			default:
				return {
					provider: this.provider,
					success: false,
					error: `Operation ${operation} not supported by FSSM adapter`,
				};
		}
	}

	private async createOrder(payload: Record<string, unknown>): Promise<ErpOperationResult> {
		return {
			provider: this.provider,
			success: true,
			data: {
				externalId: payload._id ?? payload.id,
				status: "created",
				syncedAt: new Date().toISOString(),
			},
		};
	}

	private async updateOrder(payload: Record<string, unknown>): Promise<ErpOperationResult> {
		return {
			provider: this.provider,
			success: true,
			data: { externalId: payload._id, status: "updated", syncedAt: new Date().toISOString() },
		};
	}

	private async syncWorkforce(payload: Record<string, unknown>): Promise<ErpOperationResult> {
		return {
			provider: this.provider,
			success: true,
			data: { synced: true, technicians: payload.technicians ?? [] },
		};
	}

	private async syncAssets(payload: Record<string, unknown>): Promise<ErpOperationResult> {
		return {
			provider: this.provider,
			success: true,
			data: { synced: true, assets: payload.assets ?? [] },
		};
	}

	private async pushEvidence(payload: Record<string, unknown>): Promise<ErpOperationResult> {
		return {
			provider: this.provider,
			success: true,
			data: { evidenceSubmitted: true, evidenceId: payload.evidenceId },
		};
	}
}
