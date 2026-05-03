/**
 * Common Utils — Barrel Export
 *
 * Shared utilities used across the backend.
 */

export { createLogger, logger } from "./logger";
export { offsetToPage, parseNumberQuery, toIsoString, toStringId } from "./mapping";
export {
	escapeRegExp,
	normalizeBoolean,
	normalizeQuantity,
	normalizeText,
	normalizeTextOptional,
} from "./normalization";
export { isValidObjectId, parseObjectId } from "./parseObjectId";
