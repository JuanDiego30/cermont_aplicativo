import { readFileSync } from "node:fs";
import path from "node:path";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import { type ApiMount, buildDocsHtml, buildOpenApiDocument } from "./common/docs/api-docs";
import { errorHandler, ForbiddenError } from "./common/errors";
import { requestId } from "./common/middlewares/request-id.middleware";
import { createLogger } from "./common/utils/logger";
import { getDatabaseHealth } from "./config/db";
import { env } from "./config/env";
import { generalLimiter } from "./middlewares/rate-limiter";
import adminBackupRoutes from "./modules/admin-backup/admin-backup.routes";
import aiRoutes from "./modules/ai/ai.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import metricsRoutes from "./modules/analytics/metrics.routes";
import analyticsReportRoutes from "./modules/analytics-report/analytics-report.routes";
import assetRoutes from "./modules/asset/asset.routes";
import auditRoutes from "./modules/audit/audit.routes";
import authRoutes from "./modules/auth/auth.routes";
import businessDocumentRoutes from "./modules/business-document/business-document.routes";
import checklistRoutes from "./modules/checklist/checklist.routes";
import clientRoutes from "./modules/client/client.routes";
import clientSignatureRoutes from "./modules/client-signature/client-signature.routes";
import costRoutes from "./modules/cost/cost.routes";
import customFieldRoutes from "./modules/custom-fields/custom-field.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import deliveryRecordRoutes from "./modules/delivery-record/delivery-record.routes";
import deliveryRecordServiceEntrySheetRoutes from "./modules/delivery-record/delivery-record-service-entry-sheet.routes";
import dianRoutes from "./modules/dian/dian.routes";
import dispatchRoutes from "./modules/dispatch/dispatch.routes";
import documentRoutes from "./modules/documents/document.routes";
import documentImportRoutes from "./modules/documents/document-import.routes";
import documentIngestionRoutes from "./modules/documents/document-ingestion.routes";
import documentTemplateRoutes from "./modules/documents/document-template.routes";
import erpConnectorRoutes from "./modules/erp-connector/erp-connector.routes";
import evidenceRoutes from "./modules/evidence/evidence.routes";
import evidenceCollectionRoutes from "./modules/evidence/evidence-collection.routes";
import executionSessionRoutes from "./modules/execution-session/execution-session.routes";
import executionTechnicalReportRoutes from "./modules/execution-session/execution-technical-report.routes";
import filesRoutes from "./modules/files/files.routes";
import fleetRoutes from "./modules/fleet/fleet.routes";
import formSubmissionRoutes from "./modules/form-submissions/form-submission.routes";
import inspectionRoutes from "./modules/inspection/inspection.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
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
import privacyRequestRoutes from "./modules/privacy-requests/privacy-requests.routes";
import proposalRoutes from "./modules/proposal/proposal.routes";
import purchaseOrderRoutes from "./modules/purchase-order/purchase-order.routes";
import reportRoutes from "./modules/report/report.routes";
import resourceRoutes from "./modules/resource/resource.routes";
import safetyAnalysisRoutes from "./modules/safety-analysis/safety-analysis.routes";
import serviceCaseRoutes from "./modules/service-cases/service-case.routes";
import serviceEntrySheetRoutes from "./modules/service-entry-sheet/service-entry-sheet.routes";
import serviceEntrySheetInvoiceRoutes from "./modules/service-entry-sheet/service-entry-sheet-invoice.routes";
import siteVisitRoutes from "./modules/site-visit/site-visit.routes";
import slaRoutes from "./modules/sla/sla.routes";
import syncRoutes from "./modules/sync/sync.routes";
import systemConfigRoutes from "./modules/system-config/system-config.routes";
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
const REQUEST_BODY_LIMIT = "2mb";
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
		[env.FRONTEND_URL, ...(isDev ? localFrontendOrigins : [])].filter((origin): origin is string =>
			Boolean(origin),
		),
	),
);

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests without an origin header (Postman, curl, server-side)
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
				return;
			}
			log.warn(`CORS blocked for origin: ${origin}`);
			callback(new ForbiddenError("Origin not allowed by CORS"));
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
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'", "'unsafe-inline'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
				connectSrc: ["'self'", ...allowedOrigins],
				fontSrc: ["'self'"],
				objectSrc: ["'none'"],
				mediaSrc: ["'self'"],
				frameSrc: ["'none'"],
				...(!isDev ? { upgradeInsecureRequests: [] } : {}),
			},
		},
		crossOriginEmbedderPolicy: !isDev,
		crossOriginResourcePolicy: isDev ? false : { policy: "cross-origin" },
		crossOriginOpenerPolicy: !isDev,
		frameguard: { action: "deny" },
		referrerPolicy: { policy: "no-referrer" },
		hsts: isDev
			? false
			: {
					maxAge: 31536000, // 1 año
					includeSubDomains: true,
					preload: true,
				},
	}),
);

