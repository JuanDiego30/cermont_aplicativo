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
 *   npm run db:seed       (desde la raíz del monorepo)
 *
 * Cuenta principal: gerencia@cermont.co / Cermont2026! (fija, no depende de env vars)
 * Demás cuentas:     {email} / SEED_DEFAULT_PASSWORD (o Cermont2026! si no se configura)
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

const MONGODB_URI = env.MONGODB_URI;

// Contraseña fija para gerencia — no depende de SEED_DEFAULT_PASSWORD
const GERENCIA_PASSWORD = "Cermont2026!";
const DEFAULT_PASSWORD = env.SEED_DEFAULT_PASSWORD ?? GERENCIA_PASSWORD;

if (!env.SEED_DEFAULT_PASSWORD) {
	console.warn(
		"⚠️  SEED_DEFAULT_PASSWORD no configurada en backend/.env. Usando 'Cermont2026!' por defecto.",
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
	// ── Gerencia ──────────────────────────────────────────────────
	{
		name: "Gerencia General",
		email: "gerencia@cermont.co",
		password: GERENCIA_PASSWORD,
		role: "gerente",
		isActive: true,
		phone: "+57 300 000 0000",
	},
	{
		name: "Gerente Principal",
		email: "gerente@cermont.co",
		password: DEFAULT_PASSWORD,
		role: "gerente",
		isActive: true,
		phone: "+57 300 000 0001",
	},

	// ── Residencia ────────────────────────────────────────────────
	{
		name: "Ing. Residente Carlos",
		email: "residente@cermont.co",
		password: DEFAULT_PASSWORD,
		role: "residente",
		isActive: true,
		phone: "+57 300 000 0002",
	},

	// ── HES ───────────────────────────────────────────────────────
	{
		name: "Ana Coordinadora HES",
		email: "hes@cermont.co",
		password: DEFAULT_PASSWORD,
		role: "hes",
		isActive: true,
		phone: "+57 300 000 0003",
	},
	{
		name: "Carlos Auxiliar HES",
		email: "auxiliar.hes@cermont.co",
		password: DEFAULT_PASSWORD,
		role: "auxiliar_hes",
		isActive: true,
		phone: "+57 300 000 0010",
	},

	// ── Administrativo / Financiero ───────────────────────────────
	{
		name: "Coordinador Administrativo Laura",
		email: "coord.admin@cermont.co",
		password: DEFAULT_PASSWORD,
		role: "coord_administrativo",
		isActive: true,
		phone: "+57 300 000 0004",
	},
	{
		name: "Auxiliar Contable Pedro",
		email: "auxiliar.contable@cermont.co",
		password: DEFAULT_PASSWORD,
		role: "auxiliar_contable",
		isActive: true,
		phone: "+57 300 000 0005",
	},
	{
		name: "Roberto Administrativo",
		email: "administrativo@cermont.co",
		password: DEFAULT_PASSWORD,
		role: "administrativo",
		isActive: true,
		phone: "+57 300 000 0006",
	},

	// ── Supervisión ───────────────────────────────────────────────
	{
		name: "Supervisor General Pedro",
		email: "supervisor@cermont.co",
		password: DEFAULT_PASSWORD,
		role: "supervisor",
		isActive: true,
		phone: "+57 300 000 0007",
	},
	{
		name: "Supervisor Electricista Miguel",
		email: "supervisor.electricista@cermont.co",
		password: DEFAULT_PASSWORD,
		role: "supervisor_electricista",
		isActive: true,
		phone: "+57 300 000 0008",
	},

	// ── Técnicos / Operativos ─────────────────────────────────────
	{
		name: "Técnico Electricista Juan",
		email: "tecnico.electricista@cermont.co",
		password: DEFAULT_PASSWORD,
		role: "tecnico_electricista",
		isActive: true,
		phone: "+57 300 000 0009",
	},
	{
		name: "Luis Operador",
		email: "operador@cermont.co",
		password: DEFAULT_PASSWORD,
		role: "operador",
		isActive: true,
		phone: "+57 300 000 0010",
	},
	{
		name: "María Técnica",
		email: "tecnico@cermont.co",
		password: DEFAULT_PASSWORD,
		role: "tecnico",
		isActive: true,
		phone: "+57 300 000 0011",
	},
	{
		name: "Oficial Construcción José",
		email: "oficial.construccion@cermont.co",
		password: DEFAULT_PASSWORD,
		role: "oficial_construccion",
		isActive: true,
		phone: "+57 300 000 0012",
	},

	// ── Pasante ──────────────────────────────────────────────────
	{
		name: "Pasante Sofia",
		email: "pasante@cermont.co",
		password: DEFAULT_PASSWORD,
		role: "pasante",
		isActive: true,
		phone: "+57 300 000 0013",
	},

	// ── Cliente ──────────────────────────────────────────────────
	{
		name: "Cliente Demo",
		email: "cliente@cermont.co",
		password: DEFAULT_PASSWORD,
		role: "cliente",
		isActive: true,
		phone: "+57 300 000 0014",
	},
];

// ─── Main ──────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
	console.log("🔌 Conectando a MongoDB...");

	await mongoose.connect(MONGODB_URI, { family: 4 });
	console.log("✅ Conectado a MongoDB");

	try {
		// Limpiar TODA la colección users (no solo emails del seed)
		const deleteResult = await User.deleteMany({});
		console.log(`🗑️  Eliminados ${deleteResult.deletedCount} usuarios existentes`);

		// Crear usuarios — el hook pre('save') hashea la contraseña automáticamente
		const created: string[] = [];
		for (const userData of SEED_USERS) {
			const user = new User(userData);
			await user.save();
			created.push(user.email);
		}

		// Reporte con columna de contraseña
		console.log(`\n✅ Seed completado — ${created.length} usuarios creados\n`);
		console.log(
			"┌─────────────────────────────────────────────┬──────────────────────────┬──────────────────────┐",
		);
		console.log(
			"│ Email                                       │ Rol                      │ Contraseña           │",
		);
		console.log(
			"├─────────────────────────────────────────────┼──────────────────────────┼──────────────────────┤",
		);
		for (const u of SEED_USERS) {
			const email = u.email.padEnd(43);
			const roleLabel = `${u.role} (${ROLE_LABELS[u.role]})`.padEnd(24);
			const passLabel =
				u.password === GERENCIA_PASSWORD
					? "Cermont2026! (fija)".padEnd(20)
					: "(SEED_DEFAULT_PASSWORD)".padEnd(20);
			console.log(`│ ${email} │ ${roleLabel} │ ${passLabel} │`);
		}
		console.log(
			"└─────────────────────────────────────────────┴──────────────────────────┴──────────────────────┘",
		);
	} catch (error) {
		console.error("❌ Error en seed:", error);
		process.exit(1);
	} finally {
		await mongoose.disconnect();
		console.log("\n🔌 Desconectado de MongoDB");
	}
}

seed();
