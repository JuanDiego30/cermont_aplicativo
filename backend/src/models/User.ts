import { ALL_AUTHENTICATED_ROLES, type UserRole } from "@cermont/domain";
import type { User as UserDto } from "@cermont/shared-types";
import bcrypt from "bcryptjs";
import { type Document, type Model, model, Schema } from "mongoose";

// ═══════════════════════════════════════════════════════════════════════════════
// User Model — Per DOC-09 §7 (Diccionario de Datos)
//
// DRY: Los roles coinciden con @cermont/domain (RBAC)
// S.S.O.T: Tipado derivado estricamente de UserDto (@cermont/shared-types)
// SEGURIDAD: password tiene select:false + toJSON limpia datos sensibles
// ═══════════════════════════════════════════════════════════════════════════════

// SSOT para Mongoose schema — roles en minúsculas per DOC-04
export const USER_ROLES: readonly UserRole[] = ALL_AUTHENTICATED_ROLES;
export type Role = UserRole;

// Passkey/WebAuthn credential — backend-only, never exposed via UserDto
export interface IWebAuthnCredential {
	credentialId: string; // base64url, matches WebAuthnCredential.id from @simplewebauthn/server
	publicKey: string; // base64url-encoded COSE public key
	counter: number;
	transports?: string[];
	deviceName?: string;
	createdAt: Date;
}

// Single Source of Truth: Inherit pure business data from UserDto
export type UserDocumentFields = Omit<UserDto, "_id" | "createdAt" | "updatedAt"> & {
	password: string; // Not in UserDto (backend only)
	tokenVersion: number;
	webauthnCredentials: IWebAuthnCredential[]; // Not in UserDto (backend only)
	webauthnChallenge?: string; // Not in UserDto (backend only) — pending registration/auth ceremony
	createdAt: Date;
	updatedAt: Date;
};

// Interface merging Document to preserve Mongoose typings internally
export interface IUserDocument extends UserDocumentFields, Document {}

// Métodos de instancia
interface IUserMethods {
	comparePassword(plain: string): Promise<boolean>;
}

// Tipo del modelo Mongoose
type UserModel = Model<IUserDocument, Record<string, never>, IUserMethods>;

// Schema con tipado genérico
const UserSchema = new Schema<IUserDocument, UserModel, IUserMethods>(
	{
		name: { type: String, required: true, trim: true, maxlength: 100 },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
		},
		// SEGURIDAD: select:false — password nunca se incluye en queries por defecto
		password: { type: String, required: true, select: false },
		tokenVersion: { type: Number, default: 0, min: 0, select: false },
		role: {
			type: String,
			enum: Array.from(USER_ROLES),
			required: true,
			index: true,
		},
		isActive: { type: Boolean, default: true, index: true },
		phone: { type: String, maxlength: 20 },
		avatarUrl: { type: String },
		// Certificaciones de personal (alturas, espacios confinados, eléctrico, etc.)
		// Las fechas se guardan como ISO strings para alinear con el contrato compartido.
		certifications: {
			type: [
				new Schema(
					{
						name: { type: String, required: true },
						issuedAt: { type: String, required: true },
						expiresAt: { type: String },
						certificationNumber: { type: String },
						issuingBody: { type: String, maxlength: 200 },
					},
					{ _id: false },
				),
			],
			default: [],
		},
		skills: { type: [String], default: [] },
		webauthnCredentials: {
			type: [
				new Schema(
					{
						credentialId: { type: String, required: true },
						publicKey: { type: String, required: true },
						counter: { type: Number, required: true, default: 0 },
						transports: { type: [String], default: [] },
						deviceName: { type: String, maxlength: 100 },
						createdAt: { type: Date, default: Date.now },
					},
					{ _id: false },
				),
			],
			default: [],
			select: false,
		},
		webauthnChallenge: { type: String, select: false },
	},
	{ timestamps: true, versionKey: false },
);

// Hash automático de la contraseña antes de guardar
UserSchema.pre("save", async function () {
	if (!this.isModified("password")) {
		return;
	}
	const salt = await bcrypt.genSalt(12);
	this.password = await bcrypt.hash(this.password, salt);
});

// Método de instancia para comparar contraseñas
UserSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
	return bcrypt.compare(plain, this.password);
};

// SEGURIDAD: toJSON limpia __v y password de cualquier respuesta JSON
UserSchema.set("toJSON", {
	transform: (_doc, ret) => {
		const obj = ret as unknown as Record<string, unknown>;
		delete obj.__v;
		delete obj.password;
		return obj;
	},
});

export const User = model<IUserDocument, UserModel>("User", UserSchema);
