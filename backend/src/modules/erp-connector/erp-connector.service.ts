/**
 * ErpConnectorService — Business logic for ERP connector management
 */
import type { CreateErpConnectorInput, UpdateErpConnectorInput } from "@cermont/shared-types";
import { AppError } from "../../common/errors/AppError";
import { createLogger } from "../../common/utils/logger";
import { ErpConnector } from "../../models/ErpConnector";
import { ErpAdapter, erpEngine, FieldMappingService } from "../../services/erp";
import { SystemConfigService } from "../system-config/system-config.service";

const log = createLogger("erp-connector-service");

export class ErpConnectorService {
	async list() {
		return ErpConnector.find({ lifecycleStatus: "active" }).sort({ createdAt: -1 }).exec();
	}

	async getById(id: string) {
		const connector = await ErpConnector.findOne({ _id: id, lifecycleStatus: "active" }).exec();
		if (!connector) {
			throw new AppError("ERP Connector not found", 404, "ERP_CONNECTOR_NOT_FOUND");
		}
		return connector;
	}

	async create(data: CreateErpConnectorInput) {
		return ErpConnector.create(data);
	}

	async update(id: string, data: UpdateErpConnectorInput) {
		const connector = await ErpConnector.findOneAndUpdate(
			{ _id: id, lifecycleStatus: "active" },
			{ $set: data },
			{ returnDocument: "after" },
		).exec();
		if (!connector) {
			throw new AppError("ERP Connector not found", 404, "ERP_CONNECTOR_NOT_FOUND");
		}
		return connector;
	}

	async delete(id: string) {
		const result = await ErpConnector.findOneAndUpdate(
			{ _id: id, lifecycleStatus: "active" },
			{ $set: { lifecycleStatus: "deleted" } },
		).exec();
		if (!result) {
			throw new AppError("ERP Connector not found", 404, "ERP_CONNECTOR_NOT_FOUND");
		}
		return true;
	}

	async sync(provider: string) {
		const erpIntegrationEnabled =
			await SystemConfigService.isFeatureEnabled("enable_erp_integration");

		if (erpIntegrationEnabled) {
			const result = await ErpAdapter.sendSES(
				{
					sesNumber: `SYNC-${Date.now()}`,
					workOrderCode: "MANUAL",
					period: {
						from: new Date(Date.now() - 86400000).toISOString(),
						to: new Date().toISOString(),
					},
					totalAmount: 0,
					currency: "COP",
					clientName: "SYNC",
				},
				provider,
			);
			return [result];
		}

		const adapter = erpEngine.getProvider(provider);
		if (!adapter) {
			throw new AppError(
				`No ERP adapter registered for provider: ${provider}`,
				404,
				"ERP_ADAPTER_NOT_FOUND",
			);
		}
		if (!adapter.enabled) {
			throw new AppError(`ERP adapter is disabled: ${provider}`, 400, "ERP_ADAPTER_DISABLED");
		}
		return erpEngine.executeOnAll("create_order", { provider });
	}

	async healthCheckAll() {
		return erpEngine.healthCheckAll();
	}

	async getMetrics() {
		const providers = erpEngine.listProviders();
		return {
			totalProviders: providers.length,
			enabledProviders: providers.filter((p) => p.enabled).length,
			providers,
		};
	}

	async validateMapping(id: string, fieldMappings: Record<string, string>) {
		const connector = await this.getById(id);
		const mappingEntries = Object.entries(fieldMappings).map(([localField, remoteField]) => ({
			localField,
			remoteField,
		}));
		const errors = FieldMappingService.validateMapping(mappingEntries);

		return {
			valid: errors.length === 0,
			errors,
			connectorId: connector._id.toString(),
			provider: connector.provider,
			fieldCount: Object.keys(fieldMappings).length,
		};
	}

	async testSync(id: string) {
		const erpIntegrationEnabled =
			await SystemConfigService.isFeatureEnabled("enable_erp_integration");
		const connector = await this.getById(id);
		try {
			const provider = connector.provider;

			if (erpIntegrationEnabled) {
				const result = await ErpAdapter.queryStatus(`test-${provider}-${Date.now()}`, provider);
				return {
					success: result.status === "connected",
					message:
						result.status === "connected"
							? `ERP integration active for ${provider}`
							: `ERP integration error: ${result.error}`,
					recordsProcessed: 1,
				};
			}

			const adapter = erpEngine.getProvider(provider);
			if (!adapter) {
				return {
					success: false,
					message: `No ERP adapter registered for provider: ${provider}`,
					recordsProcessed: 0,
				};
			}
			if (!adapter.enabled) {
				return {
					success: false,
					message: `ERP adapter is disabled: ${provider}`,
					recordsProcessed: 0,
				};
			}
			const result = await erpEngine.executeOnAll("create_order", { provider });
			return {
				success: true,
				message: `Test sync completed for ${provider}`,
				recordsProcessed: Array.isArray(result) ? result.length : 1,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Unexpected error during test sync",
				recordsProcessed: 0,
			};
		}
	}

	async sendInvoiceToErp(payload: {
		invoiceNumber: string;
		clientName: string;
		totalAmount: number;
		currency: string;
		issueDate: string;
		provider?: string;
	}) {
		const erpIntegrationEnabled =
			await SystemConfigService.isFeatureEnabled("enable_erp_integration");
		if (!erpIntegrationEnabled) {
			log.info("ERP integration disabled, tracking invoice internally", {
				invoiceNumber: payload.invoiceNumber,
			});
			return {
				success: true,
				status: "tracked_locally",
				syncedAt: new Date().toISOString(),
				provider: payload.provider ?? "internal",
			};
		}
		return ErpAdapter.sendInvoice(payload, payload.provider);
	}
}

export const erpConnectorService = new ErpConnectorService();
