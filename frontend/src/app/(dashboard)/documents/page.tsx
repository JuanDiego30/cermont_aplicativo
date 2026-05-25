"use client";

import { ADMIN_ROLES } from "@cermont/domain";
import type { CermontOperationalStepCode, DocumentPurpose } from "@cermont/shared-types";
import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useMemo, useState } from "react";
import { cloneSearchParams, readSearchParam } from "@/lib/utils/search-params";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useDocuments } from "@/modules/documents/queries";
import { DocumentGallery, type DocumentRecord } from "@/modules/documents/ui/DocumentGallery";
import { DocumentUploader } from "@/modules/documents/ui/DocumentUploader";
import { useOrders } from "@/modules/orders/queries";
import { useServiceCaseList } from "@/modules/service-cases/queries";

const FILTER_FIELD_CLASS =
	"rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/15";

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

function buildDocumentsHref({
	orderFilter,
	searchInput,
	searchParams,
}: {
	orderFilter: string;
	searchInput: string;
	searchParams: ReturnType<typeof useSearchParams>;
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
			<div className="border-b border-[var(--border-default)] bg-[linear-gradient(135deg,rgba(58,120,216,0.12),rgba(15,23,41,0.02),transparent)] p-5 sm:px-6">
				<p className="text-sm text-[var(--text-secondary)]">Dashboard / Documentos</p>

				<div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div>
						<h1
							id="documents-page-title"
							className="flex items-center gap-2 text-2xl font-semibold text-[var(--text-primary)]"
						>
							<span className="flex size-10 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-brand-blue-bg)] text-[var(--color-brand-blue)]">
								<FileText aria-hidden="true" className="size-5" />
							</span>
							Gestión de documentos
						</h1>
						<p className="mt-1 text-sm text-[var(--text-secondary)]">
							{isLoading ? (
								<>
									<Loader2 className="mr-1 inline-block size-3 animate-spin" /> Cargando…
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
						<p className="mt-2 text-2xl font-semibold text-[var(--color-brand-blue)]">
							{isGlobalAdmin ? "Global" : "Limitado"}
						</p>
					</article>
				</div>
			</div>
		</header>
	);
}

function DocumentsFilters({
	handleSearch,
	orderFilter,
	orderOptions,
	searchInput,
	setOrderFilter,
	setSearchInput,
}: {
	handleSearch: (event: FormEvent<HTMLFormElement>) => void;
	orderFilter: string;
	orderOptions: Array<{ assetName?: string; code?: string; id: string }>;
	searchInput: string;
	setOrderFilter: (value: string) => void;
	setSearchInput: (value: string) => void;
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
				<form
					className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]"
					onSubmit={handleSearch}
				>
					<div>
						<label htmlFor="documents-search" className="sr-only">
							Buscar documento
						</label>
						<input
							id="documents-search"
							name="q"
							value={searchInput}
							onChange={(event) => setSearchInput(event.target.value)}
							placeholder="Buscar por título, archivo o ID de orden"
							className={`w-full ${FILTER_FIELD_CLASS}`}
						/>
					</div>

					<div>
						<label htmlFor="documents-order-filter" className="sr-only">
							Filtrar por orden
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

					<button
						type="submit"
						className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
					>
						Filtrar
					</button>
				</form>
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
	const initialPurpose = getSearchParam("purpose") as DocumentPurpose | undefined;
	const initialStep = getSearchParam("step") as CermontOperationalStepCode | undefined;
	const defaultPurpose = resolveDefaultPurpose(initialPurpose);

	const [searchInput, setSearchInput] = useState(initialSearch);
	const [orderFilter, setOrderFilter] = useState(initialOrderId);

	const { data: ordersResult, isLoading: isLoadingOrders } = useOrders({ limit: 100 });
	const { data: serviceCasesList, isLoading: isLoadingServiceCases } = useServiceCaseList();
	const { data: documentsData = [], isLoading: isLoadingDocs } = useDocuments({
		order_id: orderFilter || undefined,
		purpose: initialPurpose || undefined,
		serviceCaseId: initialServiceCaseId || undefined,
		stepCode: initialStep || undefined,
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
			return documentsData as DocumentRecord[];
		}

		return (documentsData as DocumentRecord[]).filter((document) => {
			return [document.title, document.file_url, document.order_id, document.mime_type]
				.filter(Boolean)
				.join(" ")
				.toLowerCase()
				.includes(query);
		});
	}, [documentsData, searchInput]);

	const handleSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		replace(buildDocumentsHref({ orderFilter, searchInput, searchParams }));
	};

	const isLoading = isLoadingOrders || isLoadingDocs || isLoadingServiceCases;

	return (
		<section className="space-y-6" aria-labelledby="documents-page-title">
			<DocumentsPageHeader
				filteredCount={filteredDocuments.length}
				isGlobalAdmin={isGlobalAdmin}
				isLoading={isLoading}
				orderCount={orderOptions.length}
			/>

			<DocumentsFilters
				handleSearch={handleSearch}
				orderFilter={orderFilter}
				orderOptions={orderOptions}
				searchInput={searchInput}
				setOrderFilter={setOrderFilter}
				setSearchInput={setSearchInput}
			/>

			{!isLoading && (
				<DocumentUploader
					orders={orderOptions}
					serviceCases={serviceCaseOptions}
					defaultOrderId={orderFilter || initialOrderId}
					defaultServiceCaseId={initialServiceCaseId}
					defaultPurpose={defaultPurpose}
					defaultStepCode={initialStep}
				/>
			)}

			{!isLoading ? (
				<DocumentGallery documents={filteredDocuments as DocumentRecord[]} />
			) : (
				<div className="flex h-40 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
					<Loader2 className="size-5 animate-spin text-[var(--text-tertiary)]" aria-hidden="true" />
				</div>
			)}
		</section>
	);
}
