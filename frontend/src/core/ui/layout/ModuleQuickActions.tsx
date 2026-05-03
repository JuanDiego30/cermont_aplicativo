"use client";

import { useQuery } from "@tanstack/react-query";
import { Camera, FileUp, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "@/_shared/lib/http/api-client";
import { CreatableSelectField } from "@/core/ui/CreatableSelectField";
import { DocumentUploader } from "@/documents/ui/DocumentUploader";
import { EvidenceUploader } from "@/evidences/ui/EvidenceUploader";

export interface QuickActionOrderOption {
	id: string;
	number: string;
	client: string;
}

interface ModuleQuickActionsProps {
	initialOrders?: QuickActionOrderOption[];
}

type QuickActionMode = "document" | "evidence";
const QUICK_ACTION_ORDERS_LIMIT = 20;

interface QuickActionOrder {
	_id: string;
	code: string;
	clientName: string;
	client: { name: string } | false;
}

interface QuickActionsOrdersResponse {
	success: boolean;
	data: QuickActionOrder[];
	error: string;
}

export function ModuleQuickActions({ initialOrders = [] }: ModuleQuickActionsProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [mode, setMode] = useState<QuickActionMode>("document");
	const [userSelectedId, setUserSelectedId] = useState("");

	const triggerRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLElement>(null);
	const panelTitleRef = useRef<HTMLHeadingElement>(null);

	const closePanel = useCallback((restoreFocus = false) => {
		setIsOpen(false);

		if (restoreFocus && triggerRef.current) {
			const trigger = triggerRef.current;
			requestAnimationFrame(() => {
				trigger.focus();
			});
		}
	}, []);
	const {
		data: fetchedOrders,
		isLoading: isLoadingOrders,
		error: queryError,
		refetch: refetchOrders,
	} = useQuery<QuickActionOrderOption[], Error>({
		queryKey: ["quick-actions-orders"],
		queryFn: async ({ signal }) => {
			const payload = await apiClient.get<QuickActionsOrdersResponse>(
				`/orders?limit=${QUICK_ACTION_ORDERS_LIMIT}&sort=-createdAt`,
				{ signal },
			);

			if (!payload.data || !Array.isArray(payload.data)) {
				throw new Error(payload.error || "Recent orders could not be loaded.");
			}

			return payload.data.map((order: QuickActionOrder) => {
				const clientName = order.clientName;
				const client = order.client;
				const name = client ? client.name : "";
				return {
					id: order._id,
					number: order.code,
					client: clientName || name || "No client",
				};
			});
		},
		enabled: isOpen && initialOrders.length === 0,
		staleTime: 60 * 1000,
	});

	const loadOrders = () => refetchOrders();
	const ordersError = queryError instanceof Error ? queryError.message : "";
	const orders: QuickActionOrderOption[] = fetchedOrders ?? initialOrders;

	const selectedOrderId = useMemo(() => {
		const currentOrders = orders;
		if (userSelectedId && currentOrders.some((order: QuickActionOrderOption) => order.id === userSelectedId)) {
			return userSelectedId;
		}
		const firstOrder = currentOrders[0];
		return firstOrder ? firstOrder.id : "";
	}, [userSelectedId, orders]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		if (panelTitleRef.current) {
			panelTitleRef.current.focus();
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				closePanel(true);
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [closePanel, isOpen]);

	const hasOrders = orders.length > 0;
	const selectedOrder = useMemo(
		() => orders.find((order: QuickActionOrderOption) => order.id === selectedOrderId),
		[orders, selectedOrderId],
	);

	return (
		<div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-3 z-40 flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-3 lg:bottom-6 lg:right-6">
			<aside
				id="module-quick-actions-panel"
				ref={panelRef}
				hidden={!isOpen}
				aria-labelledby="module-quick-actions-title"
				className="max-h-[min(34rem,calc(100dvh-var(--header-height)-7rem))] w-[min(92vw,28rem)] overflow-y-auto rounded-lg border border-(--border-default) bg-(--surface-elevated) p-4 shadow-(--shadow-3)"
			>
				<div className="mb-3 flex items-center justify-between">
					<h2
						id="module-quick-actions-title"
						ref={panelTitleRef}
						tabIndex={-1}
						className="text-sm font-semibold text-(--text-primary)"
					>
						Quick module upload
					</h2>
					<button
						type="button"
						onClick={() => closePanel(true)}
						aria-label="Close quick actions"
						className="rounded-lg border border-(--border-default) p-1 text-(--text-secondary) hover:bg-(--surface-secondary)"
					>
						<X className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>

				<fieldset className="mb-4 grid grid-cols-2 gap-2 border-0 p-0">
					<legend className="sr-only">Upload type</legend>
					<button
						type="button"
						onClick={() => setMode("document")}
						aria-pressed={mode === "document"}
						className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
							mode === "document"
								? "bg-(--color-brand-blue) text-(--text-inverse) shadow-(--shadow-brand)"
								: "border border-(--border-default) text-(--text-secondary) hover:bg-(--surface-secondary)"
						}`}
					>
						External document
					</button>
					<button
						type="button"
						onClick={() => setMode("evidence")}
						aria-pressed={mode === "evidence"}
						className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
							mode === "evidence"
								? "bg-(--color-brand-blue) text-(--text-inverse) shadow-(--shadow-brand)"
								: "border border-(--border-default) text-(--text-secondary) hover:bg-(--surface-secondary)"
						}`}
					>
						Evidence photo
					</button>
				</fieldset>

				{isLoadingOrders ? (
					<p
						role="status"
						className="rounded-xl border border-(--border-default) bg-(--surface-secondary) px-3 py-2 text-xs text-(--text-secondary)"
					>
						Loading recent orders...
					</p>
				) : ordersError !== "" ? (
					<div
						role="alert"
						className="space-y-2 rounded-xl border border-(--color-danger-bg) bg-(--color-danger-bg)/60 px-3 py-2 text-xs text-(--color-danger)"
					>
						<p>{ordersError}</p>
						<button
							type="button"
							onClick={() => void loadOrders()}
							className="inline-flex rounded-lg border border-(--color-danger)/20 px-2 py-1 font-medium hover:bg-[var(--surface-primary)]"
						>
							Retry
						</button>
					</div>
				) : !hasOrders ? (
					<p className="rounded-xl border border-(--color-warning-bg) bg-(--color-warning-bg)/60 px-3 py-2 text-xs text-(--color-warning)">
						No active orders are available for documents or evidence.
					</p>
				) : mode === "document" ? (
					<DocumentUploader orders={orders} defaultOrderId={selectedOrderId} />
				) : (
					<div className="space-y-3">
						<CreatableSelectField
							id="quick-actions-order"
							label="Linked order"
							value={selectedOrderId}
							onValueChange={setUserSelectedId}
							options={orders.map((order: QuickActionOrderOption) => ({
								value: order.id,
								label: `${order.number} - ${order.client}`,
							}))}
							placeholder="Search work order or type a reference"
						/>

						{selectedOrder ? (
							<EvidenceUploader orderId={selectedOrder.id} />
						) : (
							<p className="rounded-xl border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 px-3 py-2 text-xs text-[var(--color-danger)]">
								Select a valid order before uploading evidence.
							</p>
						)}
					</div>
				)}
			</aside>

			<button
				ref={triggerRef}
				type="button"
				onClick={() => setIsOpen((value) => !value)}
				aria-controls="module-quick-actions-panel"
				aria-expanded={isOpen}
				aria-label={
					isOpen
						? "Close quick document and evidence actions"
						: "Open quick document and evidence actions"
				}
				className="flex h-11 items-center gap-2 rounded-full bg-(--color-brand-blue) px-3 text-sm font-semibold text-(--text-inverse) shadow-(--shadow-brand) transition-[background-color,color,box-shadow,transform] duration-150 hover:bg-(--color-brand-blue-hover) active:scale-[0.97] sm:px-4"
			>
				{mode === "document" ? (
					<FileUp aria-hidden="true" className="h-4 w-4" />
				) : (
					<Camera aria-hidden="true" className="h-4 w-4" />
				)}
				<span className="sr-only sm:not-sr-only">Documents and Evidence</span>
			</button>
		</div>
	);
}
