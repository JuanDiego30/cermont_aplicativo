import fs from "node:fs";
import path from "node:path";
import { request } from "@playwright/test";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { E2E_ADMIN, E2E_KIT, E2E_SUPERVISOR, E2E_TECHNICIAN } from "./auth-credentials";

const TEST_DB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/cermont_test";
const FALLBACK_DB_URI = "mongodb://127.0.0.1:27017/cermont";
const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const AUTH_DIR = path.join(process.cwd(), "tests/e2e/fixtures/.auth");
const SEED_FILE = path.join(AUTH_DIR, "seed-data.json");
const SEED_IDS = {
	admin: new mongoose.Types.ObjectId(),
	supervisor: new mongoose.Types.ObjectId(),
	technician: new mongoose.Types.ObjectId(),
} as const;

async function seedDatabase(uri: string): Promise<void> {
	await mongoose.connect(uri, { family: 4 });

	try {
		const db = mongoose.connection.db;

		if (!db) {
			throw new Error("MongoDB connection is missing a db handle during E2E setup");
		}

		await db.dropDatabase();

		const usersCollection = db.collection("users");
		const maintenanceKitsCollection = db.collection("maintenancekits");

		const [adminPassword, supervisorPassword, technicianPassword, seedPassword] = await Promise.all([
			bcrypt.hash(E2E_ADMIN.password, 4),
			bcrypt.hash(E2E_SUPERVISOR.password, 4),
			bcrypt.hash(E2E_TECHNICIAN.password, 4),
			bcrypt.hash("Cermont2026!", 4),
		]);

		await usersCollection.insertMany([
			{
				_id: new mongoose.Types.ObjectId(),
				name: "Gerencia General",
				email: "gerencia@cermont.con",
				password: seedPassword,
				role: "gerente",
				isActive: true,
				phone: "+57 300 000 0000",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				_id: SEED_IDS.admin,
				name: "E2E Admin",
				email: E2E_ADMIN.email,
				password: adminPassword,
				role: E2E_ADMIN.role,
				isActive: true,
				phone: "+57 300 100 0001",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				_id: SEED_IDS.supervisor,
				name: "E2E Supervisor",
				email: E2E_SUPERVISOR.email,
				password: supervisorPassword,
				role: E2E_SUPERVISOR.role,
				isActive: true,
				phone: "+57 300 100 0002",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				_id: SEED_IDS.technician,
				name: "E2E Technician",
				email: E2E_TECHNICIAN.email,
				password: technicianPassword,
				role: E2E_TECHNICIAN.role,
				isActive: true,
				phone: "+57 300 100 0003",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);

		await maintenanceKitsCollection.insertOne({
			_id: new mongoose.Types.ObjectId(),
			name: E2E_KIT.name,
			activity_type: E2E_KIT.activityType,
			tools: E2E_KIT.tools,
			equipment: E2E_KIT.equipment.map((item) => ({
				name: item.name,
				quantity: item.quantity,
				certificate_required: item.certificateRequired,
			})),
			is_active: true,
			created_by: SEED_IDS.admin,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	} finally {
		await mongoose.disconnect();
	}
}

type SeedUser = {
	id: string;
	name: string;
	email: string;
	password: string;
	role: string;
	accessToken?: string;
};

async function saveAuthState(user: SeedUser, filePath: string): Promise<void> {
	const context = await request.newContext({ baseURL: BASE_URL });

	try {
		const response = await context.post("/api/auth/login", {
			data: {
				email: user.email,
				password: user.password,
			},
		});

		const payload = (await response.json()) as { data?: { accessToken?: string } };
		user.accessToken = payload.data?.accessToken;

		await context.storageState({ path: filePath });
	} finally {
		await context.dispose();
	}
}

async function globalSetup(): Promise<void> {
	fs.mkdirSync(AUTH_DIR, { recursive: true });

	await seedDatabase(TEST_DB_URI);
	await seedDatabase(FALLBACK_DB_URI);

	const adminSeed: SeedUser = {
		id: SEED_IDS.admin.toString(),
		name: "E2E Admin",
		email: E2E_ADMIN.email,
		password: E2E_ADMIN.password,
		role: E2E_ADMIN.role,
	};
	const supervisorSeed: SeedUser = {
		id: SEED_IDS.supervisor.toString(),
		name: "E2E Supervisor",
		email: E2E_SUPERVISOR.email,
		password: E2E_SUPERVISOR.password,
		role: E2E_SUPERVISOR.role,
	};
	const technicianSeed: SeedUser = {
		id: SEED_IDS.technician.toString(),
		name: "E2E Technician",
		email: E2E_TECHNICIAN.email,
		password: E2E_TECHNICIAN.password,
		role: E2E_TECHNICIAN.role,
	};

	await saveAuthState(adminSeed, path.join(AUTH_DIR, "admin.json"));
	await saveAuthState(supervisorSeed, path.join(AUTH_DIR, "supervisor.json"));
	await saveAuthState(technicianSeed, path.join(AUTH_DIR, "technician.json"));

	fs.writeFileSync(
		SEED_FILE,
		JSON.stringify(
			{ admin: adminSeed, supervisor: supervisorSeed, technician: technicianSeed },
			null,
			2,
		),
		"utf8",
	);
}

export default globalSetup;
