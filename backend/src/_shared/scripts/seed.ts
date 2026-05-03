/**
 * Seed script — Crea usuarios RBAC para desarrollo/testing.
 *
 * Usa el modelo Mongoose User directamente, lo que garantiza:
 * - Validacion de schema (campos requeridos, enums)
 * - Hash automatico de contrasenas via pre('save') hook
 * - Indice unique en email
 *
 * Uso:
 *   npm run seed          (desde apps/backend, con tsx)
 *   npm run seed:prod     (con node + dist compilado)
 *   npm run db:seed       (desde la raiz del monorepo)
 *
 * Contrasena para TODOS los usuarios: definida por SEED_DEFAULT_PASSWORD
 */
import "dotenv/config";
import { env } from "@cermont/shared-types/config";
import { ROLE_LABELS, type UserRole } from "@cermont/shared-types/rbac";
import mongoose from "mongoose";
import { User } from "../../auth/infrastructure/model";
import { createLogger } from "../common/utils";

const log = createLogger("seed");

// ─── Config ────────────────────────────────────────────────────────────────────

const MONGODB_URI = env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/cermont";
const ALLOW_PRODUCTION_SEED = process.env.SEED_ALLOW_DESTRUCTIVE === "true";

const DEFAULT_PASSWORD = env.SEED_DEFAULT_PASSWORD;
if (!DEFAULT_PASSWORD) {
	throw new Error(
		"SEED_DEFAULT_PASSWORD environment variable is required to run seed script. " +
			"Set it in your .env file or pass it as: SEED_DEFAULT_PASSWORD=<strong_password> npm run seed",
	);
}

// ─── Seed data ─────────────────────────────────────────────────────────────────

interface SeedUser {
	name: string;
	email: string;
	password: string;
	role: UserRole;
	isActive: boolean;
	phone: string;
}

const SEED_USERS: SeedUser[] = [
	{
		name: "Administrador Cermont",
		email: "Gerencia@cermont.co",
		password: DEFAULT_PASSWORD,
		role: "manager",
		isActive: true,
		phone: "+57 316 535 2952",
	},
];

// ─── Main ──────────────────────────────────────────────────────────────────────

function assertSafeSeedTarget(): void {
	if (env.NODE_ENV === "production" && !ALLOW_PRODUCTION_SEED) {
		throw new Error(
			"Refusing to run destructive seed in production. " +
				"Set SEED_ALLOW_DESTRUCTIVE=true only for an intentional maintenance run.",
		);
	}
}

async function seed(): Promise<void> {
	assertSafeSeedTarget();
	log.info("Conectando a MongoDB...");

	await mongoose.connect(MONGODB_URI, { family: 4 });
	log.info("Conectado a MongoDB");

	try {
		// Limpiar todos los usuarios existentes
		const deleteResult = await User.deleteMany({});
		log.info(`Eliminados ${deleteResult.deletedCount} usuarios previos`);

		// Crear usuarios — el hook pre('save') hashea la contrasena automaticamente
		const created: string[] = [];
		for (const userData of SEED_USERS) {
			const user = new User(userData);
			await user.save();
			created.push(user.email);
		}

		// Reporte
		log.info(`Seed completado — ${created.length} usuarios creados`);
		for (const u of SEED_USERS) {
			const roleLabel = ROLE_LABELS[u.role];
			log.info(`  ${u.email.padEnd(35)} ${u.role} (${roleLabel})`);
		}
		log.info("Contrasena definida por SEED_DEFAULT_PASSWORD");
	} catch (error) {
		log.error("Error en seed:", { error });
		process.exit(1);
	} finally {
		await mongoose.disconnect();
		log.info("Desconectado de MongoDB");
	}
}

void seed();
