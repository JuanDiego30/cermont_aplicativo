"use client";

import {
	ADMIN_ROLES,
	APPROVER_ROLES,
	ASSET_MANAGEMENT_ROLES,
	AUDIT_ACCESS_ROLES,
	BILLING_ACCESS_ROLES,
	DASHBOARD_ACCESS_ROLES,
	EVIDENCE_ACCESS_ROLES,
	FIELD_EXECUTION_ACCESS_ROLES,
	FINANCE_ACCESS_ROLES,
	getRoleName,
	hasRole,
	INTERNAL_ROLES,
	MAINTENANCE_MANAGEMENT_ROLES,
	MANAGEMENT_ROLES,
	PLANNING_ACCESS_ROLES,
	REPORT_ROLES,
	RESOURCE_ROLES,
	ROLE_HIERARCHY,
	SITE_VISIT_MANAGEMENT_ROLES,
	type UserRole,
} from "@cermont/domain";
import { useMemo } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";

export type PermissionAction =
	| "approve_proposal"
	| "reject_proposal"
	| "convert_proposal_to_order"
	| "approve_planning"
	| "reopen_planning"
	| "start_execution"
	| "upload_evidence"
	| "approve_technical_report"
	| "generate_delivery_record"
	| "register_client_signature"
	| "create_ses"
	| "approve_ses"
	| "create_invoice"
	| "approve_invoice"
	| "register_payment"
	| "edit_order"
	| "close_case"
	| "archive_case"
	| "manage_users"
	| "view_audit"
	| "manage_assets"
	| "manage_maintenance"
	| "create_proposal"
	| "create_work_request"
	| "view_admin_panel"
	| "view_costs";

const ACTION_ROLE_MAP: Record<PermissionAction, readonly UserRole[]> = {
	approve_proposal: APPROVER_ROLES,
	reject_proposal: APPROVER_ROLES,
	convert_proposal_to_order: MANAGEMENT_ROLES,
	approve_planning: MANAGEMENT_ROLES,
	reopen_planning: MANAGEMENT_ROLES,
	start_execution: FIELD_EXECUTION_ACCESS_ROLES,
	upload_evidence: EVIDENCE_ACCESS_ROLES,
	approve_technical_report: REPORT_ROLES,
	generate_delivery_record: REPORT_ROLES,
	register_client_signature: MANAGEMENT_ROLES,
	create_ses: BILLING_ACCESS_ROLES,
	approve_ses: BILLING_ACCESS_ROLES,
	create_invoice: BILLING_ACCESS_ROLES,
	approve_invoice: APPROVER_ROLES,
	register_payment: FINANCE_ACCESS_ROLES,
	edit_order: RESOURCE_ROLES,
	close_case: MANAGEMENT_ROLES,
	archive_case: ["gerente"],
	manage_users: ADMIN_ROLES,
	view_audit: AUDIT_ACCESS_ROLES,
	manage_assets: ASSET_MANAGEMENT_ROLES,
	manage_maintenance: MAINTENANCE_MANAGEMENT_ROLES,
	create_proposal: [...RESOURCE_ROLES, "administrativo"],
	create_work_request: INTERNAL_ROLES,
	view_admin_panel: ADMIN_ROLES,
	view_costs: INTERNAL_ROLES,
};

export type AppModule =
	| "dashboard"
	| "service-cases"
	| "orders"
	| "planning"
	| "execution"
	| "evidences"
	| "reports"
	| "documents"
	| "work-requests"
	| "site-visits"
	| "proposals"
	| "purchase-orders"
	| "delivery-records"
	| "billing"
	| "payments"
	| "costs"
	| "assets"
	| "maintenance"
	| "resources"
	| "admin";

