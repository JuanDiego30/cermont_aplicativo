/**
 * Auth Domain Rules
 *
 * Token TTL constants, password policy, and login attempt limits.
 * Framework-agnostic — no Express or Mongoose imports.
 */

export const ACCESS_TOKEN_TTL = "15m";
export const REFRESH_TOKEN_TTL = "7d";
export const ACCESS_EXPIRES_IN = 900; // 15 min in seconds
export const REFRESH_EXPIRES_IN = 7 * 24 * 3600; // 7 days in seconds

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_PATTERN = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function validatePasswordPolicy(password: string): { valid: boolean; reason?: string } {
	if (password.length < PASSWORD_MIN_LENGTH) {
		return { valid: false, reason: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
	}
	if (password.length > PASSWORD_MAX_LENGTH) {
		return { valid: false, reason: `Password must not exceed ${PASSWORD_MAX_LENGTH} characters` };
	}
	if (!PASSWORD_PATTERN.test(password)) {
		return { valid: false, reason: "Password must contain uppercase, lowercase, and a number" };
	}
	return { valid: true };
}
