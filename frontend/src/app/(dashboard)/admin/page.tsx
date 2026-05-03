import { ADMIN_ROLES } from "@cermont/shared-types/rbac";
import { requireRole } from "@/auth/session";
import { AdminOverview } from "@/users/ui/AdminOverview";

export default async function AdminPage() {
	await requireRole(ADMIN_ROLES);

	return (
		<section aria-label="Administration overview">
			<AdminOverview />
		</section>
	);
}
