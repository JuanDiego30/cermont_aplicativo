import { Optional } from '@cermont/shared-types';

/**
 * Helper function to convert null values to undefined
 * This is useful when mapping from Prisma (which returns null) to DTOs (which use undefined)
 */
export function nullToUndefined<T>(value: T | null): Optional<T> {
  return value === null ? undefined : value;
}

/**
 * Helper function to recursively convert all null properties in an object to undefined
 */
export function mapNullsToUndefined<T extends Record<string, unknown>>(
  obj: T
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key in obj) {
    const value = obj[key];
    if (value === null) {
      result[key] = undefined;
    } else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      result[key] = mapNullsToUndefined(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Helper function to convert null properties in arrays of objects to undefined
 */
export function mapArrayNullsToUndefined<T extends Record<string, unknown>>(
  arr: T[]
): Array<Record<string, unknown>> {
  return arr.map(item => mapNullsToUndefined(item));
}
