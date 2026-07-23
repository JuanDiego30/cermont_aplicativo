"use client";

import type { CreateAssetInput } from "@cermont/shared-types";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import { apiClient } from "@/lib/http/api-client";

const INPUT_CLASS =
	"h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]";
const LABEL_CLASS = "block text-sm font-medium text-[var(--text-secondary)] mb-1";

export default function NewAssetPage() {
	const { push } = useRouter();
	const [code, setCode] = useState("");
	const [name, setName] = useState("");
	const [type, setType] = useState("equipment");
	const [status, setStatus] = useState("available");
	const [serial, setSerial] = useState("");
	const [model, setModel] = useState("");
	const [brand, setBrand] = useState("");
	const [purchaseDate, setPurchaseDate] = useState("");
	const [description, setDescription] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!code.trim() || !name.trim()) {
			setError("Código y nombre son obligatorios.");
			return;
		}
		setSaving(true);
		setError("");
		try {
			const payload: CreateAssetInput = {
				code: code.trim(),
				name: name.trim(),
				type: type as CreateAssetInput["type"],
				status: status as CreateAssetInput["status"],
				...(serial.trim() ? { serialNumber: serial.trim() } : {}),
				...(model.trim() ? { model: model.trim() } : {}),
				...(brand.trim() ? { brand: brand.trim() } : {}),
				...(description.trim() ? { description: description.trim() } : {}),
				purchaseDate: purchaseDate.trim() ? new Date(purchaseDate).toISOString() : undefined,
			};
			const response = await apiClient.post<{ success: boolean; data: { _id: string } }>(
				"/assets",
				payload,
			);
			toast.success("Activo creado correctamente");
			push(`/assets/${response.data._id}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "No se pudo crear el activo.");
		} finally {
			setSaving(false);
		}
	}

	return (
		<section className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
			<Link
				href="/assets"
				className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
			>
				<ArrowLeft className="size-4" /> Volver a activos
			</Link>
			<header>
				<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Nuevo activo</h1>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					Registra un equipo, herramienta o instalación en el inventario de activos.
				</p>
			</header>
			<form
				onSubmit={handleSubmit}
				className="space-y-6 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-2)]"
			>
				<div className="grid gap-4 md:grid-cols-2">
					<div>
						<label htmlFor="code" className={LABEL_CLASS}>
							Código *
						</label>
						<input
							id="code"
							value={code}
							onChange={(e) => setCode(e.target.value)}
							className={INPUT_CLASS}
							placeholder="ACT-001"
							required
						/>
					</div>
					<div>
						<label htmlFor="type" className={LABEL_CLASS}>
							Tipo *
						</label>
						<select
							id="type"
							value={type}
							onChange={(e) => setType(e.target.value)}
							className={INPUT_CLASS}
						>
							<option value="tool">Herramienta</option>
							<option value="equipment">Equipo</option>
							<option value="vehicle">Vehículo</option>
							<option value="device">Dispositivo</option>
							<option value="infrastructure">Infraestructura</option>
							<option value="other">Otro</option>
						</select>
					</div>
					<div>
						<label htmlFor="name" className={LABEL_CLASS}>
							Nombre *
						</label>
						<input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className={INPUT_CLASS}
							placeholder="Nombre del activo"
							required
						/>
					</div>
					<div>
						<label htmlFor="status" className={LABEL_CLASS}>
							Estado
						</label>
						<select
							id="status"
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className={INPUT_CLASS}
						>
							<option value="available">Disponible</option>
							<option value="in_use">En uso</option>
							<option value="maintenance">Mantenimiento</option>
							<option value="damaged">Dañado</option>
							<option value="retired">Retirado</option>
							<option value="lost">Perdido</option>
						</select>
					</div>
					<div>
						<label htmlFor="serial" className={LABEL_CLASS}>
							N° Serial
						</label>
						<input
							id="serial"
							value={serial}
							onChange={(e) => setSerial(e.target.value)}
							className={INPUT_CLASS}
							placeholder="SN-001"
						/>
					</div>
					<div>
						<label htmlFor="model" className={LABEL_CLASS}>
							Modelo
						</label>
						<input
							id="model"
							value={model}
							onChange={(e) => setModel(e.target.value)}
							className={INPUT_CLASS}
							placeholder="Modelo"
						/>
					</div>
					<div>
						<label htmlFor="brand" className={LABEL_CLASS}>
							Marca
						</label>
						<input
							id="brand"
							value={brand}
							onChange={(e) => setBrand(e.target.value)}
							className={INPUT_CLASS}
							placeholder="Marca"
						/>
					</div>
					<div>
						<label htmlFor="purchaseDate" className={LABEL_CLASS}>
							Fecha de compra
						</label>
						<input
							id="purchaseDate"
							type="date"
							value={purchaseDate}
							onChange={(e) => setPurchaseDate(e.target.value)}
							className={INPUT_CLASS}
						/>
					</div>
					<div className="md:col-span-2">
						<label htmlFor="description" className={LABEL_CLASS}>
							Descripción
						</label>
						<textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							className={`${INPUT_CLASS} h-auto min-h-[80px] py-2`}
							placeholder="Descripción opcional del activo…"
						/>
					</div>
				</div>
				{error ? (
					<p className="text-sm text-[var(--color-danger)]" role="alert">
						{error}
					</p>
				) : null}
				<div className="flex justify-end gap-3">
					<Link
						href="/assets"
						className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
					>
						Cancelar
					</Link>
					<Button type="submit" loading={saving}>
						{saving ? <span /> : <Save className="size-4" />}Crear activo
					</Button>
				</div>
			</form>
		</section>
	);
}
