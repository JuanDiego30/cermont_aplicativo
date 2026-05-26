import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

const TEST_DB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/cermont_test";
const FALLBACK_DB_URI = "mongodb://127.0.0.1:27017/cermont";
const AUTH_DIR = path.join(process.cwd(), "tests/e2e/fixtures/.auth");

async function globalTeardown(): Promise<void> {
	for (const uri of [TEST_DB_URI, FALLBACK_DB_URI]) {
		try {
			await mongoose.connect(uri, { family: 4 });
			const db = mongoose.connection.db;

			if (!db) {
				throw new Error("MongoDB connection is missing a db handle during E2E teardown");
			}

			await db.dropDatabase();
		} catch {
			// Ignore teardown failures so the browser/server shutdown still completes.
		} finally {
			await mongoose.disconnect().catch(() => undefined);
		}
	}

	fs.rmSync(AUTH_DIR, { recursive: true, force: true });
}

export default globalTeardown;
