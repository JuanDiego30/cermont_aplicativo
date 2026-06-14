import {
	shouldSkipAuthRateLimit,
	shouldSkipGlobalRateLimit,
} from "../../src/common/security/rate-limit";

describe("global rate-limit scope", () => {
	it.each([
		"/api/health",
		"/api/health/live",
		"/api/health/ready",
		"/health/live",
		"/api/auth/login",
		"/api/auth/refresh",
		"/api/auth/me",
	])("keeps operational health and authentication recovery outside the ordinary request bucket: %s", (path) => {
		expect(shouldSkipGlobalRateLimit({ path })).toBe(true);
	});

	it.each([
		"/api/orders",
		"/api/notifications/mark-all-read",
		"/api/sync/offline",
	])("continues rate limiting application traffic: %s", (path) => {
		expect(shouldSkipGlobalRateLimit({ path })).toBe(false);
	});

	it.each([
		"/login",
		"/forgot-password",
		"/reset-password",
	])("applies the dedicated auth limiter to credential-sensitive actions: %s", (path) => {
		expect(shouldSkipAuthRateLimit({ path })).toBe(false);
	});

	it.each([
		"/refresh",
		"/me",
		"/logout",
		"/change-password",
	])("does not spend the login-attempt budget on session lifecycle requests: %s", (path) => {
		expect(shouldSkipAuthRateLimit({ path })).toBe(true);
	});
});
