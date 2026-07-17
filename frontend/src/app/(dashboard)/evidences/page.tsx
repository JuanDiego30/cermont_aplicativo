"use client";

import type { Evidence } from "@cermont/shared-types";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	Camera,
	Image as ImageIcon,
	LayoutGrid,
	Loader2,
	Rows3,
	Search,
	Upload,
	X,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { EVIDENCE_KEYS } from "@/modules/evidences/keys";
import {
	type FormEvent,
	type ReactNode,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import { SyncBanner } from "@/components/common/SyncBanner";
import { Button } from "@/core/ui/Button";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { readSearchParam } from "@/lib/utils/search-params";
import { useOfflineEvidence } from "@/modules/evidences/hooks/useOfflineEvidence";
import { listEvidences } from "@/modules/evidences/queries";
import { useOrders } from "@/modules/orders/queries";
import { EvidenceCard } from "./EvidenceCard";
import { EvidenceTableRow } from "./EvidenceTableRow";
import { type EvidenceViewMode, getEvidenceTitle, toEvidenceViewMode } from "./evidence-helpers";

const FIELD_CLASS =
	"w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue)]/15";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// ── Evidence filter by text search ──────────────────────────────────────────

function evidenceMatchesSearch(evidence: Evidence, query: string): boolean {
	if (!query) {
		return true;
	}
	const haystack = [getEvidenceTitle(evidence), evidence.description ?? "", evidence.filename]
		.join(" ")
		.toLowerCase();
	return haystack.includes(query);
}

// ── Upload Section ──────────────────────────────────────────────────────────

interface EvidenceUploadSectionProps {
	selectedOrderId: string;
	orderOptions: Array<{ _id: string; code: string; assetName: string }>;
	isLoadingOrders: boolean;
	onUploadComplete: () => void;
}

function EvidenceUploadSection({
	selectedOrderId,
	orderOptions,
	isLoadingOrders,
	onUploadComplete,
}: EvidenceUploadSectionProps) {
	const uploadMutation = useOfflineEvidence();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const previewUrl = useMemo(
		() => (selectedFile ? URL.createObjectURL(selectedFile) : null),
		[selectedFile],
	);
	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);
	const [evidenceTitle, setEvidenceTitle] = useState("");
	const [evidenceDesc, setEvidenceDesc] = useState("");
	const [isUploading, setIsUploading] = useState(false);

	const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] ?? null;
		if (file) {
			if (file.size > MAX_FILE_SIZE) {
				toast.error("El archivo no debe superar 10MB");
				return;
			}
			if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
				toast.error("Formato no válido. Use JPG, PNG o WebP");
				return;
			}
			setSelectedFile(file);
		}
	}, []);

	const resetForm = useCallback(() => {
		setSelectedFile(null);
		setEvidenceTitle("");
		setEvidenceDesc("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	const handleUpload = useCallback(async () => {
		if (!selectedFile || !selectedOrderId) {
			return;
		}
		if (!evidenceTitle.trim()) {
			toast.error("Agrega un título que describa esta evidencia");
			return;
		}

		setIsUploading(true);
		try {
			// Combine title + description into the description field for storage
			const description = evidenceDesc.trim()
				? `${evidenceTitle.trim()} — ${evidenceDesc.trim()}`
				: evidenceTitle.trim();

			const result = await uploadMutation.mutateAsync({
				orderId: selectedOrderId,
				type: "during",
				description,
				capturedAt: new Date().toISOString(),
				file: selectedFile,
			});

			if (result) {
				toast.success("Evidencia subida correctamente");
			} else {
				toast.info("Evidencia guardada para sincronizar cuando haya conexión");
			}

			resetForm();
			onUploadComplete();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Error al subir la evidencia");
		} finally {
			setIsUploading(false);
		}
	}, [
		selectedFile,
		selectedOrderId,
		evidenceTitle,
		evidenceDesc,
		uploadMutation,
		resetForm,
		onUploadComplete,
	]);

	const canUpload = !!selectedOrderId && !!selectedFile && !!evidenceTitle.trim() && !isUploading;

	return (
		<section
			aria-label="Subir evidencia del trabajo realizado"
			className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-2)] sm:p-6"
		>
			<div className="mb-4 flex items-center gap-2">
				<Camera className="size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
				<h2 className="text-base font-semibold text-[var(--text-primary)]">
					Evidencia del trabajo realizado
				</h2>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				{/* Order selector */}
				<div>
					<label
						htmlFor="ev-order"
						className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
					>
						Orden de trabajo
					</label>
					<select
						id="ev-order"
						value={selectedOrderId}
						onChange={() => {}}
						disabled
						className={FIELD_CLASS}
					>
						<option value="">
							{isLoadingOrders ? "Cargando órdenes…" : "Selecciona una orden"}
						</option>
						{orderOptions.map((order) => (
							<option key={order._id} value={order._id}>
								{order.code} · {order.assetName}
							</option>
						))}
					</select>
					<p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
						Selecciona la orden desde los filtros de arriba
					</p>
				</div>

				{/* Title */}
				<div>
					<label
						htmlFor="ev-title"
						className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
					>
						Título <span className="text-[var(--color-danger)]">*</span>
					</label>
					<input
						id="ev-title"
						type="text"
						value={evidenceTitle}
						onChange={(e) => setEvidenceTitle(e.target.value)}
						placeholder="¿Qué muestra esta evidencia?"
						maxLength={200}
						className={FIELD_CLASS}
					/>
				</div>
			</div>

			{/* Description */}
			<div className="mt-3">
				<label
					htmlFor="ev-desc"
					className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
				>
					Descripción adicional
				</label>
				<textarea
					id="ev-desc"
					value={evidenceDesc}
					onChange={(e) => setEvidenceDesc(e.target.value)}
					placeholder="Detalles de lo que se trabajó, hallazgos, observaciones…"
					maxLength={500}
					rows={2}
					className={FIELD_CLASS}
				/>
			</div>

			{/* File upload */}
			<div className="mt-3">
				<label
					htmlFor="ev-file-upload"
					className={`relative block cursor-pointer rounded-[var(--radius-lg)] border-2 border-dashed p-5 text-center transition-colors sm:p-6 ${
						previewUrl
							? "border-[var(--color-brand-blue)]/30"
							: "border-[var(--border-subtle)] hover:border-[var(--color-brand-blue)]/50"
					}`}
				>
					<input
						ref={fileInputRef}
						id="ev-file-upload"
						type="file"
						accept="image/jpeg,image/jpg,image/png,image/webp"
						className="hidden"
						onChange={handleFileChange}
					/>

					{previewUrl ? (
						<div className="space-y-3">
							<div className="relative mx-auto h-40 w-full max-w-sm overflow-hidden rounded-[var(--radius-lg)]">
								<Image
									src={previewUrl}
									alt="Vista previa"
									fill
									unoptimized
									className="object-cover"
									sizes="(max-width: 640px) 100vw, 384px"
								/>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										resetForm();
									}}
									className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
									aria-label="Quitar imagen"
								>
									<X className="size-4" />
								</button>
							</div>
							<p className="text-xs text-[var(--text-tertiary)]">
								{selectedFile?.name} (
								{selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(1) : "0"} MB)
							</p>
							<p className="text-xs text-[var(--text-tertiary)]">Haz clic para cambiar la imagen</p>
						</div>
					) : (
						<div>
							<ImageIcon
								className="mx-auto mb-2 size-10 text-[var(--text-tertiary)]"
								aria-hidden="true"
							/>
							<p className="text-sm font-medium text-[var(--text-primary)]">
								Arrastra una imagen o haz clic para seleccionar
							</p>
							<p className="mt-1 text-xs text-[var(--text-tertiary)]">JPG, PNG, WebP — Máx 10MB</p>
						</div>
					)}
				</label>
			</div>

			{/* Upload button */}
			<button
				type="button"
				disabled={!canUpload}
				onClick={handleUpload}
				className="mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-brand)] transition-colors hover:bg-[var(--color-brand-blue-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
			>
				{isUploading ? (
					<Loader2 className="size-4 animate-spin" aria-hidden="true" />
				) : (
					<Upload className="size-4" aria-hidden="true" />
				)}
				{isUploading ? "Subiendo…" : "Subir evidencia"}
			</button>
		</section>
	);
}