if (!isTest) {
	app.use(generalLimiter);
}
app.use(cookieParser());
app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));
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

// Routes — registry compartido entre los mounts y /api/docs (SSOT)
app.use("/api/auth", authRoutes);

const API_MOUNTS: ApiMount[] = [
	{ prefix: "/api/auth", router: authRoutes },
	{ prefix: "/api/orders", router: orderRoutes },
	{ prefix: "/api/orders", router: orderExecutionSessionRoutes },
	{ prefix: "/api/orders", router: orderClosureRoutes },
	{ prefix: "/api/orders", router: orderAdministrativeWorkflowRoutes },
	{ prefix: "/api/users", router: userRoutes },
	{ prefix: "/api/evidences", router: evidenceRoutes },
	{ prefix: "/api/evidence-collections", router: evidenceCollectionRoutes },
	{ prefix: "/api/execution-sessions", router: executionSessionRoutes },
	{ prefix: "/api/execution-sessions", router: executionTechnicalReportRoutes },
	{ prefix: "/api/files", router: filesRoutes },
	{ prefix: "/api/fleet", router: fleetRoutes },
	{ prefix: "/api/form-submissions", router: formSubmissionRoutes },
	{ prefix: "/api/checklists", router: checklistRoutes },
	{ prefix: "/api/clients", router: clientRoutes },
	{ prefix: "/api/signatures", router: clientSignatureRoutes },
	{ prefix: "/api/costs", router: costRoutes },
	{ prefix: "/api/custom-fields", router: customFieldRoutes },
	{ prefix: "/api/kits", router: kitRoutes },
	{ prefix: "/api/maintenance", router: maintenanceRoutes },
	{ prefix: "/api/documents", router: documentRoutes },
	{ prefix: "/api/documents", router: documentImportRoutes },
	{ prefix: "/api/documents", router: documentIngestionRoutes },
	{ prefix: "/api/document-templates", router: documentTemplateRoutes },
	{ prefix: "/api/template-drafts", router: templateDraftRoutes },
	{ prefix: "/api/template-responses", router: templateResponseRoutes },
	{ prefix: "/api/proposals", router: proposalRoutes },
	{ prefix: "/api/purchase-orders", router: purchaseOrderRoutes },
	{ prefix: "/api/resources", router: resourceRoutes },
	{ prefix: "/api/reports", router: reportRoutes },
	{ prefix: "/api/technical-reports", router: technicalReportRoutes },
	{ prefix: "/api/tools", router: toolRoutes },
	{ prefix: "/api/delivery-records", router: deliveryRecordRoutes },
	{ prefix: "/api/delivery-records", router: deliveryRecordServiceEntrySheetRoutes },
	{ prefix: "/api/service-entry-sheets", router: serviceEntrySheetRoutes },
	{ prefix: "/api/service-entry-sheets", router: serviceEntrySheetInvoiceRoutes },
	{ prefix: "/api/invoices", router: invoiceRoutes },
	{ prefix: "/api/invoices", router: invoicePaymentRoutes },
	{ prefix: "/api/payments", router: paymentRoutes },
	{ prefix: "/api/audit", router: auditRoutes },
	{ prefix: "/api/analytics", router: analyticsRoutes },
	{ prefix: "/api/inspections", router: inspectionRoutes },
	{ prefix: "/api/inventory", router: inventoryRoutes },
	{ prefix: "/api/sync", router: syncRoutes },
	{ prefix: "/api/ai", router: aiRoutes },
	{ prefix: "/api/work-requests", router: workRequestRoutes },
	{ prefix: "/api/asts", router: safetyAnalysisRoutes },
	{ prefix: "/api/assets", router: assetRoutes },
	{ prefix: "/api/planning-packets", router: planningPacketRoutes },
	{ prefix: "/api/site-visits", router: siteVisitRoutes },
	{ prefix: "/api/observability", router: observabilityRoutes },
	{ prefix: "/api/notifications", router: notificationsRoutes },
	{ prefix: "/api/service-cases", router: serviceCaseRoutes },
	{ prefix: "/api/dashboard", router: dashboardRoutes },
	{ prefix: "/api/metrics", router: metricsRoutes },
	{ prefix: "/api/portal", router: portalRoutes },
	{ prefix: "/api/dian", router: dianRoutes },
	{ prefix: "/api/analytics", router: analyticsReportRoutes },
	{ prefix: "/api/sla", router: slaRoutes },
	{ prefix: "/api/dispatch", router: dispatchRoutes },
	{ prefix: "/api/system-config", router: systemConfigRoutes },
	{ prefix: "/api/admin/backups", router: adminBackupRoutes },
	{ prefix: "/api/privacy-requests", router: privacyRequestRoutes },
	{ prefix: "/api/business-documents", router: businessDocumentRoutes },
	{ prefix: "/api/erp-connectors", router: erpConnectorRoutes },
];

