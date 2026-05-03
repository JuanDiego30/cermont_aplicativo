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
import { createLogger } from "./_shared/common/utils";
import { connectDB, disconnectDB } from "./_shared/config/db";
import { env } from "./_shared/config/env";
import app from "./index";

const log = createLogger("server");
let server: ReturnType<typeof app.listen> | undefined;

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

		await disconnectDB();
		clearTimeout(forceExit);
		process.exit(0);
	} catch (error) {
		clearTimeout(forceExit);
		log.error("Failed during shutdown", { reason: error });
		process.exit(1);
	}
}

async function bootstrap() {
	await connectDB();

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

process.on("unhandledRejection", (reason) => {
	log.error("Unhandled promise rejection", { reason: String(reason) });
	process.exit(1);
});

process.on("uncaughtException", (error) => {
	log.error("Uncaught exception", { message: error.message, stack: error.stack });
	process.exit(1);
});

bootstrap().catch((err) => {
	log.error("Fatal error while starting the server", { reason: String(err) });
	process.exit(1);
});
