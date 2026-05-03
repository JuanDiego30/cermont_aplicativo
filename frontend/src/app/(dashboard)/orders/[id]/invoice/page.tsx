import { ADMIN_PLUS_RESIDENT_ENGINEER } from "@cermont/shared-types/rbac";
import { requireRole } from "@/auth/session";
import { InvoicePageClient } from "@/orders/ui/InvoicePageClient";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
	await requireRole([...ADMIN_PLUS_RESIDENT_ENGINEER]);
	const { id } = await params;
	return (
		<section aria-label="Order invoice">
			<InvoicePageClient orderId={id} />
		</section>
	);
}
