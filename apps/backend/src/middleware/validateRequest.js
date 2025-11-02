/**
 * Compatibility wrapper: re-export validateRequest from validate.js
 * Some routes import ../middleware/validateRequest.js — keep compatibility
 */
import { validateRequest } from './validate.js';

export { validateRequest };
