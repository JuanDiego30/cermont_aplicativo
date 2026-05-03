/**
 * MongoDB ObjectId Validation Utility for Cermont Backend
 *
 * Provides safe ObjectId parsing with proper error handling.
 * Replaces inline `new (require('mongoose').Types.ObjectId)(id)` patterns.
 */

import { Types } from "mongoose";
import { BadRequestError } from "../errors";

/**
 * Validate and convert a string to MongoDB ObjectId
 * @throws BadRequestError if ID format is invalid
 */
export function parseObjectId(id: string): Types.ObjectId {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError(`Invalid ID format: ${id}`, "INVALID_ID");
	}
	return new Types.ObjectId(id);
}

/**
 * Check if a string is a valid MongoDB ObjectId (no throw)
 */
export function isValidObjectId(id: string): boolean {
	return Types.ObjectId.isValid(id);
}
