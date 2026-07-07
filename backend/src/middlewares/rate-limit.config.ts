import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		error: {
			code: "RATE_LIMIT_EXCEEDED",
			message: "Too many auth attempts. Try again in 15 minutes.",
		},
	},
});

export const apiLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Slow down." },
	},
});

export const uploadLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		error: { code: "UPLOAD_LIMIT_EXCEEDED", message: "Upload limit reached. Try again later." },
	},
});

export const portalLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 30,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests." },
	},
});
