"use client";

import { use } from "react";
import InvoicePipelinePage from "@/modules/invoices/ui/InvoicePipelinePage";

interface Props {
	params: Promise<{ id: string }>;
}

export default function InvoicePipelineRoute({ params }: Props) {
	const { id } = use(params);
	return <InvoicePipelinePage serviceCaseId={id} />;
}
