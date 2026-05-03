/**
 * Authenticated User type for Cermont Backend
 *
 * SSOT: The declare global for Express.Request.user lives in
 * backend/src/_shared/middlewares/auth.middleware.ts (AuthPayload).
 *
 * This re-export exists for backward compatibility and as a convenient
 * import path for controllers that need the user type without
 * pulling in the middleware module.
 */

export type { AuthPayload as AuthenticatedUser } from "../middlewares/auth.middleware";
