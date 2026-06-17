/**
 * server.ts — Cermont server bootstrap
 *
 * Required order (DOC-03):
 * 1. connectDB()    → Connect MongoDB before accepting requests
 * 2. app.listen()   → Start the HTTP server
 *
 * Note: validateEnv() runs automatically when importing ./config/env
 */
import "dotenv/config";
import { createLogger } from "./common/utils/logger";
import { connectDB, disconnectDB } from "./config/db";
import { env } from "./config/env";
import app from "./index";
import { ensureAuditLogIndexes } from "./models/AuditLog";
import { User } from "./models/User";
import { startRefreshTokenCleanupWorker } from "./modules/auth/auth.service";
import { startOutboxWorker } from "./modules/notifications/notification.service";
import { startSlaWorker } from "./modules/sla/sla.service";
import { erpEngine, FSSMAdapter, GMAOCSMAdapter } from "./services/erp";
import { startReminderWorker } from "./services/reminder-worker.service";
import { workflowRegistry } from "./services/workflow-variant-registry";
import { cermont14StepWorkflow } from "./services/workflows/cermont-14step.workflow";
import { fssmStandardWorkflow } from "./services/workflows/fssm-standard.workflow";
import { gmaoMaintenanceWorkflow } from "./services/workflows/gmao-maintenance.workflow";

const log = createLogger("server");
let server: ReturnType<typeof app.listen> | undefined;
let stopOutboxWorker: (() => void) | undefined;
let stopSlaWorker: (() => void) | undefined;
let stopReminderWorker: (() => void) | undefined;
let stopRefreshTokenCleanupWorker: (() => void) | undefined;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
	log.info(`Received ${signal}; shutting down gracefully`);

	const forceExit = setTimeout(() => {
		log.error("Forced shutdown after timeout");
		process.exit(1);
	}, 10_000);

	try {
		if (server) {
			const srv = server;
			await new Promise<void>((resolve) => {
				srv.close(() => resolve());
			});
		}

		stopOutboxWorker?.();
		stopSlaWorker?.();
		stopReminderWorker?.();
		stopRefreshTokenCleanupWorker?.();
		await disconnectDB();
		clearTimeout(forceExit);
		process.exit(0);
	} catch (error) {
		clearTimeout(forceExit);
		log.error("Failed during shutdown", { reason: String(error) });
		process.exit(1);
	}
}

async function warnIfNoUsers(): Promise<void> {
	const count = await User.countDocuments().exec();
	if (count === 0) {
		log.warn("⚠️  NO USERS in database — all logins will return 401. Run: npm run db:seed", {
			hint: "cd backend && npm run seed",
		});
	}
}

async function bootstrap() {
	await connectDB();
	await ensureAuditLogIndexes();
	void warnIfNoUsers();

	// Register ERP adapters
	erpEngine.registerProvider(new FSSMAdapter());
	erpEngine.registerProvider(new GMAOCSMAdapter());
	await erpEngine.getProvider("fssm")?.initialize();
	await erpEngine.getProvider("gmao_csm")?.initialize();

	// Register workflow variants
	workflowRegistry.register(cermont14StepWorkflow);
	workflowRegistry.register(fssmStandardWorkflow);
	workflowRegistry.register(gmaoMaintenanceWorkflow);

	stopOutboxWorker = startOutboxWorker();
	stopSlaWorker = startSlaWorker();
	stopReminderWorker = startReminderWorker();
	stopRefreshTokenCleanupWorker = startRefreshTokenCleanupWorker();

	const PORT = env.PORT;
	server = app.listen(PORT, () => {
		log.info(`Backend Cermont listening on port ${PORT} [${env.NODE_ENV}]`);
	});
}

process.once("SIGINT", () => {
	void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
	void shutdown("SIGTERM");
});

/**
 * Track unhandled rejections for observability without crashing the process.
 * Unlike uncaughtException, unhandledRejection can be recovered from —
 * the promise was rejected but no .catch() was attached. Logging and
 * tracking the metric is sufficient; process.exit would kill all in-flight
 * requests unnecessarily.
 */
let unhandledRejectionCount = 0;
process.on("unhandledRejection", (reason) => {
	unhandledRejectionCount++;
	log.error("Unhandled promise rejection", {
		reason: String(reason),
		totalUnhandled: unhandledRejectionCount,
	});
});

process.on("uncaughtException", (error) => {
	log.error("Uncaught exception", { message: error.message || "", stack: error.stack || "" });
	process.exit(1);
});

bootstrap().catch((err) => {
	log.error("Fatal error while starting the server", { reason: String(err) });
	process.exit(1);
});
