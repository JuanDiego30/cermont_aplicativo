import { createHash } from "node:crypto";
import { z } from "zod";

import * as apiContracts from "../src/api";
import * as schemas from "../src/schemas";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

type SerializableRecord = Record<string, JsonValue>;

const SNAPSHOT_SCHEMA_VERSION = 1;

function isZodSchema(value: unknown): value is z.ZodType {
	return value instanceof z.ZodType;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return (
		value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype
	);
}

function isTransformSchemaError(error: unknown): boolean {
	return (
		error instanceof Error &&
		error.message.includes("Transforms cannot be represented in JSON Schema")
	);
}

function collectSchemaChildren(schema: z.ZodType): z.ZodType[] {
	const candidate = schema as z.ZodType & {
		def?: Record<string, unknown>;
		unwrap?: () => unknown;
	};

	const children: z.ZodType[] = [];
	const pushChild = (value: unknown): void => {
		if (isZodSchema(value) && !children.includes(value)) {
			children.push(value);
		}
	};

	if (typeof candidate.unwrap === "function") {
		pushChild(candidate.unwrap());
	}

	const def = candidate.def;
	if (def) {
		pushChild(def.in);
		pushChild(def.out);
		pushChild(def.innerType);
	}

	return children;
}

function serializeSchema(value: z.ZodType, seen = new Set<z.ZodType>()): JsonValue | undefined {
	if (seen.has(value)) {
		return undefined;
	}

	seen.add(value);

	try {
		return stableJson(z.toJSONSchema(value, { unrepresentable: "any" }) as JsonValue);
	} catch (error) {
		if (!isTransformSchemaError(error)) {
			throw error;
		}

		for (const child of collectSchemaChildren(value)) {
			const serialized = serializeSchema(child, seen);

			if (serialized !== undefined) {
				return serialized;
			}
		}

		return undefined;
	}
}

function stableJson(value: JsonValue): JsonValue {
	if (Array.isArray(value)) {
		return value.map(stableJson);
	}

	if (isPlainObject(value)) {
		const sortedKeys = Object.keys(value).sort((a, b) => a.localeCompare(b));
		const sortedObject: SerializableRecord = {};

		for (const key of sortedKeys) {
			sortedObject[key] = stableJson(value[key] as JsonValue);
		}

		return sortedObject;
	}

	return value;
}

function serializeValue(value: unknown): JsonValue | undefined {
	if (
		value === null ||
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean"
	) {
		return value;
	}

	if (isZodSchema(value)) {
		return serializeSchema(value);
	}

	if (Array.isArray(value)) {
		return value
			.map((entry) => serializeValue(entry))
			.filter((entry): entry is JsonValue => entry !== undefined);
	}

	if (isPlainObject(value)) {
		const result: SerializableRecord = {};

		for (const key of Object.keys(value).sort((a, b) => a.localeCompare(b))) {
			const serialized = serializeValue(value[key]);
			if (serialized !== undefined) {
				result[key] = serialized;
			}
		}

		return result;
	}

	return undefined;
}

function pickSchemaExports(): SerializableRecord {
	const schemaEntries = Object.entries(schemas)
		.filter(
			([exportName, exportedValue]) => exportName.endsWith("Schema") && isZodSchema(exportedValue),
		)
		.sort(([a], [b]) => a.localeCompare(b));

	const selectedSchemas: SerializableRecord = {};

	for (const [exportName, exportedValue] of schemaEntries) {
		const serialized = serializeSchema(exportedValue);

		if (serialized !== undefined) {
			selectedSchemas[exportName] = serialized;
		}
	}

	return selectedSchemas;
}

function pickApiExports(): SerializableRecord {
	const apiEntries = Object.entries(apiContracts)
		.filter(
			([exportName, exportedValue]) => exportName.endsWith("API") && isPlainObject(exportedValue),
		)
		.sort(([a], [b]) => a.localeCompare(b));

	const selectedApis: SerializableRecord = {};

	for (const [exportName, exportedValue] of apiEntries) {
		const serialized = serializeValue(exportedValue);

		if (serialized && isPlainObject(serialized)) {
			selectedApis[exportName] = serialized;
		}
	}

	return selectedApis;
}

export function buildApiContractSnapshot(): SerializableRecord {
	return {
		schemaVersion: SNAPSHOT_SCHEMA_VERSION,
		schemas: pickSchemaExports(),
		apis: pickApiExports(),
	};
}

export function stringifyApiContractSnapshot(snapshot: SerializableRecord): string {
	return `${JSON.stringify(stableJson(snapshot), null, 2)}\n`;
}

export function createSnapshotHash(snapshotContent: string): string {
	const digest = createHash("sha256").update(snapshotContent).digest("hex");
	return `sha256:${digest}`;
}
