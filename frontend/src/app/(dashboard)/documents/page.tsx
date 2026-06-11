"use client";

import { ADMIN_ROLES } from "@cermont/domain";
import {
	CERMONT_OPERATIONAL_STEPS,
	type CermontOperationalStepCode,
	type DocumentPurpose,
} from "@cermont/shared-types";
import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useMemo, useReducer } from "react";
import { EmptyState } from "@/core/ui/EmptyState";
import { cloneSearchParams, readSearchParam } from "@/lib/utils/search-params";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useDocuments } from "@/modules/documents/queries";
import { DocumentGallery } from "@/modules/documents/ui/DocumentGallery";
import { DocumentUploader } from "@/modules/documents/ui/DocumentUploader";
import { useOrders } from "@/modules/orders/queries";
import { useServiceCaseList } from "@/modules/service-cases/queries";

const FILTER_FIELD_CLASS =
	"rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15";

const DOCUMENT_PURPOSE_FILTER_OPTIONS: Array<{ label: string; value: DocumentPurpose }> = [
	{ value: "library", label: "Biblioteca" },
	{ value: "template_source", label: "Fuente de plantilla" },
	{ value: "closing_evidence", label: "Closure evidence" },
	{ value: "support_document", label: "Soporte operativo" },
];

const DOCUMENT_PURPOSE_VALUES = new Set(
	DOCUMENT_PURPOSE_FILTER_OPTIONS.map((option) => option.value),
);

const STEP_CODE_VALUES = new Set(CERMONT_OPERATIONAL_STEPS.map((step) => step.code));

type DocumentsFilterState = {
	includeArchived: boolean;
	orderFilter: string;
	purposeFilter: DocumentPurpose | "";
	searchInput: string;
	serviceCaseFilter: string;
	stepFilter: CermontOperationalStepCode | "";
};

type DocumentsFilterAction =
	| { type: "setIncludeArchived"; value: boolean }
	| { type: "setOrderFilter"; value: string }
	| { type: "setPurposeFilter"; value: DocumentPurpose | "" }
	| { type: "setSearchInput"; value: string }
	| { type: "setServiceCaseFilter"; value: string }
	| { type: "setStepFilter"; value: CermontOperationalStepCode | "" }
	| { type: "reset" };

type DocumentsFilterSeed = {
	initialIncludeArchived: boolean;
	initialOrderId: string;
	initialPurpose: DocumentPurpose | "";
	initialSearch: string;
	initialServiceCaseId: string;
	initialStep: CermontOperationalStepCode | "";
};

function createDocumentsFilterState({
	initialIncludeArchived,
	initialOrderId,
	initialPurpose,
	initialSearch,
	initialServiceCaseId,
	initialStep,
}: DocumentsFilterSeed): DocumentsFilterState {
	return {
		includeArchived: initialIncludeArchived,
		orderFilter: initialOrderId,
		purposeFilter: initialPurpose,
		searchInput: initialSearch,
		serviceCaseFilter: initialServiceCaseId,
		stepFilter: initialStep,
	};
}

function documentsFilterReducer(
	state: DocumentsFilterState,
	action: DocumentsFilterAction,
): DocumentsFilterState {
	switch (action.type) {
		case "setIncludeArchived":
			return { ...state, includeArchived: action.value };
		case "setOrderFilter":
			return { ...state, orderFilter: action.value };
		case "setPurposeFilter":
			return { ...state, purposeFilter: action.value };
		case "setSearchInput":
			return { ...state, searchInput: action.value };
		case "setServiceCaseFilter":
			return { ...state, serviceCaseFilter: action.value };
		case "setStepFilter":
			return { ...state, stepFilter: action.value };
		case "reset":
			return {
				includeArchived: false,
				orderFilter: "",
				purposeFilter: "",
				searchInput: "",
				serviceCaseFilter: "",
				stepFilter: "",
			};
	}
}

export default function DocumentsPage() {
	return (
		<Suspense fallback={<DocumentsLoading />}>
			<DocumentsPageInner />
		</Suspense>
	);
}

