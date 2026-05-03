import { readFileSync } from "node:fs";
import path from "node:path";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { errorHandler } from "./_shared/common/errors";
import { requestId } from "./_shared/common/middlewares/request-id.middleware";
import { createLogger } from "./_shared/common/utils";
import { getDatabaseHealth } from "./_shared/config/db";
import { env } from "./_shared/config/env";
import {
	buildAllowedCorsOrigins,
	resolveRateLimitSourceIp,
	resolveTrustProxySetting,
} from "./_shared/config/http-security";
import syncRoutes from "./_shared/sync/routes";
import adminRoutes from "./admin/api/routes";
import aiRoutes from "./ai/api/routes";
import alertsRoutes from "./alerts/routes";
import auditRoutes from "./audit/api/routes";
import authRoutes from "./auth/api/routes";
import userRoutes from "./auth/api/user.routes";
import checklistRoutes from "./checklists/api/routes";
import costRoutes from "./costs/api/routes";
import analyticsRoutes from "./dashboard/api/routes";
import documentRoutes from "./documents/api/routes";
import evidenceRoutes from "./evidences/api/routes";
import historyRoutes from "./history/routes";
import inspectionRoutes from "./inspections/api/routes";
import maintenanceRoutes from "./maintenance/api/routes";
import orderRoutes from "./orders/api/routes";
import proposalRoutes from "./proposals/api/routes";
import reportRoutes from "./reports/api/routes";
import resourceRoutes from "./resources/api/routes";

const app = express();
const log = createLogger("app");
const isDev = env.NODE_ENV !== "production";
const isTest = env.NODE_ENV === "test";

app.set("trust proxy", resolveTrustProxySetting(env.NODE_ENV));

// Request correlation ID — must be first
app.use(requestId);
app.use((req, res, next) => {
	const startedAt = Date.now();
	const requestId = req.requestId;
	log.info("HTTP request started", {
		requestId,
		method: req.method,
		path: req.originalUrl,
	});

	res.on("finish", () => {
		log.info("HTTP request completed", {
			requestId,
			method: req.method,
			path: req.originalUrl,
			statusCode: res.statusCode,
			durationMs: Date.now() - startedAt,
			origin: req.get("origin"),
		});
	});

	next();
});

// CORS must run before Helmet.
// If Helmet runs first, OPTIONS preflights can be blocked before CORS responds.
const allowedOrigins = buildAllowedCorsOrigins({
	frontendUrl: env.FRONTEND_URL,
	nodeEnv: env.NODE_ENV,
});

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests without an origin header (Postman, curl, server-side)
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
				return;
			}
			log.warn(`CORS blocked for origin: ${origin}`);
			callback(new Error("Not allowed by CORS"));
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
		exposedHeaders: ["X-Total-Count", "X-Request-Id"],
		maxAge: 86400, // Cache preflight 24h
		optionsSuccessStatus: 204,
	}),
);

// Security headers — Helmet after CORS.
// In development, disable CSP and cross-origin policies that block hot reload.
app.use(
	helmet({
		contentSecurityPolicy: isDev
			? false
			: {
					directives: {
						defaultSrc: ["'self'"],
						scriptSrc: ["'self'"],
						styleSrc: ["'self'", "'unsafe-inline'"],
						imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
						connectSrc: ["'self'", ...allowedOrigins],
						fontSrc: ["'self'"],
						objectSrc: ["'none'"],
						mediaSrc: ["'self'"],
						frameSrc: ["'none'"],
						upgradeInsecureRequests: [],
					},
				},
		crossOriginEmbedderPolicy: !isDev,
		crossOriginResourcePolicy: isDev ? false : { policy: "cross-origin" },
		crossOriginOpenerPolicy: !isDev,
		hsts: isDev
			? false
			: {
					maxAge: 31536000, // 1 año
					includeSubDomains: true,
					preload: true,
				},
	}),
);

// Rate limiting — 100 req/min globally; auth endpoints are stricter
// SECURITY FIX: RT-002 - Prevent IP spoofing in rate limiter
const globalLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Too many requests. Please try again later." },
	keyGenerator: (req) => ipKeyGenerator(resolveRateLimitSourceIp(req.ip, req.socket.remoteAddress)),
});

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 min
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Too many login attempts. Please try again in 15 minutes." },
	keyGenerator: (req) => ipKeyGenerator(resolveRateLimitSourceIp(req.ip, req.socket.remoteAddress)),
});

if (!isTest) {
	app.use(globalLimiter);
}
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use((req, _res, next) => {
	mongoSanitize.sanitize(req.body);
	mongoSanitize.sanitize(req.params);
	mongoSanitize.sanitize(req.query);
	next();
});

if (!isDev) {
	app.use(compression());
}

// Routes — 13 documented API modules (DOC-10)
if (isTest) {
	app.use("/api/auth", authRoutes);
} else {
	app.use("/api/auth", authLimiter, authRoutes);
}
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/evidences", evidenceRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/checklists", checklistRoutes);
app.use("/api/costs", costRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/alerts", alertsRoutes);

function getBackendVersion(): string {
	try {
		const packageJsonPath = path.resolve(process.cwd(), "package.json");
		const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as { version?: string };
		return packageJson.version ?? "1.0.0";
	} catch {
		return "1.0.0";
	}
}

const backendVersion = getBackendVersion();
const memoryUsageToMb = (value: number): string => `${(value / 1024 / 1024).toFixed(1)}MB`;

function buildHealthPayload() {
	const database = getDatabaseHealth();
	const memory = process.memoryUsage();
	const healthy = database.readyState === 1;

	return {
		status: healthy ? "ok" : "degraded",
		db: database.state,
		readyState: database.readyState,
		uptime: Number(process.uptime().toFixed(1)),
		memory: {
			rss: memoryUsageToMb(memory.rss),
			heapUsed: memoryUsageToMb(memory.heapUsed),
			external: memoryUsageToMb(memory.external),
		},
		version: backendVersion,
		timestamp: new Date().toISOString(),
	} as const;
}

// Health check
app.get("/api/health", (_req, res) => {
	const payload = buildHealthPayload();
	res.status(payload.status === "ok" ? 200 : 503).json(payload);
});

// Alias without prefix for Docker healthcheck compatibility (DOC-08)
app.get("/health", (_req, res) => {
	const payload = buildHealthPayload();
	res.status(payload.status === "ok" ? 200 : 503).json(payload);
});

// Global error handler — MUST be registered LAST
// Processes AppError, ZodError, Mongoose errors, and unknown errors
app.use(errorHandler as express.ErrorRequestHandler);

export default app;
