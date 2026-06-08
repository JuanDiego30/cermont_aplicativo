import { ADMIN_PLUS_RESIDENTE } from "@cermont/domain";
import { requireRole } from "@/modules/auth/session";
import { InvoicePageClient } from "@/modules/orders/ui/InvoicePageClient";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
	await requireRole([...ADMIN_PLUS_RESIDENTE]);
	const { id } = await params;
	return (
		<main>
			<InvoicePageClient orderId={id} />
		</main>
	);
}
