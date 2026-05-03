import type { User as UserDto } from "@cermont/shared-types";
import { ALL_USER_ROLE_INPUTS, type UserRoleInput } from "@cermont/shared-types/rbac";
import bcrypt from "bcryptjs";
import { type Document, type Model, model, Schema } from "mongoose";

export { TokenBlacklist } from "./token-blacklist.model";

// ═══════════════════════════════════════════════════════════════════════════════
// User Model — Per DOC-09 §7 (Diccionario de Datos)
//
// DRY: Los roles coinciden con @cermont/shared-types/rbac (RBAC)
// S.S.O.T: Tipado derivado estricamente de UserDto (@cermont/shared-types)
// SEGURIDAD: password tiene select:false + toJSON limpia datos sensibles
// ═══════════════════════════════════════════════════════════════════════════════

// SSOT para Mongoose schema — roles en minúsculas per DOC-04
export const USER_ROLES: readonly UserRoleInput[] = ALL_USER_ROLE_INPUTS;
export type Role = UserRoleInput;

// Single Source of Truth: Inherit pure business data from UserDto
export type UserDocumentFields = Omit<UserDto, "_id" | "createdAt" | "updatedAt" | "role"> & {
	password: string; // Not in UserDto (backend only)
	role: UserRoleInput;
	resetToken: string;
	resetTokenExpires: Date;
	webAuthnCredentials: {
		credentialId: string;
		publicKey: Buffer;
		counter: number;
		transports: string[];
		deviceLabel?: string;
		createdAt: Date;
		lastUsedAt?: Date;
	}[];
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

const WebAuthnCredentialSchema = new Schema(
	{
		credentialId: { type: String, required: true, index: true },
		publicKey: { type: Buffer, required: true },
		counter: { type: Number, required: true, default: 0 },
		transports: [{ type: String }],
		deviceLabel: { type: String, maxlength: 80 },
		createdAt: { type: Date, default: Date.now },
		lastUsedAt: { type: Date },
	},
	{ _id: false, versionKey: false },
);

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
		role: {
			type: String,
			enum: Array.from(USER_ROLES),
			required: true,
			index: true,
		},
		isActive: { type: Boolean, default: true, index: true },
		phone: { type: String, maxlength: 20 },
		avatarUrl: { type: String },
		resetToken: { type: String, select: false },
		resetTokenExpires: { type: Date, select: false },
		webAuthnCredentials: { type: [WebAuthnCredentialSchema], default: [] },
	},
	{ timestamps: true, versionKey: false },
);

UserSchema.index({ role: 1, isActive: 1, name: 1 });
UserSchema.index({ "webAuthnCredentials.credentialId": 1 }, { sparse: true });
UserSchema.index({ resetToken: 1, resetTokenExpires: 1 }, { sparse: true });

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