const MODULE_ROLE_MAP: Readonly<Record<AppModule, readonly UserRole[]>> = {
	dashboard: DASHBOARD_ACCESS_ROLES,
	"service-cases": DASHBOARD_ACCESS_ROLES,
	orders: RESOURCE_ROLES,
	planning: PLANNING_ACCESS_ROLES,
	execution: FIELD_EXECUTION_ACCESS_ROLES,
	evidences: EVIDENCE_ACCESS_ROLES,
	reports: REPORT_ROLES,
	documents: DASHBOARD_ACCESS_ROLES,
	"work-requests": DASHBOARD_ACCESS_ROLES,
	"site-visits": SITE_VISIT_MANAGEMENT_ROLES,
	proposals: [...MANAGEMENT_ROLES, "administrativo"],
	"purchase-orders": INTERNAL_ROLES,
	"delivery-records": INTERNAL_ROLES,
	billing: BILLING_ACCESS_ROLES,
	payments: BILLING_ACCESS_ROLES,
	costs: DASHBOARD_ACCESS_ROLES,
	assets: ASSET_MANAGEMENT_ROLES,
	maintenance: MAINTENANCE_MANAGEMENT_ROLES,
	resources: DASHBOARD_ACCESS_ROLES,
	admin: ADMIN_ROLES,
} as const;

export interface UsePermissionsOptions {
	readonly userRole?: UserRole | null;
}

export interface UsePermissionsResult {
	readonly canPerformAction: (action: PermissionAction) => boolean;
	readonly isRoleAtLeast: (minimumRole: UserRole) => boolean;
	readonly getVisibleModules: () => AppModule[];
	readonly isReadOnly: boolean;
	readonly roleLabel: string;
	readonly roleHierarchy: typeof ROLE_HIERARCHY;
	/** Convenience helpers for common checks */
	readonly canApprove: boolean;
	readonly isAdmin: boolean;
	readonly isField: boolean;
	readonly hasRoleLevel: (minLevel: number) => boolean;
}

export function usePermissions({ userRole }: UsePermissionsOptions = {}): UsePermissionsResult {
	const auth = useAuth();
	const resolvedRole = useMemo((): UserRole => {
		if (userRole) {
			return userRole;
		}
		if (auth.user?.role) {
			return auth.user.role;
		}
		return "cliente";
	}, [userRole, auth.user?.role]);

	const roleLabel = useMemo(() => getRoleName(resolvedRole), [resolvedRole]);

	const canPerformAction = useMemo(
		() =>
			(action: PermissionAction): boolean => {
				if (resolvedRole === "cliente") {
					return false;
				}
				const allowedRoles = ACTION_ROLE_MAP[action];
				if (!allowedRoles) {
					return false;
				}
				return hasRole(resolvedRole, allowedRoles);
			},
		[resolvedRole],
	);

	const isRoleAtLeast = useMemo(
		() =>
			(minimumRole: UserRole): boolean => {
				const userLevel = ROLE_HIERARCHY[resolvedRole];
				const minimumLevel = ROLE_HIERARCHY[minimumRole];
				return userLevel <= minimumLevel;
			},
		[resolvedRole],
	);

	const getVisibleModules = useMemo(
		() => (): AppModule[] => {
			if (resolvedRole === "cliente") {
				return [];
			}
			return (Object.entries(MODULE_ROLE_MAP) as [AppModule, readonly UserRole[]][])
				.filter(([, allowedRoles]) => hasRole(resolvedRole, allowedRoles))
				.map(([module]) => module);
		},
		[resolvedRole],
	);

	const isReadOnly = useMemo(() => resolvedRole === "pasante", [resolvedRole]);

	// Convenience helpers — use hasRole for normalization-aware comparison
	const canApprove = useMemo(() => hasRole(resolvedRole, APPROVER_ROLES), [resolvedRole]);
	const isAdmin = useMemo(() => hasRole(resolvedRole, ADMIN_ROLES), [resolvedRole]);
	const isField = useMemo(
		() => hasRole(resolvedRole, FIELD_EXECUTION_ACCESS_ROLES),
		[resolvedRole],
	);
	const hasRoleLevel = useMemo(
		() =>
			(minLevel: number): boolean =>
				(ROLE_HIERARCHY[resolvedRole] ?? 99) <= minLevel,
		[resolvedRole],
	);

	return {
		canPerformAction,
		isRoleAtLeast,
		getVisibleModules,
		isReadOnly,
		roleLabel,
		roleHierarchy: ROLE_HIERARCHY,
		canApprove,
		isAdmin,
		isField,
		hasRoleLevel,
	};
}
