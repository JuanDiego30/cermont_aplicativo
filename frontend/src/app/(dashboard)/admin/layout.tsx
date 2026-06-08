import { ADMIN_ROLES } from "@cermont/domain";
import type { ReactNode } from "react";
import { requireRole } from "@/modules/auth/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
	await requireRole(ADMIN_ROLES);
	return <section>{children}</section>;
}
