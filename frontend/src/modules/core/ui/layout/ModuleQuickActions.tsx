"use client";

import { useQuery } from "@tanstack/react-query";
import { Camera, FileUp, X } from "lucide-react";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { apiClient } from "@/lib/http/api-client";
import { DocumentUploader } from "@/modules/documents/ui/DocumentUploader";
import { EvidenceUploader } from "@/modules/evidences/ui/EvidenceUploader";

interface QuickActionOrderOption {
	id: string;
	number: string;
	client: string;
}

interface ModuleQuickActionsProps {
	initialOrders?: QuickActionOrderOption[];
}

type QuickActionMode = "document" | "evidence";
const QUICK_ACTION_ORDERS_LIMIT = 20;
const EMPTY_QUICK_ACTION_ORDERS: QuickActionOrderOption[] = [];

interface QuickActionsOrdersResponse {
	data?: Record<
		string,
		Array<{
			id: string;
			code: string;
			clientName: string | null;
		}>
	>;
	error?: string;
}

export function ModuleQuickActions({
	initialOrders = EMPTY_QUICK_ACTION_ORDERS,
}: ModuleQuickActionsProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [mode, setMode] = useState<QuickActionMode>("document");
	const [userSelectedId, setUserSelectedId] = useState<string | null>(null);

	const triggerRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLElement>(null);
	const panelTitleRef = useRef<HTMLHeadingElement>(null);

	const closePanel = useCallback((restoreFocus = false) => {
		setIsOpen(false);

		if (restoreFocus) {
			requestAnimationFrame(() => {
				triggerRef.current?.focus();
			});
		}
	}, []);
	const closePanelFromEscape = useEffectEvent(() => closePanel(true));
	const {
		data: fetchedOrders,
		isLoading: isLoadingOrders,
		error: queryError,
		refetch: refetchOrders,
	} = useQuery({
		queryKey: ["quick-actions-orders"],
		queryFn: async ({ signal }) => {
			const payload = await apiClient.get<QuickActionsOrdersResponse>(
				`/orders/kanban?limit=${QUICK_ACTION_ORDERS_LIMIT}`,
				{ signal },
			);

			if (!payload.data || typeof payload.data !== "object") {
				throw new Error(payload.error ?? "No se pudieron cargar las órdenes recientes.");
			}

			const allOrders = Object.values(payload.data)
				.flatMap((column) => (Array.isArray(column) ? column : []))
				.slice(0, QUICK_ACTION_ORDERS_LIMIT);

			return allOrders.map((order) => ({
				id: order.id,
				number: order.code,
				client: order.clientName ?? "Sin cliente",
			}));
		},
		enabled: isOpen && initialOrders.length === 0,
		staleTime: 60 * 1000,
	});

	const loadOrders = () => refetchOrders();
	const ordersError = queryError instanceof Error ? queryError.message : null;
	const orders = fetchedOrders ?? initialOrders;

	const selectedOrderId = useMemo(() => {
		if (userSelectedId && orders.some((order) => order.id === userSelectedId)) {
			return userSelectedId;
		}
		return orders[0]?.id ?? "";
	}, [userSelectedId, orders]);

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

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				closePanelFromEscape();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen]);

	const selectedOrder = useMemo(
		() => orders.find((order) => order.id === selectedOrderId),
		[orders, selectedOrderId],
	);

	return (
		<div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
			<aside
				id="module-quick-actions-panel"
				ref={panelRef}
				hidden={!isOpen}
				aria-labelledby="module-quick-actions-title"
				className="w-[min(92vw,28rem)] rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-3)]"
			>
				<div className="mb-3 flex items-center justify-between">
					<h2
						id="module-quick-actions-title"
						ref={panelTitleRef}
						tabIndex={-1}
						className="text-sm font-semibold text-[var(--text-primary)]"
					>
						Carga rápida del módulo
					</h2>
					<button
						type="button"
						onClick={() => closePanel(true)}
						aria-label="Cerrar acciones rápidas"
						className="rounded-lg border border-[var(--border-default)] p-1 text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
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
						className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
							mode === "document"
								? "bg-[var(--color-brand-blue)] text-white shadow-[var(--shadow-brand)]"
								: "border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
						}`}
					>
						Documento externo
					</button>
					<button
						type="button"
						onClick={() => setMode("evidence")}
						aria-pressed={mode === "evidence"}
						className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
							mode === "evidence"
								? "bg-[var(--color-brand-blue)] text-white shadow-[var(--shadow-brand)]"
								: "border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
						}`}
					>
						Foto evidencia
					</button>
				</fieldset>

				<QuickActionPanelBody
					mode={mode}
					orders={orders}
					selectedOrder={selectedOrder}
					selectedOrderId={selectedOrderId}
					isLoadingOrders={isLoadingOrders}
					ordersError={ordersError}
					onRetry={loadOrders}
					onSelectedOrderChange={setUserSelectedId}
				/>
			</aside>

			<button
				ref={triggerRef}
				type="button"
				onClick={() => setIsOpen((value) => !value)}
				aria-controls="module-quick-actions-panel"
				aria-expanded={isOpen}
				aria-label={
					isOpen
						? "Cerrar acciones rápidas de documentos y evidencias"
						: "Abrir acciones rápidas de documentos y evidencias"
				}
				className="flex items-center gap-2 rounded-full bg-[var(--color-brand-blue)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-brand)] hover:bg-[var(--color-brand-blue-hover)]"
			>
				{mode === "document" ? (
					<FileUp aria-hidden="true" className="size-4" />
				) : (
					<Camera aria-hidden="true" className="size-4" />
				)}
				<span>Documentos y Evidencias</span>
			</button>
		</div>
	);
}