function DocumentsLoading() {
	return (
		<section className="space-y-6" aria-labelledby="documents-page-title">
			<div className="flex h-40 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
				<Loader2 className="size-5 animate-spin text-[var(--text-tertiary)]" aria-hidden="true" />
			</div>
		</section>
	);
}

function resolveDefaultPurpose(value: DocumentPurpose | undefined): DocumentPurpose {
	if (
		value === "library" ||
		value === "template_source" ||
		value === "closing_evidence" ||
		value === "support_document"
	) {
		return value;
	}

	return "library";
}

function readBooleanSearchParam(searchParams: ReturnType<typeof useSearchParams>, key: string) {
	return readSearchParam(searchParams, key) === "true";
}

function normalizePurposeFilter(value: string): DocumentPurpose | "" {
	if (DOCUMENT_PURPOSE_VALUES.has(value as DocumentPurpose)) {
		return value as DocumentPurpose;
	}

	return "";
}

function normalizeStepFilter(value: string): CermontOperationalStepCode | "" {
	if (STEP_CODE_VALUES.has(value as CermontOperationalStepCode)) {
		return value as CermontOperationalStepCode;
	}

	return "";
}

function buildDocumentsHref({
	includeArchived,
	orderFilter,
	purposeFilter,
	searchInput,
	serviceCaseFilter,
	searchParams,
	stepFilter,
}: {
	includeArchived: boolean;
	orderFilter: string;
	purposeFilter: DocumentPurpose | "";
	searchInput: string;
	serviceCaseFilter: string;
	searchParams: ReturnType<typeof useSearchParams>;
	stepFilter: CermontOperationalStepCode | "";
}) {
	const params = cloneSearchParams(searchParams);

	if (searchInput.trim()) {
		params.set("q", searchInput.trim());
	} else {
		params.delete("q");
	}

	if (orderFilter) {
		params.set("orderId", orderFilter);
	} else {
		params.delete("orderId");
	}

	if (serviceCaseFilter) {
		params.set("serviceCaseId", serviceCaseFilter);
	} else {
		params.delete("serviceCaseId");
	}

	if (purposeFilter) {
		params.set("purpose", purposeFilter);
	} else {
		params.delete("purpose");
	}

	if (stepFilter) {
		params.set("step", stepFilter);
	} else {
		params.delete("step");
	}

	if (includeArchived) {
		params.set("includeArchived", "true");
	} else {
		params.delete("includeArchived");
	}

	const query = params.toString();
	return `/documents${query ? `?${query}` : ""}`;
}

function DocumentsPageHeader({
	filteredCount,
	isGlobalAdmin,
	isLoading,
	orderCount,
}: {
	filteredCount: number;
	isGlobalAdmin: boolean;
	isLoading: boolean;
	orderCount: number;
}) {
	return (
		<header className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
			<div className="border-b border-[var(--border-default)] bg-[var(--gradient-header)] p-5 sm:px-6">
				<p className="text-sm text-[var(--text-secondary)]">Dashboard / Documentos</p>

				<div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div>
						<h1
							id="documents-page-title"
							className="flex items-center gap-2 text-2xl font-semibold text-[var(--text-primary)]"
						>
							<span className="flex size-10 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
								<FileText aria-hidden="true" className="size-5" />
							</span>
							Gestión de documentos
						</h1>
						<p className="mt-1 text-sm text-[var(--text-secondary)]">
							{isLoading ? (
								<>
									<Loader2 className="mr-1 inline-block size-3 animate-spin" /> Loading&hellip;
								</>
							) : (
								`${filteredCount} documento(s) disponibles.`
							)}
						</p>
					</div>

					<Link
						href="/orders"
						className="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-primary)]"
					>
						Ir a órdenes
					</Link>
				</div>
			</div>
			<div className="p-5 sm:px-6">
				<div className="grid gap-3 sm:grid-cols-3">
					<article className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)]/50 p-4">
						<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
							Documentos
						</p>
						<p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
							{filteredCount}
						</p>
					</article>
					<article className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)]/50 p-4">
						<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
							Órdenes visibles
						</p>
						<p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{orderCount}</p>
					</article>
					<article className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)]/50 p-4">
						<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
							Modo
						</p>
						<p className="mt-2 text-2xl font-semibold text-[var(--color-brand)]">
							{isGlobalAdmin ? "Global" : "Limitado"}
						</p>
					</article>
				</div>
			</div>
		</header>
	);
}

