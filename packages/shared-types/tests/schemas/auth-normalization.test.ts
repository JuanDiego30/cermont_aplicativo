import { describe, expect, it } from "vitest";
import { LEGACY_ROLE_ALIASES, normalizeUserRole } from "../../src/rbac";
import { LoginSchema } from "../../src/schemas/auth.schema";
import { CreateUserSchema, UpdateUserSchema, UserRoleSchema } from "../../src/schemas/user.schema";

describe("auth email normalization", () => {
	it("normalizes login email casing and surrounding whitespace", () => {
		const parsed = LoginSchema.parse({
			email: " Gerencia@Cermont.co ",
			password: "Cermon2026!",
		});

		expect(parsed.email).toBe("gerencia@cermont.co");
	});

	it("normalizes user email fields shared by create and update schemas", () => {
		const created = CreateUserSchema.parse({
			name: "Administrador Cermont",
			email: " Gerencia@Cermont.co ",
			password: "Cermon2026!",
			role: "gerente",
		});
		const updated = UpdateUserSchema.parse({
			email: " Soporte@Cermont.co ",
		});

		expect(created.email).toBe("gerencia@cermont.co");
		expect(created.role).toBe("manager");
		expect(updated.email).toBe("soporte@cermont.co");
	});

	it("normalizes legacy role inputs to canonical roles", () => {
		for (const [legacyRole, canonicalRole] of Object.entries(LEGACY_ROLE_ALIASES)) {
			expect(normalizeUserRole(legacyRole)).toBe(canonicalRole);
			expect(UserRoleSchema.parse(legacyRole)).toBe(canonicalRole);
		}
	});
});
