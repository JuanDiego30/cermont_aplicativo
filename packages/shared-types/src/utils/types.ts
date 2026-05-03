/**
 * Utility Types - Advanced TypeScript patterns for type safety
 *
 * This file contains reusable type utilities following TypeScript best practices:
 * - Branded types for entity IDs to prevent mixing different ID types
 * - Generic utility types for API operations
 * - Type guards and discriminated unions helpers
 *
 * @see DOC-09 for schema specifications
 * @packageDocumentation
 */

/**
 * Branded type to create nominal typing for IDs
 * Prevents accidentally mixing different types of IDs (e.g., userId with orderId)
 *
 * @example
 * ```typescript
 * type UserId = Brand<string, 'UserId'>;
 * type OrderId = Brand<string, 'OrderId'>;
 *
 * function getUser(id: UserId) { ... }
 * function getOrder(id: OrderId) { ... }
 *
 * const userId = 'abc' as UserId;
 * const orderId = 'xyz' as OrderId;
 *
 * getUser(userId);      // ✅ OK
 * getUser(orderId);     // ❌ Type error
 * ```
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * Entity ID branded types for type-safe ID handling
 */
export type UserId = Brand<string, "UserId">;
export type OrderId = Brand<string, "OrderId">;
export type ProposalId = Brand<string, "ProposalId">;
export type ChecklistId = Brand<string, "ChecklistId">;
export type CostId = Brand<string, "CostId">;
export type ResourceId = Brand<string, "ResourceId">;
export type InspectionId = Brand<string, "InspectionId">;
export type ReportId = Brand<string, "ReportId">;
export type MaintenanceKitId = Brand<string, "MaintenanceKitId">;

/**
 * Deep partial utility - makes all properties optional recursively
 * Useful for update operations where any field can be partially updated
 *
 * @example
 * ```typescript
 * interface Order {
 *   id: string;
 *   details: {
 *     name: string;
 *     price: number;
 *   };
 * }
 *
 * type PartialOrder = DeepPartial<Order>;
 * // { id?: string; details?: { name?: string; price?: number; } }
 * ```
 */
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object
		? T[P] extends Array<infer U>
			? Array<DeepPartial<U>>
			: DeepPartial<T[P]>
		: T[P];
};

/**
 * Deep readonly utility - makes all properties readonly recursively
 * Useful for immutable data structures and preventing accidental mutations
 *
 * @example
 * ```typescript
 * interface Config {
 *   database: {
 *     host: string;
 *     port: number;
 *   };
 * }
 *
 * type ReadonlyConfig = DeepReadonly<Config>;
 * // { readonly database: { readonly host: string; readonly port: number; } }
 * ```
 */
export type DeepReadonly<T> = {
	readonly [P in keyof T]: T[P] extends object
		? T[P] extends (...args: never[]) => unknown
			? T[P]
			: DeepReadonly<T[P]>
		: T[P];
};

/**
 * Require at least one property from a type
 * Useful for update operations where at least one field must be provided
 *
 * @example
 * ```typescript
 * interface User {
 *   name?: string;
 *   email?: string;
 *   age?: number;
 * }
 *
 * type UpdateUser = RequireAtLeastOne<User>;
 * // At least one of name, email, or age must be provided
 * ```
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
	{
		[K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
	}[Keys];

/**
 * Extract keys from a type that match a specific value type
 * Useful for filtering properties by their type
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   age: number;
 *   active: boolean;
 * }
 *
 * type StringKeys = KeysOfType<User, string>; // 'id' | 'name'
 * type NumberKeys = KeysOfType<User, number>; // 'age'
 * ```
 */
export type KeysOfType<T, U> = {
	[K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Pick properties from a type that match a specific value type
 * Useful for creating subtypes with only certain property types
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   age: number;
 *   active: boolean;
 * }
 *
 * type StringFields = PickByType<User, string>; // { id: string; name: string; }
 * ```
 */
export type PickByType<T, U> = {
	[K in KeysOfType<T, U>]: T[K];
};

/**
 * Omit properties from a type that match a specific value type
 * Useful for creating subtypes excluding certain property types
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   age: number;
 *   active: boolean;
 * }
 *
 * type NonStringFields = OmitByType<User, string>; // { age: number; active: boolean; }
 * ```
 */
export type OmitByType<T, U> = {
	[K in Exclude<keyof T, KeysOfType<T, U>>]: T[K];
};

/**
 * Make specific properties required while keeping others as-is
 * Useful for partial updates where certain fields are mandatory
 *
 * @example
 * ```typescript
 * interface User {
 *   id?: string;
 *   name?: string;
 *   email?: string;
 * }
 *
 * type UserWithRequiredId = RequireKeys<User, 'id'>; // { id: string; name?: string; email?: string; }
 * ```
 */
export type RequireKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Make specific properties optional while keeping others as-is
 * Useful for creating flexible input types
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 *
 * type UserWithOptionalEmail = OptionalKeys<User, 'email'>; // { id: string; name: string; email?: string; }
 * ```
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Nullable type - represents a value that may be null.
 * Use this for Mongoose/MongoDB fields and API responses where null signals "absent".
 *
 * @example
 * ```typescript
 * type NullableString = Nullable<string>; // string | null
 * ```
 */
export type Nullable<T> = T | null;

/**
 * Nullish type - allows null or undefined.
 * Prefer Nullable<T> for database/API boundaries; reserve Nullish<T>
 * for cases where undefined and null have distinct semantics (rare).
 *
 * @example
 * ```typescript
 * type NullishString = Nullish<string>; // string | null | undefined
 * ```
 */
export type Nullish<T> = T | null | undefined;

/**
 * NonNullableFields - makes all fields of a type non-nullable
 * Useful for ensuring required data is present
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string | null;
 *   email?: string;
 * }
 *
 * type NonNullUser = NonNullableFields<User>; // { name: string; email: string; }
 * ```
 */
export type NonNullableFields<T> = {
	[P in keyof T]-?: NonNullable<T[P]>;
};

/**
 * Mutable - removes readonly modifiers from all properties
 * Useful for creating mutable copies of readonly types
 *
 * @example
 * ```typescript
 * interface ReadonlyUser {
 *   readonly id: string;
 *   readonly name: string;
 * }
 *
 * type MutableUser = Mutable<ReadonlyUser>; // { id: string; name: string; }
 * ```
 */
export type Mutable<T> = {
	-readonly [P in keyof T]: T[P];
};

/**
 * ValueOf - extracts the value types from an object type
 * Useful for working with object values generically
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   age: number;
 *   active: boolean;
 * }
 *
 * type UserValue = ValueOf<User>; // string | number | boolean
 * ```
 */
export type ValueOf<T> = T[keyof T];
