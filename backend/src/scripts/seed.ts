/**
 * Seed script — Crea usuarios RBAC para desarrollo/testing.
 *
 * Usa el modelo Mongoose User directamente, lo que garantiza:
 * - Validación de schema (campos requeridos, enums)
 * - Hash automático de contraseñas vía pre('save') hook
 * - Índice unique en email
 *
 * Uso:
 *   npm run seed          (desde backend, con tsx)
 *   npm run seed:prod     (con node + dist compilado)
 *   npm run db:seed       (desde la raíz del monorepo)
 *
 * Contraseña para TODOS los usuarios: definida por SEED_DEFAULT_PASSWORD
 */
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

import { validateEnv } from "@cermont/config";
import { ROLE_LABELS, type UserRole } from "@cermont/domain";
import mongoose from "mongoose";
import { User } from "../models/User";

// ─── Config ────────────────────────────────────────────────────────────────────

const env = validateEnv();

if (!env.MONGODB_URI) {
	throw new Error("MONGODB_URI is required to run the seed script");
}
if (!env.SEED_DEFAULT_PASSWORD) {
	throw new Error("SEED_DEFAULT_PASSWORD is required to run the seed script");
}

const MONGODB_URI = env.MONGODB_URI;
const DEFAULT_PASSWORD = env.SEED_DEFAULT_PASSWORD;

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
		name: "Gerencia General",
		email: "gerencia@cermont.co",
		password: "",
		role: "gerente",
		isActive: true,
		phone: "+57 300 000 0000",
	},
	{
		name: "Gerente Principal",
		email: "gerente@cermont.com",
		password: DEFAULT_PASSWORD,
		role: "gerente",
		isActive: true,
		phone: "+57 300 000 0001",
	},
	{
		name: "Ing. Residente Carlos",
		email: "residente@cermont.com",
		password: DEFAULT_PASSWORD,
		role: "residente",
		isActive: true,
		phone: "+57 300 000 0002",
	},
	{
		name: "Ana Coordinadora HES",
		email: "hes@cermont.com",
		password: DEFAULT_PASSWORD,
		role: "hes",
		isActive: true,
		phone: "+57 300 000 0003",
	},
	{
		name: "Pedro Supervisor",
		email: "supervisor@cermont.com",
		password: DEFAULT_PASSWORD,
		role: "supervisor",
		isActive: true,
		phone: "+57 300 000 0004",
	},
	{
		name: "Luis Operador",
		email: "operador@cermont.com",
		password: DEFAULT_PASSWORD,
		role: "operador",
		isActive: true,
		phone: "+57 300 000 0005",
	},
	{
		name: "María Técnica",
		email: "tecnico@cermont.com",
		password: DEFAULT_PASSWORD,
		role: "tecnico",
		isActive: true,
		phone: "+57 300 000 0006",
	},
	{
		name: "Roberto Administrativo",
		email: "administrativo@cermont.com",
		password: DEFAULT_PASSWORD,
		role: "administrativo",
		isActive: true,
		phone: "+57 300 000 0007",
	},
	{
		name: "Cliente Demo",
		email: "cliente@cermont.com",
		password: DEFAULT_PASSWORD,
		role: "cliente",
		isActive: true,
		phone: "+57 300 000 0008",
	},
];

// ─── Main ──────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
	console.log("🔌 Conectando a MongoDB...");

	await mongoose.connect(MONGODB_URI, { family: 4 });
	console.log("✅ Conectado a MongoDB");

	try {
		// Limpiar usuarios seed existentes (por email)
		const seedEmails = SEED_USERS.map((u) => u.email);
		const deleteResult = await User.deleteMany({ email: { $in: seedEmails } });
		console.log(`🗑️  Eliminados ${deleteResult.deletedCount} usuarios seed previos`);

		// Crear usuarios — el hook pre('save') hashea la contraseña automáticamente
		const created: string[] = [];
		for (const userData of SEED_USERS) {
			const user = new User(userData);
			await user.save();
			created.push(user.email);
		}

		// Reporte
		console.log(`\n✅ Seed completado — ${created.length} usuarios creados\n`);
		console.log("┌─────────────────────────────────────┬──────────────────┐");
		console.log("│ Email                               │ Rol              │");
		console.log("├─────────────────────────────────────┼──────────────────┤");
		for (const u of SEED_USERS) {
			const email = u.email.padEnd(35);
			const roleLabel = `${u.role} (${ROLE_LABELS[u.role]})`.padEnd(16);
			console.log(`│ ${email} │ ${roleLabel} │`);
		}
		console.log("└─────────────────────────────────────┴──────────────────┘");
		console.log("🔐 Contraseña definida por SEED_DEFAULT_PASSWORD");
	} catch (error) {
		console.error("❌ Error en seed:", error);
		process.exit(1);
	} finally {
		await mongoose.disconnect();
		console.log("\n🔌 Desconectado de MongoDB");
	}
}

seed();
