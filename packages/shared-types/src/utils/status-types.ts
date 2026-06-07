/**
 * StatusAbsent<T> — A discriminated union that replaces sentinel absence patterns.
 *
 * Instead of returning raw empty sentinels, return a `StatusObject<T>`:
 * - `{ status: "present", value: T }` — data is available
 * - `{ status: "absent" }` — data is not available
 *
 * This eliminates empty sentinel values from business logic code paths,
 * aligning with Cermont's development rules against absence sentinels.
 *
 * @example
 * ```typescript
 * const user: StatusObject<User> = getUser(id);
 * if (isPresent(user)) {
 *   console.log(user.value.name); // type-safe access, no null check needed
 * }
 * const name = getValue(user, "Guest"); // safe access with fallback
 * ```
 */

import { z } from "zod";

/** Status variant when data is present */
export type StatusPresent<T> = { status: "present"; value: T };

/** Status variant when data is absent */
export type StatusAbsent = { status: "absent" };

/**
 * Discriminated union representing optional data without raw absence sentinels.
 * Use this instead of raw empty-value unions in all business logic.
 */
export type StatusObject<T> = StatusPresent<T> | StatusAbsent;

/**
 * Type guard that narrows a StatusObject to its present variant.
 *
 * @example
 * ```typescript
 * const result: StatusObject<User> = fetchUser();
 * if (isPresent(result)) {
 *   // result is narrowed to StatusPresent<User>
 *   console.log(result.value.name);
 * }
 * ```
 */
export function isPresent<T>(v: StatusObject<T>): v is StatusPresent<T> {
	return v.status === "present";
}

/**
 * Type guard that narrows a StatusObject to its absent variant.
 */
export function isAbsent<T>(v: StatusObject<T>): v is StatusAbsent {
	return v.status === "absent";
}

/**
 * Safely extracts the value from a StatusObject, falling back to a default.
 *
 * @example
 * ```typescript
 * const name = getValue(userStatus, "Anonymous");
 * ```
 */
export function getValue<T>(v: StatusObject<T>, fallback: T): T {
	return isPresent(v) ? v.value : fallback;
}

// ─── Zod Helpers ────────────────────────────────────────────────────────────

/**
 * Zod schema factory for StatusObject<T> — a discriminated union
 * that replaces `z.nullable()` / `z.null().default(...)` patterns.
 *
 * @example
 * ```typescript
 * const CostTraceabilitySchema = z.object({
 *   variance: statusObjectOf(z.number()),
 *   // → { status: "absent" } | { status: "present"; value: number }
 *   // replaces: variance: z.number().nullable()
 * })
 * ```
 */
export function statusObjectOf<T extends z.ZodTypeAny>(schema: T) {
	return z.discriminatedUnion("status", [
		z.object({ status: z.literal("absent") }),
		z.object({ status: z.literal("present"), value: schema }),
	]);
}
