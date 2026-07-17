"use client";

import { useCreateCustomerServiceSite, useCustomerServiceSites } from "@/modules/customers/queries";
import { Check, ChevronDown, Loader2, MapPin, Plus } from "lucide-react";
import { useReducer } from "react";
import type { ServiceSite } from "../api/customers-api";

export interface ServiceSiteSelectProps {
	customerId: string | undefined;
	value?: string;
	onChange: (
		siteId: string | undefined,
		snapshot: { name: string; address?: string; city?: string },
		savePermanently?: boolean,
	) => void;
	disabled?: boolean;
	showTemporaryOption?: boolean;
}

interface State {
	isOpen: boolean;
	showCreate: boolean;
	showTemporary: boolean;
	newName: string;
	newAddress: string;
	newCity: string;
	tempName: string;
	tempAddress: string;
	tempCity: string;
	savePermanent: boolean;
}

type Action =
	| { type: "TOGGLE_OPEN" }
	| { type: "CLOSE" }
	| { type: "SHOW_CREATE" }
	| { type: "HIDE_CREATE" }
	| { type: "SHOW_TEMPORARY" }
	| { type: "HIDE_TEMPORARY" }
	| { type: "SET_NEW_NAME"; value: string }
	| { type: "SET_NEW_ADDRESS"; value: string }
	| { type: "SET_NEW_CITY"; value: string }
	| { type: "SET_TEMP_NAME"; value: string }
	| { type: "SET_TEMP_ADDRESS"; value: string }
	| { type: "SET_TEMP_CITY"; value: string }
	| { type: "TOGGLE_SAVE_PERMANENT" }
	| { type: "RESET_CREATE_FORM" }
	| { type: "RESET_TEMP_FORM" };

const INITIAL_STATE: State = {
	isOpen: false,
	showCreate: false,
	showTemporary: false,
	newName: "",
	newAddress: "",
	newCity: "",
	tempName: "",
	tempAddress: "",
	tempCity: "",
	savePermanent: false,
};

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "TOGGLE_OPEN":
			return { ...state, isOpen: !state.isOpen };
		case "CLOSE":
			return { ...state, isOpen: false };
		case "SHOW_CREATE":
			return { ...state, showCreate: true, showTemporary: false };
		case "HIDE_CREATE":
			return { ...state, showCreate: false };
		case "SHOW_TEMPORARY":
			return { ...state, showTemporary: true, showCreate: false };
		case "HIDE_TEMPORARY":
			return { ...state, showTemporary: false };
		case "SET_NEW_NAME":
			return { ...state, newName: action.value };
		case "SET_NEW_ADDRESS":
			return { ...state, newAddress: action.value };
		case "SET_NEW_CITY":
			return { ...state, newCity: action.value };
		case "SET_TEMP_NAME":
			return { ...state, tempName: action.value };
		case "SET_TEMP_ADDRESS":
			return { ...state, tempAddress: action.value };
		case "SET_TEMP_CITY":
			return { ...state, tempCity: action.value };
		case "TOGGLE_SAVE_PERMANENT":
			return { ...state, savePermanent: !state.savePermanent };
		case "RESET_CREATE_FORM":
			return { ...state, showCreate: false, newName: "", newAddress: "", newCity: "" };
		case "RESET_TEMP_FORM":
			return { ...state, showTemporary: false, tempName: "", tempAddress: "", tempCity: "", savePermanent: false };
	}
}

