import { FileText } from "lucide-react";

interface Attachment {
	id?: string;
	originalName: string;
	purpose: string;
	fileSize: number;
	url?: string;
}

interface KitAttachmentsSectionProps {
	attachments: Attachment[];
}

export function KitAttachmentsSection({ attachments }: KitAttachmentsSectionProps) {
	if (attachments.length === 0) {
		return null;
	}

	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5">
			<h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
				<FileText className="size-5" />
				Documentos adjuntos ({attachments.length})
			</h2>
			<div className="mt-4 space-y-2">
				{attachments.map((att) => (
					<article
						key={att.id ?? att.originalName}
						className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-4 py-3"
					>
						<div className="min-w-0 flex-1">
							<p className="font-medium text-[var(--text-primary)]">{att.originalName}</p>
							<p className="text-xs text-[var(--text-tertiary)]">
								{att.purpose} · {(att.fileSize / 1024).toFixed(1)} KB
							</p>
						</div>
						{att.url ? (
							<a
								href={att.url}
								target="_blank"
								rel="noopener noreferrer"
								className="rounded-[var(--radius-full)] bg-[var(--color-brand)] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--color-brand-hover)]"
							>
								Ver
							</a>
						) : null}
					</article>
				))}
			</div>
		</section>
	);
}
