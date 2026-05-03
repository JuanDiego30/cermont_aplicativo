import { ADMIN_ROLES } from "@cermont/shared-types/rbac";
import type { ReactNode } from "react";
import { requireRole } from "@/auth/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
	await requireRole(ADMIN_ROLES);
	return <section aria-label="Administration">{children}</section>;
}