function DocumentsFilters({
	activeFiltersCount,
	handleSearch,
	handleReset,
	includeArchived,
	orderFilter,
	orderOptions,
	purposeFilter,
	searchInput,
	serviceCaseFilter,
	serviceCaseOptions,
	setIncludeArchived,
	setOrderFilter,
	setPurposeFilter,
	setSearchInput,
	setServiceCaseFilter,
	setStepFilter,
	stepFilter,
}: {
	activeFiltersCount: number;
	handleSearch: (event: FormEvent<HTMLFormElement>) => void;
	handleReset: () => void;
	includeArchived: boolean;
	orderFilter: string;
	orderOptions: Array<{ assetName?: string; code?: string; id: string }>;
	purposeFilter: DocumentPurpose | "";
	searchInput: string;
	serviceCaseFilter: string;
	serviceCaseOptions: Array<{ clientName?: string; code?: string; id: string }>;
	setIncludeArchived: (value: boolean) => void;
	setOrderFilter: (value: string) => void;
	setPurposeFilter: (value: DocumentPurpose | "") => void;
	setSearchInput: (value: string) => void;
	setServiceCaseFilter: (value: string) => void;
	setStepFilter: (value: CermontOperationalStepCode | "") => void;
	stepFilter: CermontOperationalStepCode | "";
}) {
	return (
		<section
			className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-2)]"
			aria-labelledby="documents-filters-title"
		>
			<h2 id="documents-filters-title" className="sr-only">
				Filtros de documentos
			</h2>

			<search>
				<form className="grid grid-cols-1 gap-3 xl:grid-cols-12" onSubmit={handleSearch}>
					<div className="xl:col-span-3">
						<label
							htmlFor="documents-search"
							className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]"
						>
							Buscar documento
						</label>
						<input
							id="documents-search"
							name="q"
							value={searchInput}
							onChange={(event) => setSearchInput(event.target.value)}
							placeholder="Buscar por título, archivo o ID de OT"
							className={`w-full ${FILTER_FIELD_CLASS}`}
						/>
					</div>

					<div className="xl:col-span-2">
						<label
							htmlFor="documents-order-filter"
							className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]"
						>
							Filtrar por OT
						</label>
						<select
							id="documents-order-filter"
							name="orderId"
							value={orderFilter}
							onChange={(event) => setOrderFilter(event.target.value)}
							className={FILTER_FIELD_CLASS}
						>
							<option value="">Todas las órdenes</option>
							{orderOptions.map((order) => (
								<option key={order.id} value={order.id}>
									{order.code} · {order.assetName}
								</option>
							))}
						</select>
					</div>

					<div className="xl:col-span-2">
						<label
							htmlFor="documents-service-case-filter"
							className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]"
						>
							Filtrar por caso de servicio
						</label>
						<select
							id="documents-service-case-filter"
							name="serviceCaseId"
							value={serviceCaseFilter}
							onChange={(event) => setServiceCaseFilter(event.target.value)}
							className={FILTER_FIELD_CLASS}
						>
							<option value="">Todos los casos</option>
							{serviceCaseOptions.map((serviceCase) => (
								<option key={serviceCase.id} value={serviceCase.id}>
									{serviceCase.code || serviceCase.id} · {serviceCase.clientName || "Sin cuenta"}
								</option>
							))}
						</select>
					</div>

					<div className="xl:col-span-2">
						<label
							htmlFor="documents-purpose-filter"
							className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]"
						>
							Filtrar por propósito documental
						</label>
						<select
							id="documents-purpose-filter"
							name="purpose"
							value={purposeFilter}
							onChange={(event) => setPurposeFilter(normalizePurposeFilter(event.target.value))}
							className={FILTER_FIELD_CLASS}
						>
							<option value="">Todos los propósitos</option>
							{DOCUMENT_PURPOSE_FILTER_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>

					<div className="xl:col-span-2">
						<label
							htmlFor="documents-step-filter"
							className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]"
						>
							Filtrar por paso operacional
						</label>
						<select
							id="documents-step-filter"
							name="step"
							value={stepFilter}
							onChange={(event) => setStepFilter(normalizeStepFilter(event.target.value))}
							className={FILTER_FIELD_CLASS}
						>
							<option value="">Todos los pasos</option>
							{CERMONT_OPERATIONAL_STEPS.map((step) => (
								<option key={step.code} value={step.code}>
									{step.stepNumber}. {step.label}
								</option>
							))}
						</select>
					</div>

					<button
						type="submit"
						className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 xl:col-span-1 xl:self-end"
					>
						Filtrar
					</button>

					<button
						type="button"
						onClick={handleReset}
						className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-primary)] xl:col-span-1 xl:self-end"
					>
						Limpiar filtros
					</button>
				</form>

				<div className="mt-4 flex flex-col gap-3 border-t border-[var(--border-default)] pt-4 md:flex-row md:items-center md:justify-between">
					<label
						htmlFor="documents-include-archived"
						className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]"
					>
						<input
							id="documents-include-archived"
							type="checkbox"
							checked={includeArchived}
							onChange={(event) => setIncludeArchived(event.target.checked)}
							className="size-4 rounded border-[var(--border-default)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
						/>
						Mostrar archivados
					</label>

					<p className="text-xs text-[var(--text-tertiary)]">
						{activeFiltersCount > 0
							? `${activeFiltersCount} filtro(s) activos para ubicar documentos en contexto.`
							: "Sin filtros activos. Se muestran los documentos visibles del contexto actual."}
					</p>
				</div>
			</search>
		</section>
	);
}

