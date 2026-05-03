import mongoose from "mongoose";
import { createLogger } from "../common/utils";
import { env } from "./env";

const log = createLogger("database");

const MONGODB_URI = env.MONGODB_URI;
const CONNECTION_OPTIONS: mongoose.ConnectOptions = {
	maxPoolSize: 5,
	minPoolSize: 1,
	maxIdleTimeMS: 30_000,
	serverSelectionTimeoutMS: 5_000,
	socketTimeoutMS: 45_000,
	heartbeatFrequencyMS: 10_000,
	family: 4,
};

let connectPromise: Promise<typeof mongoose> | null = null;
let listenersRegistered = false;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let isShuttingDown = false;
let isConnecting = false;

mongoose.set("bufferCommands", false);
mongoose.set("autoIndex", env.NODE_ENV !== "production");

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function connectWithRetry(): Promise<void> {
	const maxAttempts = 3;
	let lastError: unknown;

	isConnecting = true;

	try {
		for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
			try {
				const connection = await mongoose.connect(MONGODB_URI, CONNECTION_OPTIONS);
				log.info("MongoDB connected", { host: connection.connection.host, attempt });
				return;
			} catch (error) {
				lastError = error;
				log.warn("MongoDB connection attempt failed", {
					attempt,
					maxAttempts,
					error,
				});

				if (attempt < maxAttempts) {
					if (mongoose.connection.readyState !== 0) {
						await mongoose.disconnect();
					}
					await delay(1_000 * 2 ** (attempt - 1));
				}
			}
		}
	} finally {
		isConnecting = false;
	}

	if (lastError instanceof Error) {
		throw lastError;
	}

	throw new Error("Failed to connect to MongoDB");
}

function registerConnectionListeners(): void {
	if (listenersRegistered) {
		return;
	}
	listenersRegistered = true;

	mongoose.connection.on("connected", () => {
		log.info("MongoDB connected", { host: mongoose.connection.host });
	});

	mongoose.connection.on("error", (error) => {
		log.error("MongoDB connection error", { error });
	});

	mongoose.connection.on("disconnected", () => {
		log.warn("MongoDB disconnected");

		if (isShuttingDown || isConnecting || reconnectTimer) {
			return;
		}

		reconnectTimer = setTimeout(() => {
			reconnectTimer = null;
			void reconnectDatabase();
		}, 5_000);
	});

	mongoose.connection.on("reconnected", () => {
		log.info("MongoDB reconnected");
	});
}

async function reconnectDatabase(): Promise<void> {
	if (isShuttingDown) {
		return;
	}

	try {
		await connectDB();
	} catch (error) {
		log.error("MongoDB reconnect failed", { error });
		process.exit(1);
	}
}

export const connectDB = async (): Promise<void> => {
	if (mongoose.connection.readyState === 1) {
		return;
	}

	registerConnectionListeners();

	if (!connectPromise) {
		connectPromise = connectWithRetry().finally(() => {
			connectPromise = null;
		}) as unknown as Promise<typeof mongoose>;
	}

	await connectPromise;
};

export const disconnectDB = async (): Promise<void> => {
	isShuttingDown = true;

	if (reconnectTimer) {
		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	}

	if (mongoose.connection.readyState === 0) {
		return;
	}

	await mongoose.disconnect();
};

export const getDatabaseHealth = (): {
	readyState: number;
	state: "disconnected" | "connected" | "connecting" | "disconnecting" | "unknown";
} => {
	const readyState = mongoose.connection.readyState;
	const states: Record<number, "disconnected" | "connected" | "connecting" | "disconnecting"> = {
		0: "disconnected",
		1: "connected",
		2: "connecting",
		3: "disconnecting",
	};
	return {
		readyState,
		state: states[readyState] ?? "unknown",
	};
};
