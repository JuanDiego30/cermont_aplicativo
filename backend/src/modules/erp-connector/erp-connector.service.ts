/**
 * ErpConnectorService — Business logic for ERP connector management
 */
import type { CreateErpConnectorInput, UpdateErpConnectorInput } from "@cermont/shared-types";
import { AppError } from "../../common/errors/AppError";
import { ErpConnector } from "../../models/ErpConnector";
import { erpEngine } from "../../services/erp";

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
}

export const erpConnectorService = new ErpConnectorService();
