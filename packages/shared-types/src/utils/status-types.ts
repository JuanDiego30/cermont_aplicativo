/**
 * StatusAbsent<T> — A discriminated union that replaces null/undefined sentinel patterns.
 *
 * Instead of returning `T | null | undefined`, return a `StatusObject<T>`:
 * - `{ status: "present", value: T }` — data is available
 * - `{ status: "absent" }` — data is not available
 *
 * This eliminates null/undefined from business logic code paths,
 * aligning with Cermont's development rules against null/undefined sentinels.
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

/** Status variant when data is present */
export type StatusPresent<T> = { status: "present"; value: T };

/** Status variant when data is absent */
export type StatusAbsent = { status: "absent" };

/**
 * Discriminated union representing optional data without null/undefined.
 * Use this instead of `T | null | undefined` in all business logic.
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
