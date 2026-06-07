"use client";

import type { Evidence, EvidenceType } from "@cermont/shared-types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Camera, LayoutGrid, Loader2, Rows3, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, type ReactNode, Suspense, useMemo, useState } from "react";
import { SyncBanner } from "@/components/common/SyncBanner";
import { Button } from "@/core/ui/Button";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { readSearchParam } from "@/lib/utils/search-params";
import { listEvidences } from "@/modules/evidences/queries";
import { useOrders } from "@/modules/orders/queries";
import { EvidenceCard } from "./EvidenceCard";
import { EvidenceTableRow } from "./EvidenceTableRow";
import {
	EVIDENCE_LABELS,
	EVIDENCE_STAGE_ORDER,
	type EvidenceFilter,
	type EvidenceViewMode,
	getEvidenceLabel,
	groupEvidencesByStage,
	toEvidenceFilter,
	toEvidenceViewMode,
} from "./evidence-helpers";

const FIELD_CLASS =
	"w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/15";

const FILTER_OPTIONS: Array<{ value: EvidenceFilter; label: string }> = [
	{ value: "all", label: "Todas las etapas" },
	...EVIDENCE_STAGE_ORDER.map((value) => ({
		value,
		label: EVIDENCE_LABELS[value],
	})),
];

type EvidenceCounts = Record<"total" | EvidenceType, number>;

function buildCounts(items: Evidence[]): EvidenceCounts {
	const counts: EvidenceCounts = {
		total: 0,
		before: 0,
		during: 0,
		after: 0,
		defect: 0,
		safety: 0,
		signature: 0,
	};

	for (const evidence of items) {
		counts.total += 1;
		counts[evidence.type] += 1;
	}

	return counts;
}

function evidenceMatchesFilter(
	evidence: Evidence,
	selectedType: EvidenceFilter,
	query: string,
): boolean {
	if (selectedType !== "all" && evidence.type !== selectedType) {
		return false;
	}

	if (!query) {
		return true;
	}

	const haystack = [evidence.filename, evidence.description ?? "", evidence.orderId, evidence.type]
		.join(" ")
		.toLowerCase();

	return haystack.includes(query);
}

function buildEvidenceSearchParams(
	currentParams: URLSearchParams,
	searchInput: string,
	selectedOrderId: string,
	selectedType: EvidenceFilter,
	viewMode: EvidenceViewMode,
): string {
	const params = new URLSearchParams(currentParams.toString());
	const trimmedSearch = searchInput.trim();

	if (trimmedSearch) {
		params.set("q", trimmedSearch);
	} else {
		params.delete("q");
	}

	if (selectedOrderId) {
		params.set("orderId", selectedOrderId);
	} else {
		params.delete("orderId");
	}

	if (selectedType !== "all") {
		params.set("label", selectedType);
	} else {
		params.delete("label");
	}

	if (viewMode === "table") {
		params.set("view", "table");
	} else {
		params.delete("view");
	}

	return params.toString();
}

function useEvidenceFilters() {
	const searchParams = useSearchParams();
	const { replace } = useRouter();
	const getSearchParam = (key: string) => readSearchParam(searchParams, key);

	const initialSearch = getSearchParam("q") ?? "";
	const initialOrderId = getSearchParam("orderId") ?? "";
	const initialType = toEvidenceFilter(getSearchParam("label") ?? undefined);
	const initialViewMode = toEvidenceViewMode(getSearchParam("view") ?? undefined);

	const [searchInput, setSearchInput] = useState(initialSearch);
	const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);
	const [selectedType, setSelectedType] = useState<EvidenceFilter>(initialType);
	const [viewMode, setViewMode] = useState<EvidenceViewMode>(initialViewMode);

	const { data: ordersResult, isLoading: isLoadingOrders } = useOrders({ limit: 100 });

	return {
		replace,
		searchParams,
		searchInput,
		setSearchInput,
		selectedOrderId,
		setSelectedOrderId,
		selectedType,
		setSelectedType,
		viewMode,
		setViewMode,
		ordersResult,
		isLoadingOrders,
	};
}

export default function EvidencesPage() {
	return (
		<Suspense fallback={<EvidencesLoading />}>
			<EvidencesPageInner />
		</Suspense>
	);
}

