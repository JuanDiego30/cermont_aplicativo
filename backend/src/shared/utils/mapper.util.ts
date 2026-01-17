export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

export function mapNullableObject<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, value === null ? undefined : value])
  ) as T;
}

export function arrayToMap<K, V>(array: V[], keySelector: (item: V) => K): Map<K, V> {
  return new Map(array.map(item => [keySelector(item), item]));
}
