export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

export type NullableToUndefined<T> = {
  [K in keyof T]: T[K] extends null ? undefined : T[K];
};

export function mapNullableObject<T extends Record<string, unknown>>(
  obj: T,
): NullableToUndefined<T> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      value === null ? undefined : value,
    ]),
  ) as NullableToUndefined<T>;
}