function DocumentsPageInner() {
	const { user: session } = useAuth();
	const { replace } = useRouter();
	const searchParams = useSearchParams();

	const getSearchParam = (key: string) => readSearchParam(searchParams, key);

	const initialSearch = getSearchParam("q") ?? "";
	const initialOrderId = getSearchParam("orderId") ?? "";
	const initialServiceCaseId = getSearchParam("serviceCaseId") ?? "";
	const initialPurpose = normalizePurposeFilter(getSearchParam("purpose"));
	const initialStep = normalizeStepFilter(getSearchParam("step"));
	const initialIncludeArchived = readBooleanSearchParam(searchParams, "includeArchived");
	const defaultPurpose = resolveDefaultPurpose(initialPurpose || undefined);

	const [filters, dispatch] = useReducer(
		documentsFilterReducer,
		{
			initialIncludeArchived,
			initialOrderId,
			initialPurpose,
			initialSearch,
			initialServiceCaseId,
			initialStep,
		},
		createDocumentsFilterState,
	);
	const {
		includeArchived,
		orderFilter,
		purposeFilter,
		searchInput,
		serviceCaseFilter,
		stepFilter,
	} = filters;

	const { data: ordersResult, isLoading: isLoadingOrders } = useOrders({ limit: 100 });
	const { data: serviceCasesList, isLoading: isLoadingServiceCases } = useServiceCaseList();
	const { data: documentsData = [], isLoading: isLoadingDocs } = useDocuments({
		order_id: orderFilter || undefined,
		purpose: purposeFilter || undefined,
		serviceCaseId: serviceCaseFilter || undefined,
		stepCode: stepFilter || undefined,
		includeArchived: includeArchived || undefined,
	});

	const isGlobalAdmin = session?.role
		? (ADMIN_ROLES as readonly string[]).includes(session.role)
		: false;

	const orderOptions = useMemo(() => {
		const orders = ordersResult?.items ?? [];
		const visibleOrders = isGlobalAdmin
			? orders
			: orders.filter((order) => order.createdBy === session?.id);

		return visibleOrders.map((order) => ({
			id: order._id,
			code: order.code,
			assetName: order.assetName,
			location: order.location,
		}));
	}, [isGlobalAdmin, ordersResult?.items, session?.id]);

	const serviceCaseOptions = useMemo(() => {
		const cases = serviceCasesList?.items ?? [];
		return cases.map((serviceCase: { _id: string; code?: string; clientName?: string }) => ({
			id: serviceCase._id,
			code: serviceCase.code,
			clientName: serviceCase.clientName,
		}));
	}, [serviceCasesList?.items]);

	const filteredDocuments = useMemo(() => {
		const query = searchInput.trim().toLowerCase();

		if (!query) {
			return documentsData;
		}

		return documentsData.filter((document) => {
			return [document.title, document.file_url, document.order_id, document.mime_type]
				.filter(Boolean)
				.join(" ")
				.toLowerCase()
				.includes(query);
		});
	}, [documentsData, searchInput]);

	const handleSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		replace(
			buildDocumentsHref({
				includeArchived,
				orderFilter,
				purposeFilter,
				searchInput,
				serviceCaseFilter,
				searchParams,
				stepFilter,
			}),
		);
	};

	const handleReset = () => {
		dispatch({ type: "reset" });
		replace("/documents");
	};

	const setIncludeArchived = (value: boolean) => dispatch({ type: "setIncludeArchived", value });
	const setOrderFilter = (value: string) => dispatch({ type: "setOrderFilter", value });
	const setPurposeFilter = (value: DocumentPurpose | "") =>
		dispatch({ type: "setPurposeFilter", value });
	const setSearchInput = (value: string) => dispatch({ type: "setSearchInput", value });
	const setServiceCaseFilter = (value: string) => dispatch({ type: "setServiceCaseFilter", value });
	const setStepFilter = (value: CermontOperationalStepCode | "") =>
		dispatch({ type: "setStepFilter", value });

	const isLoading = isLoadingOrders || isLoadingDocs || isLoadingServiceCases;
	const activeFiltersCount = [
		searchInput.trim(),
		orderFilter,
		serviceCaseFilter,
		purposeFilter,
		stepFilter,
		includeArchived ? "archived" : "",
	].filter(Boolean).length;

	return (
		<section className="space-y-6" aria-labelledby="documents-page-title">
			<DocumentsPageHeader
				filteredCount={filteredDocuments.length}
				isGlobalAdmin={isGlobalAdmin}
				isLoading={isLoading}
				orderCount={orderOptions.length}
			/>

			<DocumentsFilters
				activeFiltersCount={activeFiltersCount}
				handleSearch={handleSearch}
				handleReset={handleReset}
				includeArchived={includeArchived}
				orderFilter={orderFilter}
				orderOptions={orderOptions}
				purposeFilter={purposeFilter}
				searchInput={searchInput}
				serviceCaseFilter={serviceCaseFilter}
				serviceCaseOptions={serviceCaseOptions}
				setIncludeArchived={setIncludeArchived}
				setOrderFilter={setOrderFilter}
				setPurposeFilter={setPurposeFilter}
				setSearchInput={setSearchInput}
				setServiceCaseFilter={setServiceCaseFilter}
				setStepFilter={setStepFilter}
				stepFilter={stepFilter}
			/>

			{!isLoading && (
				<DocumentUploader
					key={`${orderFilter}|${serviceCaseFilter}|${purposeFilter || "library"}|${stepFilter}`}
					orders={orderOptions}
					serviceCases={serviceCaseOptions}
					defaultOrderId={orderFilter || initialOrderId}
					defaultServiceCaseId={serviceCaseFilter || initialServiceCaseId}
					defaultPurpose={resolveDefaultPurpose(purposeFilter || defaultPurpose)}
					defaultStepCode={stepFilter || initialStep || undefined}
				/>
			)}

			{!isLoading ? (
				filteredDocuments.length > 0 ? (
					<DocumentGallery documents={filteredDocuments} />
				) : (
					<EmptyState
						icon={activeFiltersCount > 0 ? "search" : "documents"}
						title={
							activeFiltersCount > 0
								? "No hay documentos para este contexto"
								: "Sin documentos disponibles"
						}
						description={
							activeFiltersCount > 0
								? "Ajuste los filtros de caso, paso, propósito o archivo para ampliar la búsqueda."
								: "Los documentos aparecerán aquí cuando se carguen desde operación, plantillas o cierre."
						}
						action={
							activeFiltersCount > 0
								? {
										label: "Limpiar filtros",
										onClick: handleReset,
									}
								: undefined
						}
					/>
				)
			) : (
				<div className="flex h-40 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
					<Loader2 className="size-5 animate-spin text-[var(--text-tertiary)]" aria-hidden="true" />
				</div>
			)}
		</section>
	);
}
