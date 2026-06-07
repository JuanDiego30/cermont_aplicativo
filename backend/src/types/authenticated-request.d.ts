/**
 * Authenticated User type for Cermont Backend
 *
 * SSOT: The declare global for Express.Request.user lives in
 * apps/backend/src/middlewares/auth.middleware.ts (AuthClaims).
 *
 * This re-export exists for backward compatibility and as a convenient
 * import path for controllers that need the user type without
 * pulling in the middleware module.
 */

export type { AuthClaims as AuthenticatedUser } from "../middlewares/auth.middleware";
