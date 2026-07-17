"use client";

import { useQuery } from "@tanstack/react-query";
import { Camera, FileUp, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { apiClient } from "@/lib/http/api-client";
import { DocumentUploader } from "@/modules/documents/ui/DocumentUploader";
import { EvidenceUploader } from "@/modules/evidences/ui/EvidenceUploader";

interface ActiveOrder {
	id: string;
	number: string;
	client: string;
}

interface ModuleContext {
	label: string;
	icon: string;
}

type QuickActionMode = "document" | "evidence";

const ORDERS_LIMIT = 20;
const EMPTY_ORDERS: ActiveOrder[] = [];

/** Maps current pathname to a human-readable module label */
function getModuleContext(pathname: string): ModuleContext {
	if (pathname.includes("/evidences")) {
		return { label: "Evidencias", icon: "camera" };
	}
	if (pathname.includes("/documents")) {
		return { label: "Documentos", icon: "file" };
	}
	if (pathname.includes("/orders")) {
		return { label: "Órdenes", icon: "briefcase" };
	}
	if (pathname.includes("/execution")) {
		return { label: "Ejecución", icon: "wrench" };
	}
	if (pathname.includes("/delivery-records")) {
		return { label: "Actas de entrega", icon: "clipboard" };
	}
	if (pathname.includes("/invoices")) {
		return { label: "Facturación", icon: "receipt" };
	}
	if (pathname.includes("/fleet")) {
		return { label: "Flota", icon: "truck" };
	}
	if (pathname.includes("/inventory")) {
		return { label: "Inventario", icon: "package" };
	}
	return { label: "Módulo", icon: "grid" };
}

export function QuickUploadPanel() {
	const [isOpen, setIsOpen] = useState(false);
	const [mode, setMode] = useState<QuickActionMode>("document");
	const [userSelectedId, setUserSelectedId] = useState<string | null>(null);

	const triggerRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLElement>(null);
	const panelTitleRef = useRef<HTMLHeadingElement>(null);
	const pathname = usePathname();

	const moduleCtx = useMemo(() => getModuleContext(pathname), [pathname]);

	const closePanel = useCallback((restoreFocus = false) => {
		setIsOpen(false);
		if (restoreFocus) {
			requestAnimationFrame(() => triggerRef.current?.focus());
		}
	}, []);
	const closePanelFromEscape = useEffectEvent(() => closePanel(true));

	const {
		data: orders = EMPTY_ORDERS,
		isLoading: isLoadingOrders,
		isError: isOrdersError,
		error: ordersQueryError,
		refetch: refetchOrders,
	} = useQuery({
		queryKey: ["quick-upload-orders"],
		queryFn: async ({ signal }) => {
			const payload = await apiClient.get<{
				success?: boolean;
				data?: Array<{ _id: string; code: string; clientName: string | null }>;
				error?: string;
			}>(`/orders?limit=${ORDERS_LIMIT}`, { signal });

			if (!payload?.data || !Array.isArray(payload.data)) {
				throw new Error(payload?.error ?? "No se pudieron cargar las órdenes recientes.");
			}

			return payload.data.slice(0, ORDERS_LIMIT).map((o) => ({
				id: o._id,
				number: o.code,
				client: o.clientName ?? "Sin cliente",
			}));
		},
		enabled: isOpen,
		staleTime: 60_000,
	});

	const ordersError = ordersQueryError instanceof Error ? ordersQueryError.message : null;
	const hasActiveOrders = orders.length > 0;

	useEffect(() => {
		if (!isOpen) {
			return;
		}
		panelTitleRef.current?.focus();
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				closePanelFromEscape();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen]);

	const selectedOrderId = useMemo(() => {
		if (userSelectedId && orders.some((o) => o.id === userSelectedId)) {
			return userSelectedId;
		}
		return orders[0]?.id ?? "";
	}, [userSelectedId, orders]);

	const selectedOrder = useMemo(
		() => orders.find((o) => o.id === selectedOrderId),
		[orders, selectedOrderId],
	);

	return (
		<>
			{/* Floating trigger button — only visible when panel is closed */}
			<button
				ref={triggerRef}
				type="button"
				onClick={() => setIsOpen((v) => !v)}
				aria-controls="quick-upload-panel"
				aria-expanded={isOpen}
				aria-label={isOpen ? "Cerrar carga rápida" : `Abrir carga rápida para ${moduleCtx.label}`}
				className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full bg-[#2154A6] px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#1a4390] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF50] focus-visible:ring-offset-2 md:bottom-6 md:right-6"
				hidden={isOpen}
			>
				{mode === "document" ? (
					<FileUp aria-hidden="true" className="size-4" />
				) : (
					<Camera aria-hidden="true" className="size-4" />
				)}
				<span className="hidden sm:inline">Carga rápida</span>
			</button>

			{/* Panel */}
			<aside
				id="quick-upload-panel"
				ref={panelRef}
				hidden={!isOpen}
				aria-labelledby="quick-upload-title"
				className="fixed bottom-20 right-4 z-50 w-[min(92vw,28rem)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-3)] md:bottom-6 md:right-6"
			>
				<div className="mb-3 flex items-center justify-between">
					<h2
						id="quick-upload-title"
						ref={panelTitleRef}
						tabIndex={-1}
						className="text-sm font-semibold text-[var(--text-primary)]"
					>
						Carga rápida — {moduleCtx.label}
					</h2>
					<button
						type="button"
						onClick={() => closePanel(true)}
						aria-label="Cerrar carga rápida"
						className="rounded-lg border border-[var(--border-subtle)] p-1 text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF50]"
					>
						<X className="size-4" aria-hidden="true" />
					</button>
				</div>

				<fieldset className="mb-4 grid grid-cols-2 gap-2 border-0 p-0">
					<legend className="sr-only">Tipo de carga</legend>
					<button
						type="button"
						onClick={() => setMode("document")}
						aria-pressed={mode === "document"}
						className={`rounded-xl px-3 py-2 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF50] ${
							mode === "document"
								? "bg-[#2154A6] text-white shadow-sm"
								: "border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
						}`}
					>
						Documento externo
					</button>
					<button
						type="button"
						onClick={() => setMode("evidence")}
						aria-pressed={mode === "evidence"}
						className={`rounded-xl px-3 py-2 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF50] ${
							mode === "evidence"
								? "bg-[#2154A6] text-white shadow-sm"
								: "border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
						}`}
					>
						Foto evidencia
					</button>
				</fieldset>

				<QuickUploadBody
					mode={mode}
					orders={orders}
					selectedOrder={selectedOrder}
					selectedOrderId={selectedOrderId}
					isLoading={isLoadingOrders}
					isError={isOrdersError}
					errorMessage={ordersError}
					hasActiveOrders={hasActiveOrders}
					onRetry={() => refetchOrders()}
					onSelectedOrderChange={setUserSelectedId}
				/>
			</aside>
		</>
	);
}

function QuickUploadBody({
	mode,
	orders,
	selectedOrder,
	selectedOrderId,
	isLoading,
	isError,
	errorMessage,
	hasActiveOrders,
	onRetry,
	onSelectedOrderChange,
}: {
	mode: QuickActionMode;
	orders: ActiveOrder[];
	selectedOrder: ActiveOrder | undefined;
	selectedOrderId: string;
	isLoading: boolean;
	isError: boolean;
	errorMessage: string | null;
	hasActiveOrders: boolean;
	onRetry: () => void;
	onSelectedOrderChange: (id: string) => void;
}) {
	if (isLoading) {
		return (
			<p
				aria-live="polite"
				className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text-secondary)]"
			>
				Cargando órdenes activas…
			</p>
		);
	}

	if (isError) {
		return (
			<div
				role="alert"
				className="space-y-2 rounded-xl border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 px-3 py-2 text-xs text-[var(--color-danger)]"
			>
				<p>{errorMessage ?? "Error al cargar órdenes."}</p>
				<button
					type="button"
					onClick={() => onRetry()}
					className="inline-flex rounded-lg border border-[var(--color-danger)]/20 px-2 py-1 font-medium hover:bg-[var(--surface-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF50]"
				>
					Reintentar
				</button>
			</div>
		);
	}

	if (!hasActiveOrders) {
		return (
			<p className="rounded-xl border border-[var(--color-warning-bg)] bg-[var(--color-warning-bg)]/60 px-3 py-2 text-xs text-[var(--color-warning)]">
				No hay órdenes activas para asociar documentos o evidencias.
			</p>
		);
	}

	if (mode === "document") {
		return (
			<DocumentUploader
				orders={orders.map((o) => ({
					id: o.id,
					code: o.number,
					number: o.number,
					client: o.client,
					assetName: "",
				}))}
				defaultOrderId={selectedOrderId}
			/>
		);
	}

	return (
		<div className="space-y-3">
			<label htmlFor="quick-upload-order-select" className="block text-sm">
				<span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
					Orden asociada
				</span>
				<select
					id="quick-upload-order-select"
					value={selectedOrderId}
					onChange={(e) => onSelectedOrderChange(e.target.value)}
					className="w-full rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-sm outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[#2154A6]/20"
				>
					{orders.map((o) => (
						<option key={o.id} value={o.id}>
							{o.number} — {o.client}
						</option>
					))}
				</select>
			</label>

			{selectedOrder ? (
				<EvidenceUploader key={selectedOrder.id} orderId={selectedOrder.id} />
			) : (
				<p className="rounded-xl border border-red-200 bg-[var(--color-danger-bg)] px-3 py-2 text-xs text-[var(--color-danger)]">
					Selecciona una orden válida para cargar evidencia.
				</p>
			)}
		</div>
	);
}
