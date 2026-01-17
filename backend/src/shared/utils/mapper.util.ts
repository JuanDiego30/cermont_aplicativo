export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

export function mapNullableObject<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      value === null ? undefined : value,
    ]),
  ) as T;
}
