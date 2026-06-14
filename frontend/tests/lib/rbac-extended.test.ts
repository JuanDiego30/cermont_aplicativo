import {
	ADMIN_ROLES,
	ALL_AUTHENTICATED_ROLES,
	AUDIT_ACCESS_ROLES,
	canAccessPath,
	getAllowedRolesForPath,
	hasRole,
	isAuthenticatedRole,
	isPublicPath,
	REPORT_ROLES,
} from "@cermont/domain";
import { describe, expect, it } from "vitest";
import { APP_ROUTES } from "@/lib/routes";

describe("RBAC - Role Constants", () => {
	it("ADMIN_ROLES contains management and administrative coordinators", () => {
		expect(ADMIN_ROLES).toContain("gerente");
		expect(ADMIN_ROLES).toContain("administrativo");
		expect(ADMIN_ROLES).toContain("coord_administrativo");
		expect(ADMIN_ROLES.length).toBe(3);
	});

	it("uses the same administrative scope for forensic audit access", () => {
		expect(AUDIT_ACCESS_ROLES).toEqual(ADMIN_ROLES);
	});

	it("ALL_AUTHENTICATED_ROLES contains all roles", () => {
		expect(ALL_AUTHENTICATED_ROLES).toContain("tecnico");
		expect(ALL_AUTHENTICATED_ROLES).toContain("gerente");
		expect(ALL_AUTHENTICATED_ROLES).toContain("residente");
		expect(ALL_AUTHENTICATED_ROLES).toContain("supervisor");
		expect(ALL_AUTHENTICATED_ROLES).toContain("supervisor_electricista");
		expect(ALL_AUTHENTICATED_ROLES).toContain("tecnico_electricista");
		expect(ALL_AUTHENTICATED_ROLES).toContain("administrativo");
		expect(ALL_AUTHENTICATED_ROLES).toContain("coord_administrativo");
		expect(ALL_AUTHENTICATED_ROLES).toContain("auxiliar_contable");
		expect(ALL_AUTHENTICATED_ROLES).toContain("auxiliar_hes");
		expect(ALL_AUTHENTICATED_ROLES).toContain("oficial_construccion");
		expect(ALL_AUTHENTICATED_ROLES).toContain("pasante");
		expect(ALL_AUTHENTICATED_ROLES).toContain("operador");
		expect(ALL_AUTHENTICATED_ROLES).toContain("hes");
		expect(ALL_AUTHENTICATED_ROLES).toContain("cliente");
	});

	it("REPORT_ROLES includes gerente and residente", () => {
		expect(REPORT_ROLES).toContain("gerente");
		expect(REPORT_ROLES).toContain("residente");
		expect(REPORT_ROLES).toContain("supervisor");
		expect(REPORT_ROLES).toContain("administrativo");
	});

	it("role arrays are readonly", () => {
		// TypeScript check: trying to push would fail at compile time
		// This test documents the constraint
		const adminRoles: readonly string[] = ADMIN_ROLES;
		expect(adminRoles.length).toBeGreaterThan(0);
	});
});

describe("RBAC - hasRole Function", () => {
	it("returns true for exact role match", () => {
		expect(hasRole("gerente", ADMIN_ROLES)).toBe(true);
		expect(hasRole("administrativo", ADMIN_ROLES)).toBe(true);
	});

	it("returns false for non-matching roles", () => {
		expect(hasRole("tecnico", ADMIN_ROLES)).toBe(false);
		expect(hasRole("residente", ADMIN_ROLES)).toBe(false);
	});

	it("works with ALL_AUTHENTICATED_ROLES", () => {
		ALL_AUTHENTICATED_ROLES.forEach((role: string) => {
			expect(hasRole(role, ALL_AUTHENTICATED_ROLES)).toBe(true);
		});
	});
});

