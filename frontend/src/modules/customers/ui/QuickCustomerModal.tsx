"use client";

import type { CreateClient } from "@cermont/shared-types";
import { Loader2, X } from "lucide-react";
import { useCallback, useImperativeHandle, useRef, useState } from "react";
import type React from "react";
import { toast } from "sonner";
import { useCreateCustomer } from "@/modules/customers/queries";
import type { CustomerResult } from "./CustomerCombobox";

export interface QuickCustomerModalHandle {
	open: () => void;
	close: () => void;
}

export interface QuickCustomerModalProps {
	ref?: React.Ref<QuickCustomerModalHandle>;
	onCustomerCreated: (customer: CustomerResult) => void;
}

interface QuickCustomerForm {
	legalName: string;
	nit: string;
	contactName: string;
	email: string;
	phone: string;
	city: string;
}

const INITIAL_FORM: QuickCustomerForm = {
	legalName: "",
	nit: "",
	contactName: "",
	email: "",
	phone: "",
	city: "",
};

export function QuickCustomerModal({ ref, onCustomerCreated }: QuickCustomerModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const createMutation = useCreateCustomer();
	const [form, setForm] = useState<QuickCustomerForm>(INITIAL_FORM);
	const [submitError, setSubmitError] = useState("");

	useImperativeHandle(ref, () => ({
		open: () => {
			dialogRef.current?.showModal();
		},
		close: () => {
			dialogRef.current?.close();
		},
	}));

	const handleClose = useCallback(() => {
		dialogRef.current?.close();
	}, []);

	function updateField<K extends keyof QuickCustomerForm>(key: K, value: QuickCustomerForm[K]) {
		setForm((prev) => ({ ...prev, [key]: value }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitError("");

		if (!form.legalName.trim() || !form.nit.trim()) {
			setSubmitError("Razón social y NIT son obligatorios");
			return;
		}
		if (!form.contactName.trim()) {
			setSubmitError("Debe especificar al menos un contacto principal");
			return;
		}
		if (!form.email.trim() && !form.phone.trim()) {
			setSubmitError("Debe especificar al menos correo o teléfono");
			return;
		}

		const input: CreateClient = {
			name: form.legalName.trim(),
			nit: form.nit.trim(),
			contracts: [],
			contactName: form.contactName.trim(),
			email: form.email.trim() || undefined,
			phone: form.phone.trim() || undefined,
			city: form.city.trim() || undefined,

			status: "active",
		};

		createMutation.mutate(input, {
			onSuccess: (created) => {
				toast.success(`Cliente ${created.name} creado`);
				onCustomerCreated({
					_id: created._id ?? "",
					name: created.name,
					nit: created.nit,
					city: created.city,
					status: created.status ?? "active",
				});
				setForm(INITIAL_FORM);
				dialogRef.current?.close();
			},
			onError: (err) => {
				setSubmitError(err instanceof Error ? err.message : "Error al crear cliente");
			},
		});
	}

	return (
		<dialog
			ref={dialogRef}
			aria-label="Crear cliente nuevo"
			className="w-full max-w-lg rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-xl backdrop:bg-black/40 open:flex open:flex-col"
		>
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-[var(--text-primary)]">
					Crear cliente nuevo
				</h2>
				<button
					type="button"
					onClick={handleClose}
					aria-label="Cerrar"
					className="flex size-8 items-center justify-center rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
				>
					<X className="size-5" />
				</button>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="qc-legalName" className="text-sm font-medium text-[var(--text-primary)]">
						Razón social <span className="text-[var(--color-danger)]">*</span>
					</label>
					<input
						id="qc-legalName"
						type="text"
						value={form.legalName}
						onChange={(e) => updateField("legalName", e.target.value)}
						required
						className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
					/>
				</div>
				<div>
					<label htmlFor="qc-nit" className="text-sm font-medium text-[var(--text-primary)]">
						NIT <span className="text-[var(--color-danger)]">*</span>
					</label>
					<input
						id="qc-nit"
						type="text"
						value={form.nit}
						onChange={(e) => updateField("nit", e.target.value)}
						required
						placeholder="Ej: 860002523-1"
						className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
					/>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label htmlFor="qc-contactName" className="text-sm font-medium text-[var(--text-primary)]">
							Contacto principal <span className="text-[var(--color-danger)]">*</span>
						</label>
						<input
							id="qc-contactName"
							type="text"
							value={form.contactName}
							onChange={(e) => updateField("contactName", e.target.value)}
							required
							className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
						/>
					</div>
					<div>
						<label htmlFor="qc-city" className="text-sm font-medium text-[var(--text-primary)]">Ciudad</label>
						<input
							id="qc-city"
							type="text"
							value={form.city}
							onChange={(e) => updateField("city", e.target.value)}
							className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
						/>
					</div>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label htmlFor="qc-email" className="text-sm font-medium text-[var(--text-primary)]">Correo</label>
						<input
							id="qc-email"
							type="email"
							value={form.email}
							onChange={(e) => updateField("email", e.target.value)}
							className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
						/>
					</div>
					<div>
						<label htmlFor="qc-phone" className="text-sm font-medium text-[var(--text-primary)]">Teléfono</label>
						<input
							id="qc-phone"
							type="text"
							value={form.phone}
							onChange={(e) => updateField("phone", e.target.value)}
							className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
						/>
					</div>
				</div>

				{submitError && (
					<p className="text-sm text-[var(--color-danger)]">{submitError}</p>
				)}

				<div className="flex justify-end gap-3 pt-2">
					<button
						type="button"
						onClick={handleClose}
						className="h-10 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={createMutation.isPending}
						className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--color-brand)] px-5 text-sm font-medium text-white disabled:opacity-50"
					>
						{createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
						{createMutation.isPending ? "Creando..." : "Crear cliente"}
					</button>
				</div>
			</form>
		</dialog>
	);
}