function EvidencesLoading() {
	return (
		<section className="space-y-6" aria-labelledby="evidences-page-title">
			<div className="flex h-40 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
				<Loader2 className="size-5 animate-spin text-[var(--text-tertiary)]" aria-hidden="true" />
			</div>
		</section>
	);
}

interface EvidencesStatsSectionProps {
	counts: Record<string, number>;
}

function EvidencesStatsSection({ counts }: EvidencesStatsSectionProps) {
	return (
		<div className="p-5 sm:px-6">
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{[
					{ label: "Total", value: counts.total },
					{ label: getEvidenceLabel("before"), value: counts.before },
					{ label: getEvidenceLabel("during"), value: counts.during },
					{ label: getEvidenceLabel("after"), value: counts.after },
				].map((item) => (
					<article
						key={item.label}
						className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)]/50 p-4"
					>
						<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
							{item.label}
						</p>
						<p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{item.value}</p>
					</article>
				))}
			</div>
		</div>
	);
}

interface EvidencesFiltersFormProps {
	searchInput: string;
	selectedOrderId: string;
	selectedType: EvidenceFilter;
	isLoadingOrders: boolean;
	orderOptions: Array<{ _id: string; code: string; assetName: string }>;
	onSearchInputChange: (value: string) => void;
	onOrderIdChange: (value: string) => void;
	onTypeChange: (value: EvidenceFilter) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onClear: () => void;
}

function EvidencesFiltersForm({
	searchInput,
	selectedOrderId,
	selectedType,
	isLoadingOrders,
	orderOptions,
	onSearchInputChange,
	onOrderIdChange,
	onTypeChange,
	onSubmit,
	onClear,
}: EvidencesFiltersFormProps) {
	return (
		<form
			onSubmit={onSubmit}
			className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-2)]"
			aria-labelledby="evidences-filters-title"
		>
			<h2 id="evidences-filters-title" className="sr-only">
				Filtros de soportes
			</h2>

			<div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
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
						placeholder="Archivo, descripción o ID"
						className={FIELD_CLASS}
					/>
				</div>

				<div>
					<label
						htmlFor="evidence-type"
						className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
					>
						Etapa
					</label>
					<select
						id="evidence-type"
						value={selectedType}
						onChange={(event) => onTypeChange(event.target.value as EvidenceFilter)}
						className={FIELD_CLASS}
					>
						{FILTER_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
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
						className="inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)]"
					>
						Limpiar
					</button>
				</div>
			</div>
		</form>
	);
}

interface EvidencesViewToggleProps {
	viewMode: EvidenceViewMode;
	onChange: (mode: EvidenceViewMode) => void;
}

function EvidencesViewToggle({ viewMode, onChange }: EvidencesViewToggleProps) {
	return (
		<fieldset
			className="inline-flex rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-1 shadow-[var(--shadow-1)]"
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

interface EvidencesEmptyStateProps {
	icon: ReactNode;
	title: string;
	description: string;
}

function EvidencesEmptyState({ icon, title, description }: EvidencesEmptyStateProps) {
	return (
		<section className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)]/40 p-10 text-center">
			{icon}
			<h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
			<p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
		</section>
	);
}

interface EvidencesSummaryGridProps {
	counts: EvidenceCounts;
	selectedType: EvidenceFilter;
	onStageSelect: (value: EvidenceFilter) => void;
}

function EvidencesSummaryGrid({ counts, selectedType, onStageSelect }: EvidencesSummaryGridProps) {
	const summaryItems: Array<{
		label: string;
		value: number;
		filter: EvidenceFilter;
	}> = [
		{ filter: "all", label: "Total", value: counts.total },
		...EVIDENCE_STAGE_ORDER.map((type) => ({
			filter: type,
			label: getEvidenceLabel(type),
			value: counts[type],
		})),
	];

	return (
		<section aria-labelledby="evidences-summary-title">
			<div className="mb-3 flex items-center justify-between gap-3">
				<h2
					id="evidences-summary-title"
					className="text-sm font-semibold text-[var(--text-primary)]"
				>
					Cobertura por etapa
				</h2>
				<p className="text-xs text-[var(--text-tertiary)]">
					Use estas tarjetas para acotar la galería sin cambiar de pantalla.
				</p>
			</div>
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
				{summaryItems.map((item) => {
					const isActive = selectedType === item.filter;
					return (
						<button
							key={item.filter}
							type="button"
							onClick={() => onStageSelect(item.filter)}
							aria-pressed={isActive}
							className={`rounded-[var(--radius-lg)] border p-4 text-left shadow-[var(--shadow-2)] transition-colors ${
								isActive
									? "border-[var(--color-brand-blue)] bg-[var(--color-brand-blue-bg)]"
									: "border-[var(--border-default)] bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)]/70"
							}`}
						>
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
								{item.label}
							</p>
							<p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{item.value}</p>
						</button>
					);
				})}
			</div>
		</section>
	);
}

