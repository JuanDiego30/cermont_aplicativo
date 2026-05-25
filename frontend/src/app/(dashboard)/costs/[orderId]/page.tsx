import { redirect } from "next/navigation";

export default async function CostDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
	const { orderId } = await params;
	redirect(`/costs/${orderId}/ejecucion`);
}