// ── Filters Form ────────────────────────────────────────────────────────────

interface EvidencesFiltersFormProps {
	searchInput: string;
	selectedOrderId: string;
	isLoadingOrders: boolean;
	orderOptions: Array<{ _id: string; code: string; assetName: string }>;
	onSearchInputChange: (value: string) => void;
	onOrderIdChange: (value: string) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onClear: () => void;
}

function EvidencesFiltersForm({
	searchInput,
	selectedOrderId,
	isLoadingOrders,
	orderOptions,
	onSearchInputChange,
	onOrderIdChange,
	onSubmit,
	onClear,
}: EvidencesFiltersFormProps) {
	return (
		<form
			onSubmit={onSubmit}
			className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-2)]"
			aria-labelledby="evidences-filters-title"
		>
			<h2 id="evidences-filters-title" className="sr-only">
				Filtros de evidencias
			</h2>

			<div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr_auto]">
				<div>
					<label
						htmlFor="evidence-order"
						className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
					>
						Orden
					</label>
					<select
						id="evidence-order"
						value={selectedOrderId}
						onChange={(event) => onOrderIdChange(event.target.value)}
						className={FIELD_CLASS}
					>
						<option value="">Selecciona una orden</option>
						{isLoadingOrders ? <option value="">Cargando órdenes…</option> : null}
						{orderOptions.map((order) => (
							<option key={order._id} value={order._id}>
								{order.code} · {order.assetName}
							</option>
						))}
					</select>
				</div>

				<div className="relative">
					<label
						htmlFor="evidence-search"
						className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
					>
						Buscar
					</label>
					<Search
						aria-hidden="true"
						className="pointer-events-none absolute left-3 top-[2.6rem] size-4 text-[var(--text-tertiary)]"
					/>
					<input
						id="evidence-search"
						value={searchInput}
						onChange={(event) => onSearchInputChange(event.target.value)}
						placeholder="Título o descripción"
						className={FIELD_CLASS}
					/>
				</div>

				<div className="flex items-end gap-2">
					<button
						type="submit"
						className="inline-flex items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-brand)] transition-colors hover:bg-[var(--color-brand-blue-hover)]"
					>
						Aplicar filtros
					</button>
					<button
						type="button"
						onClick={onClear}
						className="inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)]"
					>
						Limpiar
					</button>
				</div>
			</div>
		</form>
	);
}

