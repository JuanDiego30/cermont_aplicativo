import { readFileSync } from "node:fs";
import path from "node:path";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { errorHandler } from "./common/errors";
import { requestId } from "./common/middlewares/request-id.middleware";
import { shouldSkipAuthRateLimit, shouldSkipGlobalRateLimit } from "./common/security/rate-limit";
import { createLogger } from "./common/utils/logger";
import { getDatabaseHealth } from "./config/db";
import { env } from "./config/env";
import aiRoutes from "./modules/ai/ai.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import metricsRoutes from "./modules/analytics/metrics.routes";
import assetRoutes from "./modules/asset/asset.routes";
import auditRoutes from "./modules/audit/audit.routes";
import authRoutes from "./modules/auth/auth.routes";
import checklistRoutes from "./modules/checklist/checklist.routes";
import clientRoutes from "./modules/client/client.routes";
import costRoutes from "./modules/cost/cost.routes";
import customFieldRoutes from "./modules/custom-fields/custom-field.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import deliveryRecordRoutes from "./modules/delivery-record/delivery-record.routes";
import deliveryRecordServiceEntrySheetRoutes from "./modules/delivery-record/delivery-record-service-entry-sheet.routes";
import documentRoutes from "./modules/documents/document.routes";
import documentImportRoutes from "./modules/documents/document-import.routes";
import documentIngestionRoutes from "./modules/documents/document-ingestion.routes";
import documentTemplateRoutes from "./modules/documents/document-template.routes";
import evidenceRoutes from "./modules/evidence/evidence.routes";
import evidenceCollectionRoutes from "./modules/evidence/evidence-collection.routes";
import executionSessionRoutes from "./modules/execution-session/execution-session.routes";
import executionTechnicalReportRoutes from "./modules/execution-session/execution-technical-report.routes";
import filesRoutes from "./modules/files/files.routes";
import formSubmissionRoutes from "./modules/form-submissions/form-submission.routes";
import inspectionRoutes from "./modules/inspection/inspection.routes";
import invoiceRoutes from "./modules/invoice/invoice.routes";
import invoicePaymentRoutes from "./modules/invoice/invoice-payment.routes";
import kitRoutes from "./modules/kit/kit.routes";
import maintenanceRoutes from "./modules/maintenance/maintenance.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";
import observabilityRoutes from "./modules/observability/observability.routes";
import orderRoutes from "./modules/order/order.routes";
import orderAdministrativeWorkflowRoutes from "./modules/order/order-administrative-workflow.routes";
import orderClosureRoutes from "./modules/order/order-closure.routes";
import orderExecutionSessionRoutes from "./modules/order/order-execution-session.routes";
import paymentRoutes from "./modules/payment/payment.routes";
import planningPacketRoutes from "./modules/planning-packet/planning-packet.routes";
import portalRoutes from "./modules/portal/portal.routes";
import proposalRoutes from "./modules/proposal/proposal.routes";
import purchaseOrderRoutes from "./modules/purchase-order/purchase-order.routes";
import reportRoutes from "./modules/report/report.routes";
import resourceRoutes from "./modules/resource/resource.routes";
import safetyAnalysisRoutes from "./modules/safety-analysis/safety-analysis.routes";
import serviceCaseRoutes from "./modules/service-cases/service-case.routes";
import serviceEntrySheetRoutes from "./modules/service-entry-sheet/service-entry-sheet.routes";
import serviceEntrySheetInvoiceRoutes from "./modules/service-entry-sheet/service-entry-sheet-invoice.routes";
import siteVisitRoutes from "./modules/site-visit/site-visit.routes";
import syncRoutes from "./modules/sync/sync.routes";
import technicalReportRoutes from "./modules/technical-report/technical-report.routes";
import templateDraftRoutes from "./modules/template-draft/template-draft.routes";
import templateResponseRoutes from "./modules/template-response/template-response.routes";
import toolRoutes from "./modules/tool/tool.routes";
import userRoutes from "./modules/user/user.routes";
import workRequestRoutes from "./modules/work-requests/work-requests.routes";

const app = express();
const log = createLogger("app");
const isDev = env.NODE_ENV !== "production";
const isTest = env.NODE_ENV === "test";
const localFrontendOrigins = [
	"http://localhost:3000",
	"http://127.0.0.1:3000",
	"http://192.168.56.1:3000",
] as const;

app.set("trust proxy", 1);

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
		});
	});

	next();
});

// CORS must run before Helmet.
// If Helmet runs first, OPTIONS preflights can be blocked before CORS responds.
const allowedOrigins = Array.from(
	new Set(
		[env.FRONTEND_URL, ...localFrontendOrigins].filter((origin): origin is string =>
			Boolean(origin),
		),
	),
);

/**
 * Check if a given origin string belongs to a Docker bridge/overlay network.
 * Docker Compose assigns private IPs in 172.x.x.x, 10.x.x.x, or 192.168.x.x
 * ranges to containers. These origins are safe for development/staging.
 * In production, CORS should be locked to a specific domain via FRONTEND_URL.
 */
