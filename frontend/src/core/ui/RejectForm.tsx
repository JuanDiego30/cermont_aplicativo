"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface RejectFormProps {
	title?: string;
	onReject: (reason: string) => void;
	pending: boolean;
	minChars?: number;
	className?: string;
}

export function RejectForm({
	title = "Rechazar",
	onReject,
	pending,
	minChars = 10,
	className,
}: RejectFormProps) {
	const [reason, setReason] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (reason.trim().length < minChars) {
			return;
		}
		onReject(reason.trim());
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={cn("space-y-3 rounded-xl border border-danger/30 bg-danger/5 p-4", className)}
		>
			<h3 className="text-sm font-semibold text-danger">{title}</h3>
			<div className="space-y-1.5">
				<label htmlFor="reject-reason" className="block text-sm text-(--text-secondary)">
					Motivo de rechazo * (m&iacute;nimo {minChars} caracteres)
				</label>
				<textarea
					id="reject-reason"
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					placeholder="Explique el motivo del rechazo…"
					required
					className="min-h-20 w-full rounded-lg border border-border-strong bg-surface-primary p-2 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-danger focus:outline-none focus:ring-2 focus:ring-danger/20 disabled:cursor-not-allowed disabled:bg-surface-secondary"
					disabled={pending}
				/>
			</div>
			<div className="flex justify-end gap-3">
				<Button
					type="submit"
					variant="destructive"
					size="sm"
					disabled={pending || reason.trim().length < minChars}
					loading={pending}
				>
					Confirmar rechazo
				</Button>
			</div>
		</form>
	);
}