function QuickActionPanelBody({
	mode,
	orders,
	selectedOrder,
	selectedOrderId,
	isLoadingOrders,
	ordersError,
	onRetry,
	onSelectedOrderChange,
}: {
	mode: QuickActionMode;
	orders: QuickActionOrderOption[];
	selectedOrder: QuickActionOrderOption | undefined;
	selectedOrderId: string;
	isLoadingOrders: boolean;
	ordersError: string | null;
	onRetry: () => void;
	onSelectedOrderChange: (orderId: string) => void;
}) {
	if (isLoadingOrders) {
		return (
			<p
				role="status"
				className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text-secondary)]"
			>
				Cargando órdenes recientes…
			</p>
		);
	}

	if (ordersError) {
		return <QuickActionError message={ordersError} onRetry={onRetry} />;
	}

	if (orders.length === 0) {
		return (
			<p className="rounded-xl border border-[var(--color-warning-bg)] bg-[var(--color-warning-bg)]/60 px-3 py-2 text-xs text-[var(--color-warning)]">
				No hay órdenes activas para asociar documentos o evidencias.
			</p>
		);
	}

	if (mode === "document") {
		return <DocumentUploader orders={orders} defaultOrderId={selectedOrderId} />;
	}

	return (
		<QuickEvidenceUploader
			orders={orders}
			selectedOrder={selectedOrder}
			selectedOrderId={selectedOrderId}
			onSelectedOrderChange={onSelectedOrderChange}
		/>
	);
}

function QuickActionError({ message, onRetry }: { message: string; onRetry: () => void }) {
	return (
		<div
			role="alert"
			className="space-y-2 rounded-xl border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 px-3 py-2 text-xs text-[var(--color-danger)]"
		>
			<p>{message}</p>
			<button
				type="button"
				onClick={() => void onRetry()}
				className="inline-flex rounded-lg border border-[var(--color-danger)]/20 px-2 py-1 font-medium hover:bg-white/70"
			>
				Reintentar
			</button>
		</div>
	);
}

function QuickEvidenceUploader({
	orders,
	selectedOrder,
	selectedOrderId,
	onSelectedOrderChange,
}: {
	orders: QuickActionOrderOption[];
	selectedOrder: QuickActionOrderOption | undefined;
	selectedOrderId: string;
	onSelectedOrderChange: (orderId: string) => void;
}) {
	return (
		<div className="space-y-3">
			<label htmlFor="quick-actions-order" className="block text-sm">
				<span className="mb-1 block text-xs font-medium text-zinc-700">Orden asociada</span>
				<select
					id="quick-actions-order"
					value={selectedOrderId}
					onChange={(event) => onSelectedOrderChange(event.target.value)}
					className="w-full rounded-lg border border-[var(--border-default)] px-3 py-2 text-sm outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/20"
				>
					{orders.map((order) => (
						<option key={order.id} value={order.id}>
							{order.number} - {order.client}
						</option>
					))}
				</select>
			</label>

			{selectedOrder ? (
				<EvidenceUploader orderId={selectedOrder.id} />
			) : (
				<p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
					Selecciona una orden válida para cargar evidencia.
				</p>
			)}
		</div>
	);
}