// ── View Toggle ─────────────────────────────────────────────────────────────

interface EvidencesViewToggleProps {
	viewMode: EvidenceViewMode;
	onChange: (mode: EvidenceViewMode) => void;
}

function EvidencesViewToggle({ viewMode, onChange }: EvidencesViewToggleProps) {
	return (
		<fieldset
			className="inline-flex rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-1 shadow-[var(--shadow-1)]"
			aria-label="Modo de visualización"
		>
			<legend className="sr-only">Modo de visualización</legend>
			<button
				type="button"
				onClick={() => onChange("gallery")}
				aria-pressed={viewMode === "gallery"}
				className={`inline-flex items-center gap-2 rounded-[calc(var(--radius-lg)-4px)] px-3 py-2 text-sm font-medium transition-colors ${
					viewMode === "gallery"
						? "bg-[var(--color-brand-blue)] text-white shadow-[var(--shadow-brand)]"
						: "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
				}`}
			>
				<LayoutGrid aria-hidden="true" className="size-4" />
				Galería
			</button>
			<button
				type="button"
				onClick={() => onChange("table")}
				aria-pressed={viewMode === "table"}
				className={`inline-flex items-center gap-2 rounded-[calc(var(--radius-lg)-4px)] px-3 py-2 text-sm font-medium transition-colors ${
					viewMode === "table"
						? "bg-[var(--color-brand-blue)] text-white shadow-[var(--shadow-brand)]"
						: "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
				}`}
			>
				<Rows3 aria-hidden="true" className="size-4" />
				Tabla
			</button>
		</fieldset>
	);
}

// ── Empty State ─────────────────────────────────────────────────────────────

function EvidencesEmptyState({
	icon,
	title,
	description,
}: {
	icon: ReactNode;
	title: string;
	description: string;
}) {
	return (
		<section className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-secondary)]/40 p-10 text-center">
			{icon}
			<h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
			<p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
		</section>
	);
}

// ── Table View ──────────────────────────────────────────────────────────────