describe("RBAC - canAccessPath Function", () => {
	it("gerente can access /admin", () => {
		expect(canAccessPath("/admin", "gerente")).toBe(true);
	});

	it("administrativo can access /admin", () => {
		expect(canAccessPath("/admin", "administrativo")).toBe(true);
	});

	it("tecnico cannot access /admin", () => {
		expect(canAccessPath("/admin", "tecnico")).toBe(false);
	});

	it("gerente can access /orders", () => {
		expect(canAccessPath("/orders", "gerente")).toBe(true);
	});

	it("tecnico can access /orders", () => {
		expect(canAccessPath("/orders", "tecnico")).toBe(true);
	});

	it("cliente cannot access /orders", () => {
		expect(canAccessPath("/orders", "cliente")).toBe(false);
	});

	it("all authenticated roles can access /profile", () => {
		ALL_AUTHENTICATED_ROLES.forEach((role: string) => {
			expect(canAccessPath("/profile", role)).toBe(true);
		});
	});

	it("all authenticated roles can access offline recovery", () => {
		ALL_AUTHENTICATED_ROLES.forEach((role: string) => {
			expect(canAccessPath("/offline-sync", role)).toBe(true);
		});
	});

	it("handles case-insensitive paths", () => {
		expect(canAccessPath("/ORDERS", "gerente")).toBe(true);
		expect(canAccessPath("/Orders", "gerente")).toBe(true);
		expect(canAccessPath("/ORDERS", "cliente")).toBe(false);
	});

	it("allows access to / for authenticated roles", () => {
		ALL_AUTHENTICATED_ROLES.forEach((role: string) => {
			expect(canAccessPath("/", role)).toBe(true);
		});
	});

	it("reports can be accessed by REPORT_ROLES", () => {
		REPORT_ROLES.forEach((role: string) => {
			expect(canAccessPath("/reports", role)).toBe(true);
		});
	});

	it("public routes are accessible before role checks", () => {
		expect(isPublicPath(APP_ROUTES.login)).toBe(true);
		expect(isPublicPath(APP_ROUTES.unauthorized)).toBe(true);
		expect(canAccessPath(APP_ROUTES.login, "desconocido")).toBe(true);
	});

	it("denies unknown protected routes by default", () => {
		expect(canAccessPath("/internal-shadow-route", "gerente")).toBe(false);
	});

	it("uses centralized route role access for site visits and payments", () => {
		expect(canAccessPath(APP_ROUTES.siteVisits, "tecnico")).toBe(true);
		expect(canAccessPath(APP_ROUTES.siteVisits, "cliente")).toBe(false);
		expect(canAccessPath(APP_ROUTES.payments, "administrativo")).toBe(true);
		expect(canAccessPath(APP_ROUTES.payments, "tecnico")).toBe(false);
	});

	it("exposes allowed roles for route-aware navigation", () => {
		expect(getAllowedRolesForPath(APP_ROUTES.billing)).toContain("administrativo");
		expect(getAllowedRolesForPath(APP_ROUTES.billingSes)).toContain("cliente");
		expect(getAllowedRolesForPath(APP_ROUTES.planning)).toContain("supervisor");
	});
});

describe("RBAC - Role Scope", () => {
	it("ALL_AUTHENTICATED_ROLES includes ADMIN_ROLES", () => {
		ADMIN_ROLES.forEach((adminRole: string) => {
			expect(ALL_AUTHENTICATED_ROLES).toContain(adminRole);
		});
	});

	it("every role appears exactly once in ALL_AUTHENTICATED_ROLES", () => {
		const uniqueRoles = new Set(ALL_AUTHENTICATED_ROLES);
		expect(uniqueRoles.size).toBe(ALL_AUTHENTICATED_ROLES.length);
	});

	it("REPORT_ROLES is appropriate subset", () => {
		expect(REPORT_ROLES).toContain("gerente");
		expect(REPORT_ROLES).toContain("residente");
		expect(REPORT_ROLES).toContain("administrativo");
	});

	it("rejects transitional or unknown roles from authenticated surfaces", () => {
		expect(isAuthenticatedRole("mfa_pending")).toBe(false);
		expect(isAuthenticatedRole("tecnico")).toBe(true);
		expect(isAuthenticatedRole("desconocido")).toBe(false);
	});
});