interface EvidencesTableViewProps {
	evidences: Evidence[];
}

function EvidencesTableView({ evidences }: EvidencesTableViewProps) {
	if (evidences.length === 0) {
		return (
			<EvidencesEmptyState
				icon={<Camera aria-hidden="true" className="mx-auto size-10 text-[var(--text-tertiary)]" />}
				title="No hay soportes para mostrar"
				description="Ajusta los filtros o revisa otra orden de trabajo."
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

			<section className="hidden overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] md:block">
				<table className="min-w-full text-left text-sm">
					<caption className="sr-only">Soportes con etapa, archivo, orden y fecha.</caption>
					<thead className="bg-[var(--surface-secondary)]/60 text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
						<tr>
							<th scope="col" className="px-4 py-3 font-semibold">
								Etapa
							</th>
							<th scope="col" className="px-4 py-3 font-semibold">
								Archivo
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
					<tbody className="divide-y divide-[color:var(--border-default)]/60 bg-[var(--surface-primary)]">
						{evidences.map((evidence) => (
							<EvidenceTableRow key={evidence._id} evidence={evidence} />
						))}
					</tbody>
				</table>
			</section>
		</>
	);
}

interface EvidencesGalleryViewProps {
	evidences: Evidence[];
}

function EvidencesGalleryView({ evidences }: EvidencesGalleryViewProps) {
	const groups = groupEvidencesByStage(evidences);

	if (groups.length === 0) {
		return (
			<EvidencesEmptyState
				icon={<Camera aria-hidden="true" className="mx-auto size-10 text-[var(--text-tertiary)]" />}
				title="No hay soportes para este filtro"
				description="Amplía la etapa o la búsqueda para revisar otros soportes capturados."
			/>
		);
	}

	return (
		<div className="space-y-5">
			{groups.map((group) => (
				<section
					key={group.type}
					className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-2)]"
					aria-labelledby={`evidence-group-${group.type}`}
				>
					<div className="mb-4 flex flex-col gap-2 border-b border-[var(--border-default)] pb-4 md:flex-row md:items-start md:justify-between">
						<div className="space-y-1">
							<h3
								id={`evidence-group-${group.type}`}
								className="text-lg font-semibold text-[var(--text-primary)]"
							>
								{group.label}
							</h3>
							<p className="max-w-2xl text-sm text-[var(--text-secondary)]">{group.description}</p>
						</div>
						<p className="text-sm font-medium text-[var(--text-tertiary)]">
							{group.items.length} soporte(s)
						</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
						{group.items.map((evidence) => (
							<EvidenceCard key={evidence._id} evidence={evidence} />
						))}
					</div>
				</section>
			))}
		</div>
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
		selectedType,
		setSelectedType,
		viewMode,
		setViewMode,
		ordersResult,
		isLoadingOrders,
	} = useEvidenceFilters();
	const orderOptions = ordersResult?.items ?? [];
	const selectedOrder = orderOptions.find((order) => order._id === selectedOrderId);

	const {
		data: evidences = [],
		isLoading: isLoadingEvidences,
		error,
	} = useQuery({
		queryKey: ["evidences", selectedOrderId],
		queryFn: () => listEvidences(selectedOrderId),
		enabled: !!selectedOrderId,
		staleTime: STALE_TIMES.LIST,
		placeholderData: keepPreviousData,
	});

	const filteredEvidences = useMemo(() => {
		const query = searchInput.trim().toLowerCase();
		return evidences.filter((evidence) => evidenceMatchesFilter(evidence, selectedType, query));
	}, [evidences, searchInput, selectedType]);

	const counts = useMemo(() => buildCounts(filteredEvidences), [filteredEvidences]);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const query = buildEvidenceSearchParams(
			searchParams,
			searchInput,
			selectedOrderId,
			selectedType,
			viewMode,
		);
		replace(`/evidences${query ? `?${query}` : ""}`);
	};

	const handleViewModeChange = (mode: EvidenceViewMode) => {
		setViewMode(mode);

		const query = buildEvidenceSearchParams(
			searchParams,
			searchInput,
			selectedOrderId,
			selectedType,
			mode,
		);
		replace(`/evidences${query ? `?${query}` : ""}`);
	};

	const clearFilters = () => {
		setSearchInput("");
		setSelectedType("all");
		setSelectedOrderId("");
		setViewMode("gallery");
		replace("/evidences");
	};

	return (
		<>
			<SyncBanner isOnline={isOnline} />
			<section className="space-y-6" aria-labelledby="evidences-page-title">
				<header className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
					<div className="border-b border-[var(--border-default)] bg-[linear-gradient(135deg,rgba(58,120,216,0.12),rgba(15,23,41,0.02),transparent)] p-5 sm:px-6">
						<p className="text-sm text-[var(--text-secondary)]">Dashboard / Soportes</p>
						<div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div className="space-y-1">
								<h1
									id="evidences-page-title"
									className="text-2xl font-semibold text-[var(--text-primary)]"
								>
									Soportes visuales
								</h1>
								<p className="max-w-2xl text-sm text-[var(--text-secondary)]">
									Gestor visual de soportes por orden. Selecciona una orden para revisar la captura
									operativa agrupada por etapa, detectar vacíos y abrir cada imagen en contexto.
								</p>
							</div>

							{selectedOrder ? (
								<Button asChild variant="outline" size="sm">
									<Link href={`/orders/${selectedOrder._id}`}>Abrir orden</Link>
								</Button>
							) : null}
						</div>
					</div>
					<EvidencesStatsSection counts={counts} />
				</header>

				<EvidencesFiltersForm
					searchInput={searchInput}
					selectedOrderId={selectedOrderId}
					selectedType={selectedType}
					isLoadingOrders={isLoadingOrders}
					orderOptions={orderOptions}
					onSearchInputChange={setSearchInput}
					onOrderIdChange={setSelectedOrderId}
					onTypeChange={setSelectedType}
					onSubmit={handleSubmit}
					onClear={clearFilters}
				/>

				{!selectedOrderId ? (
					<EvidencesEmptyState
						icon={
							<Camera aria-hidden="true" className="mx-auto size-10 text-[var(--text-tertiary)]" />
						}
						title="Selecciona una orden"
						description="Los soportes se consultan por orden. Si vienes desde una orden específica, el filtro se cargará automáticamente."
					/>
				) : isLoadingEvidences ? (
					<section className="flex h-64 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)]">
						<div className="flex items-center gap-3 text-[var(--text-secondary)]">
							<Loader2 className="size-5 animate-spin" aria-hidden="true" />
							Cargando soportes…
						</div>
					</section>
				) : error ? (
					<section className="rounded-[var(--radius-xl)] border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] p-6 text-sm text-[var(--color-danger)]">
						No se pudieron cargar los soportes. {(error as Error).message}
					</section>
				) : (
					<section aria-labelledby="evidences-list-title" className="space-y-4">
						<div className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-2)] md:flex-row md:items-center md:justify-between">
							<div className="space-y-1">
								<h2
									id="evidences-list-title"
									className="text-base font-semibold text-[var(--text-primary)]"
								>
									{selectedOrder
										? `${selectedOrder.code} · ${selectedOrder.assetName}`
										: "Listado de soportes"}
								</h2>
								<p className="text-sm text-[var(--text-secondary)]">
									{filteredEvidences.length} soporte(s) visibles para el contexto actual.
								</p>
							</div>

							<EvidencesViewToggle viewMode={viewMode} onChange={handleViewModeChange} />
						</div>

						<EvidencesSummaryGrid
							counts={counts}
							selectedType={selectedType}
							onStageSelect={setSelectedType}
						/>

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