export function ServiceSiteSelect({
	customerId,
	value,
	onChange,
	disabled = false,
	showTemporaryOption = true,
}: ServiceSiteSelectProps) {
	const { data: sites, isLoading, isError } = useCustomerServiceSites(customerId);
	const createSite = useCreateCustomerServiceSite();
	const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

	const activeSites = (sites ?? []).filter((s) => s.isActive !== false);
	const selectedSite = activeSites.find((s) => s._id === value);

	const handleSelect = (site: ServiceSite) => {
		onChange(site._id, {
			name: site.name,
			address: site.address,
			city: site.city,
		});
		dispatch({ type: "CLOSE" });
	};

	const handleCreate = async () => {
		if (!customerId || !state.newName.trim()) {
			return;
		}
		createSite.mutate(
			{
				customerId,
				input: {
					name: state.newName.trim(),
					address: state.newAddress.trim() || "Sin dirección",
					city: state.newCity.trim() || void 0,
				},
			},
			{
				onSuccess: () => {
					dispatch({ type: "RESET_CREATE_FORM" });
				},
			},
		);
	};

	const handleTemporary = () => {
		if (!state.tempName.trim()) {
			return;
		}
		onChange(
			void 0,
			{
				name: state.tempName.trim(),
				address: state.tempAddress.trim() || void 0,
				city: state.tempCity.trim() || void 0,
			},
			state.savePermanent,
		);
		dispatch({ type: "RESET_TEMP_FORM" });
		dispatch({ type: "CLOSE" });
	};

	if (!customerId) {
		return (
			<div className="h-10 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 text-sm text-[var(--text-tertiary)] flex items-center">
				Seleccione un cliente primero
			</div>
		);
	}

	return (
		<div className="relative">
			<button
				type="button"
				aria-label="Seleccionar sede"
				onClick={() => dispatch({ type: "TOGGLE_OPEN" })}
				disabled={disabled || isLoading}
				className="flex h-10 w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)] disabled:cursor-not-allowed disabled:bg-[var(--surface-secondary)]"
			>
				{isLoading ? (
					<span className="flex items-center gap-2 text-[var(--text-tertiary)]">
						<Loader2 className="size-4 animate-spin" /> Cargando...
					</span>
				) : selectedSite ? (
					<span className="truncate">{selectedSite.name}</span>
				) : (
					<span className="text-[var(--text-tertiary)]">Seleccionar sede</span>
				)}
				<ChevronDown className="size-4 shrink-0 text-[var(--text-tertiary)]" />
			</button>

			{state.isOpen && (
				<div className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-lg">
					{isError && (
						<div className="px-4 py-3 text-sm text-[var(--color-danger)]">
							Error al cargar sedes
						</div>
					)}

					{state.showTemporary ? (
						<div className="p-3 space-y-2">
							<p className="text-xs font-medium text-[var(--text-secondary)]">
								Sitio temporal (no registrado como sede)
							</p>
							<input
								type="text"
								value={state.tempName}
								onChange={(e) => dispatch({ type: "SET_TEMP_NAME", value: e.target.value })}
								placeholder="Nombre del sitio"
								aria-label="Nombre del sitio temporal"
								className="h-9 w-full rounded-md border border-[var(--border-subtle)] px-2 text-sm"
							/>
							<input
								type="text"
								value={state.tempAddress}
								onChange={(e) => dispatch({ type: "SET_TEMP_ADDRESS", value: e.target.value })}
								placeholder="Dirección (opcional)"
								aria-label="Dirección del sitio temporal"
								className="h-9 w-full rounded-md border border-[var(--border-subtle)] px-2 text-sm"
							/>
							<input
								type="text"
								value={state.tempCity}
								onChange={(e) => dispatch({ type: "SET_TEMP_CITY", value: e.target.value })}
								placeholder="Ciudad (opcional)"
								aria-label="Ciudad del sitio temporal"
								className="h-9 w-full rounded-md border border-[var(--border-subtle)] px-2 text-sm"
							/>
							<label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
								<input
									type="checkbox"
									checked={state.savePermanent}
									onChange={() => dispatch({ type: "TOGGLE_SAVE_PERMANENT" })}
									className="rounded border-[var(--border-subtle)]"
								/>
								Guardar este sitio en el cliente
							</label>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={handleTemporary}
									disabled={!state.tempName.trim()}
									className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-md bg-[var(--color-brand)] px-3 text-xs font-medium text-white disabled:opacity-50"
								>
									<MapPin className="size-3" />
									Usar sitio temporal
								</button>
								<button
									type="button"
									onClick={() => dispatch({ type: "HIDE_TEMPORARY" })}
									className="h-8 rounded-md border border-[var(--border-subtle)] px-3 text-xs text-[var(--text-secondary)]"
								>
									Volver
								</button>
							</div>
						</div>
					) : state.showCreate ? (
						<div className="p-3 space-y-2">
							<input
								type="text"
								value={state.newName}
								onChange={(e) => dispatch({ type: "SET_NEW_NAME", value: e.target.value })}
								placeholder="Nombre de la sede"
								aria-label="Nombre de la sede"
								className="h-9 w-full rounded-md border border-[var(--border-subtle)] px-2 text-sm"
							/>
							<input
								type="text"
								value={state.newAddress}
								onChange={(e) => dispatch({ type: "SET_NEW_ADDRESS", value: e.target.value })}
								placeholder="Dirección (opcional)"
								aria-label="Dirección de la sede"
								className="h-9 w-full rounded-md border border-[var(--border-subtle)] px-2 text-sm"
							/>
							<input
								type="text"
								value={state.newCity}
								onChange={(e) => dispatch({ type: "SET_NEW_CITY", value: e.target.value })}
								placeholder="Ciudad (opcional)"
								aria-label="Ciudad de la sede"
								className="h-9 w-full rounded-md border border-[var(--border-subtle)] px-2 text-sm"
							/>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={handleCreate}
									disabled={createSite.isPending || !state.newName.trim()}
									className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-md bg-[var(--color-brand)] px-3 text-xs font-medium text-white disabled:opacity-50"
								>
									{createSite.isPending ? (
										<Loader2 className="size-3 animate-spin" />
									) : (
										<Plus className="size-3" />
									)}
									Crear sede
								</button>
								<button
									type="button"
									onClick={() => dispatch({ type: "HIDE_CREATE" })}
									className="h-8 rounded-md border border-[var(--border-subtle)] px-3 text-xs text-[var(--text-secondary)]"
								>
									Cancelar
								</button>
							</div>
						</div>
					) : (
						<>
							{!isError && activeSites.length === 0 && (
								<div className="px-4 py-3 text-sm text-[var(--text-secondary)]">
									No hay sedes registradas para este cliente.
								</div>
							)}
							{!isError && activeSites.length === 0 && showTemporaryOption && (
								<button
									type="button"
									onClick={() => {
										onChange(void 0, { name: "Sin sede definida" });
										dispatch({ type: "CLOSE" });
									}}
									className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--color-brand)] transition-colors hover:bg-[var(--surface-secondary)]"
								>
									<MapPin className="size-4" />
									Sin sede definida
								</button>
							)}
							{!isError && activeSites.length > 0 && (
								<div className="max-h-48 overflow-y-auto py-1">
									{activeSites.map((site) => (
										<button
											key={site._id}
											type="button"
											onClick={() => handleSelect(site)}
											className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-[var(--surface-secondary)]"
										>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
													<MapPin className="size-3.5 shrink-0 text-[var(--text-tertiary)]" />
													<span className="truncate">{site.name}</span>
													{selectedSite?._id === site._id && (
														<Check className="size-4 shrink-0 text-[var(--color-brand)]" />
													)}
												</div>
												{(site.address || site.city) && (
													<div className="truncate pl-6 text-xs text-[var(--text-tertiary)]">
														{site.address && <span>{site.address}</span>}
														{site.address && site.city && <span> · </span>}
														{site.city && <span>{site.city}</span>}
													</div>
												)}
											</div>
										</button>
									))}
								</div>
							)}
							<div className="border-t border-[var(--border-subtle)]">
								{showTemporaryOption && (
									<button
										type="button"
										onClick={() => dispatch({ type: "SHOW_TEMPORARY" })}
										className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-secondary)]"
									>
										<MapPin className="size-4" />
										Sitio temporal / no registrado
									</button>
								)}
								<button
									type="button"
									onClick={() => dispatch({ type: "SHOW_CREATE" })}
									className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--color-brand)] transition-colors hover:bg-[var(--surface-secondary)]"
								>
									<Plus className="size-4" />
									Crear sede nueva
								</button>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}
