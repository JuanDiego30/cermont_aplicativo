import { Check, Clock, FileText, X } from "lucide-react";

interface DocumentRequirement {
	name: string;
	step: number;
	status: "ready" | "pending" | "rejected";
	fileUrl?: string;
}

interface Props {
	documents: DocumentRequirement[];
}

const STATUS_ICONS: Record<string, typeof Check> = {
	ready: Check,
	pending: Clock,
	rejected: X,
};

const STATUS_STYLES: Record<string, string> = {
	ready: "text-[#4CAF50]",
	pending: "text-[#FFC107]",
	rejected: "text-[#F44336]",
};

export function DocumentRequirementsTable({ documents }: Props) {
	if (documents.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-[var(--text-secondary)]">
				Sin requisitos de documentos
			</p>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-left text-sm">
				<thead>
					<tr className="border-b border-[var(--border-subtle)]">
						<th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Documento</th>
						<th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Paso</th>
						<th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Estado</th>
						<th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Acción</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-[var(--border-subtle)]">
					{documents.map((doc) => {
						const Icon = STATUS_ICONS[doc.status] ?? Clock;
						const style = STATUS_STYLES[doc.status] ?? "";

						return (
							<tr key={`${doc.name}-${doc.step}`}>
								<td className="flex items-center gap-2 px-4 py-3">
									<FileText className="size-4 text-[var(--text-secondary)]" aria-hidden="true" />
									{doc.name}
								</td>
								<td className="px-4 py-3 text-[var(--text-secondary)]">Paso {doc.step}</td>
								<td className={`px-4 py-3 ${style}`}>
									<Icon className="size-4" aria-hidden="true" />
									<span className="sr-only">{doc.status}</span>
								</td>
								<td className="px-4 py-3">
									{doc.fileUrl ? (
										<a
											href={doc.fileUrl}
											className="text-xs font-medium text-[var(--color-brand-blue)] hover:underline"
											target="_blank"
											rel="noopener noreferrer"
										>
											Ver archivo
										</a>
									) : (
										<span className="text-xs text-[var(--text-tertiary)]">—</span>
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
