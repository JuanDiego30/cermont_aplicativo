/**
 * Test Utilities — Type-safe mock helpers
 *
 * Replaces `as any` casts in test files with properly typed helpers.
 * This keeps tests strict while avoiding verbose type declarations in every test.
 */

/**
 * Creates a typed mock object from a partial definition.
 * Use this instead of `someObject as any` for mock data.
 */
export function mockPartial<T>(partial: Partial<T>): T {
	return partial as T;
}

/**
 * Type-safe wrapper for Mongoose query chain mocks.
 * Mongoose queries return `this` for chaining, which is hard to type in tests.
 */
export function mockQueryChain(resolvedValue: unknown) {
	const chain: Record<string, ReturnType<typeof vi.fn>> = {};
	const proxy = new Proxy(chain, {
		get(_target, prop: string) {
			if (!chain[prop]) {
				chain[prop] = vi.fn().mockReturnValue(proxy);
			}
			return chain[prop];
		},
	});

	// biome-ignore lint/suspicious/noThenProperty: Mongoose query mocks must be thenable for await
	(proxy as unknown as { then: Promise<unknown>["then"] }).then = (
		resolve: (v: unknown) => void,
		_reject?: (e: unknown) => void,
	) => Promise.resolve(resolvedValue).then(resolve);

	return proxy as Record<string, ReturnType<typeof vi.fn>> & {
		then: (resolve: (v: unknown) => void, reject?: (e: unknown) => void) => void;
	};
}

/**
 * Type-safe cast for jwt.sign/verify mock return values.
 * These return `string` | `object` depending on usage.
 */
export function mockJwtReturn(value: string): string {
	return value;
}
