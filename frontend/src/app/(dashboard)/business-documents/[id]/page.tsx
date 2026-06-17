"use client";

import { AlertCircle, ArrowLeft, Check, FileText, X } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { BadgePill } from "@/core/ui/BadgePill";
import { Button } from "@/core/ui/Button";
import { Skeleton } from "@/core/ui/Skeleton";
import { useBusinessDocument } from "@/modules/business-documents/queries";
import { getDocumentTypeLabel } from "@/modules/business-documents/utils";

interface BusinessDocumentDetailProps {
	params: Promise<{ id: string }>;
}

const FIELD_TYPE_LABELS: Record<string, string> = {
	text: "Text",
	number: "Number",
	date: "Date",
	signature: "Signature",
	photo: "Photo",
	checkbox: "Checkbox",
	select: "Select",
	table: "Table",
	textarea: "Text Area",
};

export default function BusinessDocumentDetailPage({ params }: BusinessDocumentDetailProps) {
	const { id } = use(params);
	const { data: doc, isLoading, isError } = useBusinessDocument(id);

	if (isLoading) {
		return (
			<section aria-label="Loading document" className="space-y-4 p-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full rounded-xl" />
			</section>
		);
	}

	if (isError || !doc) {
		return (
			<section className="flex flex-col items-center gap-4 py-16">
				<AlertCircle className="size-8 text-brand-error" />
				<h2 className="text-lg font-semibold">Document not found</h2>
				<Button asChild variant="secondary">
					<Link href="/business-documents">Back to documents</Link>
				</Button>
			</section>
		);
	}

	return (
		<section aria-labelledby="doc-title" className="space-y-6 p-6">
			<div className="flex items-center gap-4">
				<Button asChild variant="ghost" size="sm">
					<Link href="/business-documents">
						<ArrowLeft className="size-4" />
						Back
					</Link>
				</Button>
			</div>

			<div className="flex items-start gap-4">
				<div className="rounded-xl bg-brand/10 p-3">
					<FileText className="size-8 text-brand" />
				</div>
				<div className="flex-1">
					<h1 id="doc-title" className="text-2xl font-bold">
						{doc.metadata.title}
					</h1>
					<p className="mt-1 text-secondary">{getDocumentTypeLabel(doc.documentType)}</p>
					<div className="mt-2 flex flex-wrap gap-2">
						<BadgePill>{doc.formatType.toUpperCase()}</BadgePill>
						<BadgePill>v{doc.version}</BadgePill>
						{doc.metadata.regulatoryBody && <BadgePill>{doc.metadata.regulatoryBody}</BadgePill>}
					</div>
				</div>
			</div>

			{doc.metadata.description && <p className="text-secondary">{doc.metadata.description}</p>}

			<div>
				<h2 className="mb-3 text-lg font-semibold">Field Mappings ({doc.fieldMappings.length})</h2>
				<div className="overflow-hidden rounded-xl border border-hairline">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-surface text-left">
								<th className="px-4 py-3 font-medium">Field Name</th>
								<th className="px-4 py-3 font-medium">Type</th>
								<th className="px-4 py-3 font-medium">Required</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-hairline">
							{doc.fieldMappings.map((field) => (
								<tr key={field.fieldName} className="hover:bg-surface/50">
									<td className="px-4 py-2.5 font-mono text-sm">{field.fieldName}</td>
									<td className="px-4 py-2.5 text-secondary">
										{FIELD_TYPE_LABELS[field.fieldType] ?? field.fieldType}
									</td>
									<td className="px-4 py-2.5">
										{field.required ? (
											<Check className="size-4 text-success" />
										) : (
											<X className="size-4 text-tertiary" />
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}