function isDockerNetworkOrigin(origin: string): boolean {
	if (!origin) {
		return false;
	}
	try {
		const url = new URL(origin);
		const host = url.hostname;
		if (["localhost", "127.0.0.1", "0.0.0.0", "host.docker.internal"].includes(host)) {
			return true;
		}
		// Docker bridge: 172.16.0.0/12, 172.17.0.0/16 ... 172.31.0.0/16
		// Docker Desktop: 192.168.x.x
		// Overlay/Compose: 10.x.x.x
		if (/^(172\.(1[6-9]|2\d|3[01])\.|10\.|192\.168\.)/.test(host)) {
			return true;
		}
		return false;
	} catch {
		return false;
	}
}

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests without an origin header (Postman, curl, server-side)
			if (!origin || allowedOrigins.includes(origin) || isDockerNetworkOrigin(origin)) {
				callback(null, true);
				return;
			}
			log.warn(`CORS blocked for origin: ${origin}`);
			callback(new Error("Not allowed by CORS"));
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id", "Idempotency-Key"],
		exposedHeaders: ["X-Total-Count", "X-Request-Id", "Idempotency-Key"],
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
	keyGenerator: (req) => getClientIp(req),
	skip: shouldSkipGlobalRateLimit,
});

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 min
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Too many login attempts. Please try again in 15 minutes." },
	keyGenerator: (req) => getClientIp(req),
	skip: shouldSkipAuthRateLimit,
});

function getClientIp(req: express.Request): string {
	const forwarded = req.headers["x-forwarded-for"];
	if (forwarded && typeof forwarded === "string") {
		const ips = forwarded.split(",").map((ip) => ip.trim());
		const firstIp = ips[0];
		if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(firstIp)) {
			return firstIp;
		}
	}

	return req.ip || req.socket.remoteAddress || "unknown";
}

if (!isTest) {
	app.use(globalLimiter);
}
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use((req, _res, next) => {
	mongoSanitize.sanitize(req.body);
	mongoSanitize.sanitize(req.params);
	next();
});

if (isDev && !isTest) {
	app.use(
		"/uploads",
		express.static(path.resolve(env.UPLOAD_DIR), {
			dotfiles: "deny",
			fallthrough: true,
			index: false,
			maxAge: 0,
		}),
	);
}

if (!isDev) {
	app.use(compression());
}

// Routes — 16 documented API modules (DOC-10)
if (isTest) {
	app.use("/api/auth", authRoutes);
} else {
	app.use("/api/auth", authLimiter, authRoutes);
}
app.use("/api/orders", orderRoutes);
app.use("/api/orders", orderExecutionSessionRoutes);
app.use("/api/orders", orderClosureRoutes);
app.use("/api/orders", orderAdministrativeWorkflowRoutes);
app.use("/api/users", userRoutes);
app.use("/api/evidences", evidenceRoutes);
app.use("/api/evidence-collections", evidenceCollectionRoutes);
app.use("/api/execution-sessions", executionSessionRoutes);
app.use("/api/execution-sessions", executionTechnicalReportRoutes);
app.use("/api/files", filesRoutes);
app.use("/api/form-submissions", formSubmissionRoutes);
app.use("/api/checklists", checklistRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/costs", costRoutes);
app.use("/api/custom-fields", customFieldRoutes);
app.use("/api/kits", kitRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/documents", documentImportRoutes);
app.use("/api/documents", documentIngestionRoutes);
app.use("/api/document-templates", documentTemplateRoutes);
app.use("/api/template-drafts", templateDraftRoutes);
app.use("/api/template-responses", templateResponseRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/technical-reports", technicalReportRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/delivery-records", deliveryRecordRoutes);
app.use("/api/delivery-records", deliveryRecordServiceEntrySheetRoutes);
app.use("/api/service-entry-sheets", serviceEntrySheetRoutes);
app.use("/api/service-entry-sheets", serviceEntrySheetInvoiceRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/invoices", invoicePaymentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/work-requests", workRequestRoutes);
app.use("/api/asts", safetyAnalysisRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/planning-packets", planningPacketRoutes);
app.use("/api/site-visits", siteVisitRoutes);
app.use("/api/observability", observabilityRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/service-cases", serviceCaseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/portal", portalRoutes);

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

// HEAD support for connectivity ping used by the frontend's `useConnectivity`
// hook (issues a HEAD request with no-store cache to detect real reachability
// behind captive portals or WiFi-without-WAN).
app.head("/api/health", (_req, res) => {
	const payload = buildHealthPayload();
	res.status(payload.status === "ok" ? 200 : 503).end();
});

// Alias without prefix for Docker healthcheck compatibility (DOC-08)
app.get("/health", (_req, res) => {
	const payload = buildHealthPayload();
	res.status(payload.status === "ok" ? 200 : 503).json(payload);
});

app.head("/health", (_req, res) => {
	const payload = buildHealthPayload();
	res.status(payload.status === "ok" ? 200 : 503).end();
});

// Global error handler — MUST be registered LAST
// Processes AppError, ZodError, Mongoose errors, and unknown errors
app.use(errorHandler);

export default app;
