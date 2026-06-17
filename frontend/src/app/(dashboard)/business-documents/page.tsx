"use client";

import { AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { Skeleton } from "@/core/ui/Skeleton";
import { useBusinessDocuments } from "@/modules/business-documents/queries";
import { getDocumentTypeLabel } from "@/modules/business-documents/utils";

export default function BusinessDocumentsPage() {
	const [filter, setFilter] = useState<string | undefined>();
	const { data: docs, isLoading, isError, refetch } = useBusinessDocuments(filter);

	if (isLoading) {
		return (
			<section aria-label="Loading business documents" className="space-y-4 p-6">
				<Skeleton className="h-8 w-64" />
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{[0, 1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={`skel-${i}`} className="h-40 rounded-xl" />
					))}
				</div>
			</section>
		);
	}

	if (isError) {
		return (
			<section className="flex flex-col items-center gap-4 py-16">
				<AlertCircle className="size-8 text-brand-error" />
				<h2 className="text-lg font-semibold">Failed to load documents</h2>
				<p className="text-sm text-secondary">The backend may be unavailable. Please try again.</p>
				<p className="text-sm text-secondary">The backend may be unavailable. Please try again.</p>
				<Button onClick={() => refetch()}>Retry</Button>
			</section>
		);
	}

	if (!docs || docs.length === 0) {
		return (
			<EmptyState
				icon={FileText}
				title="No business documents"
				description="Import PDF or Excel formats to create dynamic templates for field operations."
				action={{ label: "Import Document", href: "/business-documents/import" }}
			/>
		);
	}

	return (
		<section aria-labelledby="bd-title" className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<h1 id="bd-title" className="text-2xl font-bold">
					Business Documents
				</h1>
				<Button asChild>
					<Link href="/documents/templates/new">Import Document</Link>
				</Button>
			</div>

			<div className="flex flex-wrap gap-2">
				<button
					type="button"
					onClick={() => setFilter(undefined)}
					className={`rounded-full px-3 py-1 text-sm transition-colors ${
						!filter ? "bg-brand text-on-dark" : "bg-surface text-ink hover:bg-hairline"
					}`}
				>
					All
				</button>
				{["work_planning", "cctv_maintenance", "lifeline_inspection", "sgsst_induction"].map(
					(type) => (
						<button
							key={type}
							type="button"
							onClick={() => setFilter(type)}
							className={`rounded-full px-3 py-1 text-sm transition-colors ${
								filter === type ? "bg-brand text-on-dark" : "bg-surface text-ink hover:bg-hairline"
							}`}
						>
							{getDocumentTypeLabel(type)}
						</button>
					),
				)}
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{docs.map((doc) => (
					<Link
						key={doc._id}
						href={`/business-documents/${doc._id}`}
						className="group rounded-xl border border-hairline bg-surface p-5 shadow-card transition-shadow hover:shadow-lg"
					>
						<div className="flex items-start justify-between">
							<FileText className="size-8 text-brand" />
							<span className="rounded-full bg-hairline px-2 py-0.5 text-xs font-medium uppercase">
								{doc.formatType}
							</span>
						</div>
						<h3 className="mt-3 font-semibold text-ink group-hover:text-brand">
							{getDocumentTypeLabel(doc.documentType)}
						</h3>
						<p className="mt-1 text-sm text-secondary line-clamp-2">{doc.metadata.title}</p>
						<div className="mt-3 flex items-center gap-2">
							<span className="text-xs text-tertiary">v{doc.version}</span>
							{doc.metadata.regulatoryBody && (
								<span className="rounded bg-tag px-1.5 py-0.5 text-xs text-on-dark">
									{doc.metadata.regulatoryBody}
								</span>
							)}
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
