export interface FieldMapping {
	localField: string;
	remoteField: string;
	transform?: "string" | "number" | "date" | "uppercase" | "lowercase";
	defaultValue?: unknown;
}

export interface ProviderFieldMappings {
	provider: string;
	mappings: FieldMapping[];
}

const DEFAULT_MAPPINGS: Record<string, FieldMapping[]> = {
	fssm: [
		{ localField: "invoiceNumber", remoteField: "externalInvoiceId", transform: "string" },
		{ localField: "clientName", remoteField: "customerName", transform: "uppercase" },
		{ localField: "totalAmount", remoteField: "totalValue", transform: "number" },
		{ localField: "currency", remoteField: "currencyCode", transform: "uppercase" },
		{ localField: "issueDate", remoteField: "documentDate", transform: "date" },
	],
	gmao_csm: [
		{ localField: "invoiceNumber", remoteField: "ordenNumber", transform: "string" },
		{ localField: "clientName", remoteField: "solicitante", transform: "uppercase" },
		{ localField: "totalAmount", remoteField: "valorTotal", transform: "number" },
		{ localField: "currency", remoteField: "moneda", transform: "uppercase" },
		{ localField: "issueDate", remoteField: "fechaEmision", transform: "date" },
	],
	sap: [
		{ localField: "invoiceNumber", remoteField: "VBELN", transform: "string" },
		{ localField: "clientName", remoteField: "KUNNR_NAME", transform: "uppercase" },
		{ localField: "totalAmount", remoteField: "NETWR", transform: "number" },
		{ localField: "currency", remoteField: "WAERS", transform: "uppercase" },
		{ localField: "issueDate", remoteField: "ERDAT", transform: "date" },
	],
	ariba: [
		{ localField: "invoiceNumber", remoteField: "invoiceId", transform: "string" },
		{ localField: "clientName", remoteField: "supplierName", transform: "uppercase" },
		{ localField: "totalAmount", remoteField: "total", transform: "number" },
		{ localField: "currency", remoteField: "currency", transform: "uppercase" },
		{ localField: "issueDate", remoteField: "date", transform: "date" },
	],
};

export const FieldMappingService = {
	getDefaultMappings(provider: string): FieldMapping[] {
		return DEFAULT_MAPPINGS[provider] ?? [];
	},

	applyMapping<TInput extends Record<string, unknown>>(
		data: TInput,
		mappings: FieldMapping[],
	): Record<string, unknown> {
		const result: Record<string, unknown> = {};
		for (const mapping of mappings) {
			const value = data[mapping.localField];
			if (value === undefined || value === null) {
				if (mapping.defaultValue !== undefined) {
					result[mapping.remoteField] = mapping.defaultValue;
				}
				continue;
			}
			result[mapping.remoteField] = transformValue(value, mapping.transform);
		}
		return result;
	},

	validateMapping(mappings: FieldMapping[]): string[] {
		const errors: string[] = [];
		const seenLocal = new Set<string>();
		const seenRemote = new Set<string>();
		for (const mapping of mappings) {
			if (!mapping.localField || mapping.localField.trim().length === 0) {
				errors.push("Empty localField detected");
			}
			if (!mapping.remoteField || mapping.remoteField.trim().length === 0) {
				errors.push(`Remote field missing for local field: ${mapping.localField}`);
			}
			if (seenLocal.has(mapping.localField)) {
				errors.push(`Duplicate local field mapping: ${mapping.localField}`);
			}
			if (seenRemote.has(mapping.remoteField)) {
				errors.push(`Duplicate remote field mapping: ${mapping.remoteField}`);
			}
			seenLocal.add(mapping.localField);
			seenRemote.add(mapping.remoteField);
		}
		return errors;
	},
};

function transformValue(value: unknown, transform?: string): unknown {
	switch (transform) {
		case "string":
			return String(value);
		case "number": {
			const num = Number(value);
			return Number.isNaN(num) ? value : num;
		}
		case "date":
			return value instanceof Date ? value.toISOString() : String(value);
		case "uppercase":
			return String(value).toUpperCase();
		case "lowercase":
			return String(value).toLowerCase();
		default:
			return value;
	}
}
