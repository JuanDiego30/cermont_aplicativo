"use client";

import { Calendar, Download, FileCheck2, FileText } from "lucide-react";
import Link from "next/link";

export interface DocumentRecord {
	_id: string;
	title: string;
	file_url: string;
	file_size?: number;
	mime_type?: string;
	order_id?: string;
	signed?: boolean;
	signedBy?: string;
	signedAt?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface DocumentGalleryProps {
	documents: DocumentRecord[];
}

const formatSize = (bytes: number | null | undefined) => {
	if (!bytes) {
		return ",";
	}
	if (bytes < 1024) {
		return `${bytes} B`;
	}
	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr: string | null | undefined) => {
	if (!dateStr) {
		return ",";
	}
	try {
		return new Date(dateStr).toLocaleDateString("es-CO", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	} catch {
		return ",";
	}
};

export function DocumentGallery({ documents }: DocumentGalleryProps) {
	if (!documents || documents.length === 0) {
		return (
			<div className="flex min-h-40 items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700">
				<p className="text-sm text-zinc-400">Sin documentos</p>
			</div>
		);
	}

	return (
		<section aria-label="Galería de documentos">
			<ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{documents.map((doc) => (
					<li key={doc._id}>
						<article className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
							<div>
								<div className="flex items-start justify-between gap-3">
									<div className="flex min-w-0 items-start gap-3">
										<FileText
											className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400"
											aria-hidden="true"
										/>
										<div className="min-w-0 flex-1">
											<h3 className="truncate text-sm font-medium text-zinc-900 dark:text-white">
												{doc.title}
											</h3>
											<p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
												{doc.file_url}
											</p>
										</div>
									</div>
									{doc.signed ? (
										<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
											<FileCheck2 className="size-3" aria-hidden="true" />
											Firmado
										</span>
									) : null}
								</div>
								<div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
									{doc.mime_type ? (
										<span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
											{doc.mime_type}
										</span>
									) : null}
									{doc.file_size ? <span>{formatSize(doc.file_size)}</span> : null}
									{doc.order_id ? (
										<span className="font-mono text-[11px]">OT {doc.order_id}</span>
									) : null}
								</div>
							</div>
							<div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
								<span className="flex items-center gap-1 text-xs text-zinc-400">
									<Calendar className="size-3" aria-hidden="true" />
									{formatDate(doc.createdAt)}
								</span>
								{doc.order_id ? (
									<Link
										href={`/orders/${doc.order_id}`}
										className="text-xs font-medium text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
									>
										Ver orden
									</Link>
								) : null}
								{doc.file_url ? (
									<Link
										href={doc.file_url}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
									>
										<Download className="size-3" aria-hidden="true" />
										Descargar
									</Link>
								) : null}
							</div>
						</article>
					</li>
				))}
			</ul>
		</section>
	);
}
