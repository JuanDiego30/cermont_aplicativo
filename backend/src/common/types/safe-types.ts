/**
 * Safe Types — TypeScript utility types for type-safe JSON handling
 *
 * SSOT for type-safe JSON serialization patterns.
 * All types in this file comply with the CERMONT zero weak-token rule.
 */

// JSON Value types
export type JsonPrimitive = string | number | boolean;

export interface JsonObject {
	[key: string]: JsonValue;
}

export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

/**
 * Remove __v from Mongoose toJSON output without using weak tokens
 */
export function removeVersionKey<T extends object>(obj: T): T {
	if ("__v" in obj) {
		const { __v: _unused, ...rest } = obj as T & { __v: number };
		return rest as T;
	}
	return obj;
}
