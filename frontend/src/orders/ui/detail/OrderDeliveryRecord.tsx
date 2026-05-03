"use client";

import { FileSignature, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateDeliveryRecord } from "@/orders/queries";

interface OrderDeliveryRecordProps {
	orderId: string;
	disabled?: boolean;
}

export function OrderDeliveryRecord({ orderId, disabled = false }: OrderDeliveryRecordProps) {
	const createDeliveryRecord = useCreateDeliveryRecord(orderId);
	const [title, setTitle] = useState("Acta de entrega");
	const [fileUrl, setFileUrl] = useState("");
	const [signed, setSigned] = useState(true);

	const submit = async () => {
		try {
			await createDeliveryRecord.mutateAsync({
				title,
				fileUrl: fileUrl.trim() || undefined,
				signed,
			});
			toast.success("Acta de entrega registrada");
			setFileUrl("");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo registrar el acta");
		}
	};

	return (
		<section className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
			<header className="flex items-center gap-2">
				<FileSignature className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
				<h2 className="text-base font-semibold text-slate-900 dark:text-white">Acta de entrega</h2>
			</header>
			<div className="grid gap-3 sm:grid-cols-2">
				<label htmlFor="delivery-record-title" className="space-y-1">
					<span className="text-sm font-medium text-slate-700 dark:text-slate-300">Título</span>
					<input
						id="delivery-record-title"
						name="title"
						type="text"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
					/>
				</label>
				<label htmlFor="delivery-record-fileUrl" className="space-y-1">
					<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
						URL del archivo
					</span>
					<input
						id="delivery-record-fileUrl"
						name="fileUrl"
						type="url"
						value={fileUrl}
						onChange={(event) => setFileUrl(event.target.value)}
						placeholder="https://..."
						className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
					/>
				</label>
			</div>
			<label
				htmlFor="delivery-record-signed"
				className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
			>
				<input
					id="delivery-record-signed"
					name="signed"
					type="checkbox"
					checked={signed}
					onChange={(event) => setSigned(event.target.checked)}
					className="h-4 w-4 rounded border-slate-300"
				/>
				Acta firmada digitalmente
			</label>
			<button
				type="button"
				onClick={() => void submit()}
				disabled={disabled || createDeliveryRecord.isPending || !title.trim()}
				className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{createDeliveryRecord.isPending ? (
					<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
				) : (
					<FileSignature className="h-4 w-4" aria-hidden="true" />
				)}
				Registrar acta
			</button>
		</section>
	);
}
