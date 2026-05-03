"use client";

import type { Document } from "@cermont/shared-types";
import { ADMIN_ROLES } from "@cermont/shared-types/rbac";
import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { useAuth } from "@/auth/hooks/useAuth";
import { CreatableSelectField } from "@/core/ui/CreatableSelectField";
import { useDocuments } from "@/documents/queries";
import { DocumentGallery } from "@/documents/ui/DocumentGallery";
import { DocumentUploader } from "@/documents/ui/DocumentUploader";
import { useOrders } from "@/orders/queries";

const FILTER_FIELD_CLASS =
	"rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/15";

export default function DocumentsPage() {
	const { user: session } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();

	const initialSearch = searchParams.get("q") ?? "";
	const initialOrderId = searchParams.get("orderId") ?? "";

	const [searchInput, setSearchInput] = useState(initialSearch);
	const [orderFilter, setOrderFilter] = useState(initialOrderId);

	const { data: ordersResult, isLoading: isLoadingOrders } = useOrders({ limit: 100 });

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
	const isKnownOrderFilter = orderOptions.some((order) => order.id === orderFilter);
	const { data: documentsData = [], isLoading: isLoadingDocs } = useDocuments({
		...(isKnownOrderFilter ? { orderId: orderFilter } : {}),
	});

	const filteredDocuments = useMemo(() => {
		const query = [searchInput, isKnownOrderFilter ? "" : orderFilter]
			.join(" ")
			.trim()
			.toLowerCase();

		if (!query) {
			return documentsData as Document[];
		}

		return (documentsData as Document[]).filter((document) => {
			return [document.title, document.file_url, document.order_id, document.mime_type]
				.filter(Boolean)
				.join(" ")
				.toLowerCase()
				.includes(query);
		});
	}, [documentsData, isKnownOrderFilter, orderFilter, searchInput]);

	const handleSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const params = new URLSearchParams(searchParams.toString());

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
		router.replace(`/documents${query ? `?${query}` : ""}`);
	};

	const isLoading = isLoadingOrders || isLoadingDocs;

	return (
		<section className="space-y-6" aria-labelledby="documents-page-title">
			<header className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
				<div className="border-b border-[var(--border-default)] bg-[linear-gradient(135deg,rgba(58,120,216,0.12),rgba(15,23,41,0.02),transparent)] px-5 py-5 sm:px-6">
					<p className="text-sm text-[var(--text-secondary)]">Dashboard / Documentos</p>

					<div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div>
							<h1
								id="documents-page-title"
								className="flex items-center gap-2 text-2xl font-bold text-[var(--text-primary)]"
							>
								<span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-brand-blue-bg)] text-[var(--color-brand-blue)]">
									<FileText aria-hidden="true" className="h-5 w-5" />
								</span>
								Gestión de documentos
							</h1>
							<p className="mt-1 text-sm text-[var(--text-secondary)]">
								{isLoading ? (
									<>
										<Loader2 className="mr-1 inline-block h-3 w-3 animate-spin" /> Cargando...
									</>
								) : (
									`${filteredDocuments.length} documento(s) disponibles.`
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
				<div className="px-5 py-5 sm:px-6">
					<div className="grid gap-3 sm:grid-cols-3">
						<article className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)]/50 p-4">
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
								Documentos
							</p>
							<p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
								{filteredDocuments.length}
							</p>
						</article>
						<article className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)]/50 p-4">
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
								Órdenes visibles
							</p>
							<p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
								{orderOptions.length}
							</p>
						</article>
						<article className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)]/50 p-4">
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
								Modo
							</p>
							<p className="mt-2 text-2xl font-bold text-[var(--color-brand-blue)]">
								{isGlobalAdmin ? "Global" : "Limitado"}
							</p>
						</article>
					</div>
				</div>
			</header>

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
							<CreatableSelectField
								id="documents-order-filter"
								label="Filtrar por orden"
								value={orderFilter}
								onValueChange={setOrderFilter}
								options={[
									{ value: "", label: "Todas las órdenes" },
									...orderOptions.map((order) => ({
										value: order.id,
										label: `${order.code} · ${order.assetName}`,
									})),
								]}
								placeholder="Buscar OT o escribir referencia"
							/>
						</div>

						<button
							type="submit"
							className="rounded-xl bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--color-brand-blue-hover)]"
						>
							Filtrar
						</button>
					</form>
				</search>
			</section>

			{!isLoading && <DocumentUploader orders={orderOptions} defaultOrderId={orderFilter} />}

			{!isLoading ? (
				<DocumentGallery documents={filteredDocuments as Document[]} />
			) : (
				<div className="flex h-40 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
					<Loader2
						className="h-5 w-5 animate-spin text-[var(--text-tertiary)]"
						aria-hidden="true"
					/>
				</div>
			)}
		</section>
	);
}
