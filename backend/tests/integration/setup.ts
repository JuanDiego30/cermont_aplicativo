import { promises as fs } from "node:fs";
import path from "node:path";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach } from "vitest";

let mongod: MongoMemoryServer;
const mongoBinaryDir = path.resolve(process.cwd(), ".cache", "mongodb-memory-server");

async function prepareMongoBinaryDir(): Promise<void> {
	await fs.mkdir(mongoBinaryDir, { recursive: true });
	const entries = await fs.readdir(mongoBinaryDir, { withFileTypes: true });

	await Promise.all(
		entries
			.filter(
				(entry) =>
					entry.isFile() && (entry.name.endsWith(".lock") || entry.name.endsWith(".downloading")),
			)
			.map((entry) => fs.rm(path.join(mongoBinaryDir, entry.name), { force: true })),
	);
}

beforeAll(async () => {
	// If there's an existing connection, close it first
	if (mongoose.connection.readyState !== 0) {
		await mongoose.disconnect();
	}

	await prepareMongoBinaryDir();
	mongod = await MongoMemoryServer.create({
		binary: {
			downloadDir: mongoBinaryDir,
		},
	});
	const uri = mongod.getUri();
	await mongoose.connect(uri);
});

afterAll(async () => {
	await mongoose.disconnect();
	if (mongod) {
		await mongod.stop();
	}
});

beforeEach(async () => {
	if (mongoose.connection.readyState !== 0 && mongoose.connection.db) {
		const collections = await mongoose.connection.db.collections();
		for (const collection of collections) {
			await collection.deleteMany({});
		}
	}
});