for (const mount of API_MOUNTS) {
	if (mount.prefix === "/api/auth") {
		continue; // mounted above with auth rate limiter
	}
	app.use(mount.prefix, mount.router);
}

// API documentation — generated from the real routers at boot (DOC task 6.2)
const openApiDocument = buildOpenApiDocument(API_MOUNTS, getBackendVersion());
app.get("/api/docs/openapi.json", (_req, res) => {
	res.status(200).json(openApiDocument);
});
app.get("/api/docs", (_req, res) => {
	res.status(200).type("html").send(buildDocsHtml());
});

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

function buildReadinessPayload() {
	const database = getDatabaseHealth();
	const memory = process.memoryUsage();
	const healthy = database.readyState === 1;

	return {
		status: healthy ? "ok" : "degraded",
		check: "readiness",
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

function buildLivenessPayload() {
	return {
		status: "ok",
		check: "liveness",
		uptime: Number(process.uptime().toFixed(1)),
		version: backendVersion,
		timestamp: new Date().toISOString(),
	} as const;
}

function readinessStatus(payload: ReturnType<typeof buildReadinessPayload>): 200 | 503 {
	return payload.status === "ok" ? 200 : 503;
}

// Compatibility readiness check
app.get("/api/health", (_req, res) => {
	const payload = buildReadinessPayload();
	res.status(readinessStatus(payload)).json(payload);
});

app.head("/api/health", (_req, res) => {
	const payload = buildReadinessPayload();
	res.status(readinessStatus(payload)).end();
});

app.get("/api/health/live", (_req, res) => {
	res.status(200).json(buildLivenessPayload());
});

app.head("/api/health/live", (_req, res) => {
	res.status(200).end();
});

app.get("/api/health/ready", (_req, res) => {
	const payload = buildReadinessPayload();
	res.status(readinessStatus(payload)).json(payload);
});

app.head("/api/health/ready", (_req, res) => {
	const payload = buildReadinessPayload();
	res.status(readinessStatus(payload)).end();
});

// Alias without prefix for Docker healthcheck compatibility (DOC-08)
app.get("/health", (_req, res) => {
	const payload = buildReadinessPayload();
	res.status(readinessStatus(payload)).json(payload);
});

app.head("/health", (_req, res) => {
	const payload = buildReadinessPayload();
	res.status(readinessStatus(payload)).end();
});

app.get("/health/live", (_req, res) => {
	res.status(200).json(buildLivenessPayload());
});

app.head("/health/live", (_req, res) => {
	res.status(200).end();
});

app.get("/health/ready", (_req, res) => {
	const payload = buildReadinessPayload();
	res.status(readinessStatus(payload)).json(payload);
});

app.head("/health/ready", (_req, res) => {
	const payload = buildReadinessPayload();
	res.status(readinessStatus(payload)).end();
});

// Global error handler — MUST be registered LAST
// Processes AppError, ZodError, Mongoose errors, and unknown errors
app.use(errorHandler);

export default app;
