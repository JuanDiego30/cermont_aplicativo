/**
 * ErpConnector Mongoose Model
 *
 * Stores registered ERP connector configurations.
 * Each connector represents a configured external system adapter
 * (FSSM, GMAO/CSM, SAP, DIAN, etc.).
 */
import { model, Schema } from "mongoose";
import { optimisticConcurrency } from "./plugins/optimistic-concurrency";

const ErpConnectorSchema = new Schema(
	{
		provider: {
			type: String,
			required: true,
			enum: ["fssm", "gmao_csm", "sap", "ariba", "dian", "custom"],
		},
		name: { type: String, required: true },
		baseUrl: String,
		authType: {
			type: String,
			enum: ["api_key", "oauth2", "basic", "jwt", "none"],
			required: true,
		},
		authConfig: { type: Schema.Types.Mixed },
		enabled: { type: Boolean, default: true },
		syncInterval: { type: Number, default: 300 },
		metadata: { type: Schema.Types.Mixed },
		lifecycleStatus: { type: String, enum: ["active", "deleted"], default: "active" },
	},
	{ timestamps: true },
);

ErpConnectorSchema.plugin(optimisticConcurrency);

ErpConnectorSchema.index({ provider: 1, lifecycleStatus: 1 });

export const ErpConnector = model("ErpConnector", ErpConnectorSchema);