function EvidencesTableView({ evidences }: { evidences: Evidence[] }) {
	if (evidences.length === 0) {
		return (
			<EvidencesEmptyState
				icon={<Camera aria-hidden="true" className="mx-auto size-10 text-[var(--text-tertiary)]" />}
				title="No hay evidencias para mostrar"
				description="Selecciona una orden y sube imágenes del trabajo realizado."
			/>
		);
	}

	return (
		<>
			<div className="space-y-3 md:hidden">
				{evidences.map((evidence) => (
					<EvidenceCard key={evidence._id} evidence={evidence} />
				))}
			</div>

			<section className="hidden overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] md:block">
				<table className="min-w-full text-left text-sm">
					<caption className="sr-only">Evidencias registradas con título y fecha.</caption>
					<thead className="bg-[var(--surface-secondary)]/60 text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
						<tr>
							<th scope="col" className="px-4 py-3 font-semibold min-w-[200px]">
								Título
							</th>
							<th scope="col" className="px-4 py-3 font-semibold">
								Orden
							</th>
							<th scope="col" className="px-4 py-3 font-semibold">
								Fecha
							</th>
							<th scope="col" className="px-4 py-3 font-semibold">
								Acciones
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[var(--border-subtle)]/60 bg-[var(--surface-primary)]">
						{evidences.map((evidence) => (
							<EvidenceTableRow key={evidence._id} evidence={evidence} />
						))}
					</tbody>
				</table>
			</section>
		</>
	);
}

// ── Gallery View ────────────────────────────────────────────────────────────

function EvidencesGalleryView({ evidences }: { evidences: Evidence[] }) {
	if (evidences.length === 0) {
		return (
			<EvidencesEmptyState
				icon={<Camera aria-hidden="true" className="mx-auto size-10 text-[var(--text-tertiary)]" />}
				title="No hay evidencias para este filtro"
				description="Sube imágenes del trabajo realizado desde el formulario de arriba."
			/>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
			{evidences.map((evidence) => (
				<EvidenceCard key={evidence._id} evidence={evidence} />
			))}
		</div>
	);
}

// ── Filters Hook ────────────────────────────────────────────────────────────

function useEvidenceFilters() {
	const searchParams = useSearchParams();
	const { replace } = useRouter();
	const getSearchParam = (key: string) => readSearchParam(searchParams, key);

	const initialSearch = getSearchParam("q") ?? "";
	const initialOrderId = getSearchParam("orderId") ?? "";
	const initialViewMode = toEvidenceViewMode(getSearchParam("view") ?? undefined);

	const [searchInput, setSearchInput] = useState(initialSearch);
	const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);
	const [viewMode, setViewMode] = useState<EvidenceViewMode>(initialViewMode);

	const { data: ordersResult, isLoading: isLoadingOrders } = useOrders({ limit: 100 });

	return {
		replace,
		searchParams,
		searchInput,
		setSearchInput,
		selectedOrderId,
		setSelectedOrderId,
		viewMode,
		setViewMode,
		ordersResult,
		isLoadingOrders,
	};
}

// ── Loading State ───────────────────────────────────────────────────────────

function EvidencesLoading() {
	return (
		<section className="space-y-6" aria-labelledby="evidences-page-title">
			<div className="flex h-40 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
				<Loader2 className="size-5 animate-spin text-[var(--text-tertiary)]" aria-hidden="true" />
			</div>
		</section>
	);
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function EvidencesPage() {
	return (
		<Suspense fallback={<EvidencesLoading />}>
			<EvidencesPageInner />
		</Suspense>
	);
}

function EvidencesPageInner() {
	const isOnline = useOnlineStatus();
	const {
		replace,
		searchParams,
		searchInput,
		setSearchInput,
		selectedOrderId,
		setSelectedOrderId,
		viewMode,
		setViewMode,
		ordersResult,
		isLoadingOrders,
	} = useEvidenceFilters();
	const orderOptions = ordersResult?.items ?? [];
	const selectedOrder = orderOptions.find((order) => order._id === selectedOrderId);
	const queryClient = useQueryClient();

	const {
		data: evidences = [],
		isLoading: isLoadingEvidences,
		error,
	} = useQuery({
		queryKey: EVIDENCE_KEYS.byOrder(selectedOrderId),
		queryFn: () => listEvidences(selectedOrderId),
		enabled: !!selectedOrderId,
		staleTime: STALE_TIMES.LIST,
		placeholderData: keepPreviousData,
	});

	const filteredEvidences = useMemo(() => {
		const query = searchInput.trim().toLowerCase();
		return evidences.filter((evidence) => evidenceMatchesSearch(evidence, query));
	}, [evidences, searchInput]);

	const handleUploadComplete = useCallback(() => {
		if (selectedOrderId) {
			queryClient.invalidateQueries({ queryKey: EVIDENCE_KEYS.byOrder(selectedOrderId) });
		}
	}, [queryClient, selectedOrderId]);

	const buildSearchParams = useCallback(
		(input: string, orderId: string, mode: EvidenceViewMode) => {
			const params = new URLSearchParams(searchParams.toString());
			if (input.trim()) {
				params.set("q", input.trim());
			} else {
				params.delete("q");
			}
			if (orderId) {
				params.set("orderId", orderId);
			} else {
				params.delete("orderId");
			}
			if (mode === "table") {
				params.set("view", "table");
			} else {
				params.delete("view");
			}
			return params.toString();
		},
		[searchParams],
	);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		replace(`/evidences?${buildSearchParams(searchInput, selectedOrderId, viewMode)}`);
	};

	const handleViewModeChange = (mode: EvidenceViewMode) => {
		setViewMode(mode);
		replace(`/evidences?${buildSearchParams(searchInput, selectedOrderId, mode)}`);
	};

	const clearFilters = () => {
		setSearchInput("");
		setSelectedOrderId("");
		setViewMode("gallery");
		replace("/evidences");
	};

	return (
		<>
			<SyncBanner isOnline={isOnline} />
			<section className="space-y-6" aria-labelledby="evidences-page-title">
				{/* Header */}
				<header className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
					<div className="border-b border-[var(--border-subtle)] bg-[linear-gradient(135deg,rgba(58,120,216,0.12),rgba(15,23,41,0.02),transparent)] p-5 sm:px-6">
						<p className="text-sm text-[var(--text-secondary)]">Dashboard / Evidencias</p>
						<div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div className="space-y-1">
								<h1
									id="evidences-page-title"
									className="text-2xl font-semibold text-[var(--text-primary)]"
								>
									Evidencias del trabajo
								</h1>
								<p className="max-w-2xl text-sm text-[var(--text-secondary)]">
									Sube imágenes como evidencia del trabajo realizado en cada orden. Cada imagen debe
									tener un título descriptivo.
								</p>
							</div>
							{selectedOrder ? (
								<Button asChild variant="outline" size="sm">
									<a href={`/orders/${selectedOrder._id}`}>Abrir orden</a>
								</Button>
							) : null}
						</div>
					</div>
				</header>

				{/* Filters */}
				<EvidencesFiltersForm
					searchInput={searchInput}
					selectedOrderId={selectedOrderId}
					isLoadingOrders={isLoadingOrders}
					orderOptions={orderOptions}
					onSearchInputChange={setSearchInput}
					onOrderIdChange={setSelectedOrderId}
					onSubmit={handleSubmit}
					onClear={clearFilters}
				/>

				{/* Upload section — only visible when an order is selected */}
				{selectedOrderId ? (
					<EvidenceUploadSection
						selectedOrderId={selectedOrderId}
						orderOptions={orderOptions}
						isLoadingOrders={isLoadingOrders}
						onUploadComplete={handleUploadComplete}
					/>
				) : null}

				{/* Evidence gallery */}
				{!selectedOrderId ? (
					<EvidencesEmptyState
						icon={
							<Camera aria-hidden="true" className="mx-auto size-10 text-[var(--text-tertiary)]" />
						}
						title="Selecciona una orden"
						description="Selecciona una orden de trabajo para ver sus evidencias y subir nuevas imágenes."
					/>
				) : isLoadingEvidences ? (
					<section className="flex h-64 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)]">
						<div className="flex items-center gap-3 text-[var(--text-secondary)]">
							<Loader2 className="size-5 animate-spin" aria-hidden="true" />
							Cargando evidencias…
						</div>
					</section>
				) : error ? (
					<section className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] p-6 text-sm text-[var(--color-danger)]">
						<AlertCircle className="size-5 shrink-0" aria-hidden="true" />
						No se pudieron cargar las evidencias. {(error as Error).message}
					</section>
				) : (
					<section aria-labelledby="evidences-list-title" className="space-y-4">
						<div className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-2)] md:flex-row md:items-center md:justify-between">
							<div className="space-y-1">
								<h2
									id="evidences-list-title"
									className="text-base font-semibold text-[var(--text-primary)]"
								>
									{selectedOrder
										? `${selectedOrder.code} · ${selectedOrder.assetName}`
										: "Listado de evidencias"}
								</h2>
								<p className="text-sm text-[var(--text-secondary)]">
									{filteredEvidences.length} evidencia(s) registrada(s) para esta orden.
								</p>
							</div>

							<EvidencesViewToggle viewMode={viewMode} onChange={handleViewModeChange} />
						</div>

						{viewMode === "gallery" ? (
							<EvidencesGalleryView evidences={filteredEvidences} />
						) : (
							<EvidencesTableView evidences={filteredEvidences} />
						)}
					</section>
				)}
			</section>
		</>
	);
}
