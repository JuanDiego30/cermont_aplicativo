"use client";

import { useCustomerContacts, useCreateCustomerContact } from "@/modules/customers/queries";
import { Check, ChevronDown, Loader2, Plus } from "lucide-react";
import { useLayoutEffect, useReducer, useRef } from "react";
import type { ClientContact } from "../api/customers-api";

export interface ContactSelectProps {
	customerId: string | undefined;
	value?: string;
	onChange: (contactId: string | undefined, snapshot: { name: string; email?: string; phone?: string }) => void;
	onCreated?: (contactId: string, snapshot: { name: string; email?: string; phone?: string }) => void;
	legacyContact?: { name: string; email?: string; phone?: string };
	disabled?: boolean;
}

interface State {
	isOpen: boolean;
	showCreate: boolean;
	newName: string;
	newEmail: string;
	newPhone: string;
	createdContacts: ClientContact[];
}

type Action =
	| { type: "TOGGLE_OPEN" }
	| { type: "CLOSE" }
	| { type: "SHOW_CREATE" }
	| { type: "HIDE_CREATE" }
	| { type: "SET_NEW_NAME"; value: string }
	| { type: "SET_NEW_EMAIL"; value: string }
	| { type: "SET_NEW_PHONE"; value: string }
	| { type: "ADD_CREATED_CONTACT"; contact: ClientContact }
	| { type: "RESET_CREATE_FORM" };

const INITIAL_STATE: State = {
	isOpen: false,
	showCreate: false,
	newName: "",
	newEmail: "",
	newPhone: "",
	createdContacts: [],
};

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "TOGGLE_OPEN":
			return { ...state, isOpen: !state.isOpen };
		case "CLOSE":
			return { ...state, isOpen: false };
		case "SHOW_CREATE":
			return { ...state, showCreate: true };
		case "HIDE_CREATE":
			return { ...state, showCreate: false };
		case "SET_NEW_NAME":
			return { ...state, newName: action.value };
		case "SET_NEW_EMAIL":
			return { ...state, newEmail: action.value };
		case "SET_NEW_PHONE":
			return { ...state, newPhone: action.value };
		case "ADD_CREATED_CONTACT":
			return {
				...state,
				createdContacts: [
					action.contact,
					...state.createdContacts.filter((contact) => contact._id !== action.contact._id),
				],
			};
		case "RESET_CREATE_FORM":
			return {
				...state,
				isOpen: false,
				showCreate: false,
				newName: "",
				newEmail: "",
				newPhone: "",
			};
	}
}

export function ContactSelect({
	customerId,
	value,
	onChange,
	onCreated,
	legacyContact,
	disabled = false,
}: ContactSelectProps) {
	const { data: contacts, isLoading, isError } = useCustomerContacts(customerId);
	const createContact = useCreateCustomerContact();
	const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

	const fetchedContacts = contacts ?? [];
	const activeContacts = [
		...state.createdContacts.filter(
			(created) => !fetchedContacts.some((contact) => contact._id === created._id),
		),
		...fetchedContacts,
	].filter((contact) => contact.isActive !== false);
	const primaryContact = activeContacts.find((c) => c.isPrimary);
	const selectedContact = activeContacts.find((c) => c._id === value);
	const autoSelectedKey = useRef("");
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;
	const inheritedContact =
		activeContacts.length === 0 && legacyContact?.name.trim() ? legacyContact : false;

	useLayoutEffect(() => {
		if (isLoading || value) {
			return;
		}
		const automaticContact = primaryContact || inheritedContact;
		if (!automaticContact) {
			return;
		}
		const key = `${customerId}:${primaryContact?._id ?? `legacy:${automaticContact.name}`}`;
		if (autoSelectedKey.current === key) {
			return;
		}
		autoSelectedKey.current = key;
		const snapshot = {
			name: automaticContact.name,
			...(automaticContact.email ? { email: automaticContact.email } : {}),
			...(automaticContact.phone ? { phone: automaticContact.phone } : {}),
		};
		if (primaryContact?._id) {
			onChangeRef.current(primaryContact._id, snapshot);
		} else {
			onChangeRef.current("", snapshot);
		}
	}, [customerId, inheritedContact, isLoading, primaryContact, value]);

	const handleSelect = (contact: ClientContact) => {
		onChange(contact._id, {
			name: contact.name,
			email: contact.email,
			phone: contact.phone,
		});
		dispatch({ type: "CLOSE" });
	};

	const handleCreate = async () => {
		if (!customerId || !state.newName.trim()) {
			return;
		}
		createContact.mutate(
			{
				customerId,
				input: {
					name: state.newName.trim(),
					...(state.newEmail.trim() ? { email: state.newEmail.trim() } : {}),
					...(state.newPhone.trim() ? { phone: state.newPhone.trim() } : {}),
				},
			},
			{
				onSuccess: (created) => {
					if (created?._id) {
						const snapshot = {
							name: created.name,
							email: created.email,
							phone: created.phone,
						};
						dispatch({ type: "ADD_CREATED_CONTACT", contact: created });
						onChange(created._id, snapshot);
						onCreated?.(created._id, snapshot);
					}
					dispatch({ type: "RESET_CREATE_FORM" });
				},
			},
		);
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
				aria-label="Seleccionar contacto"
				onClick={() => dispatch({ type: "TOGGLE_OPEN" })}
				disabled={disabled || isLoading}
				className="flex h-10 w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)] disabled:cursor-not-allowed disabled:bg-[var(--surface-secondary)]"
			>
				{isLoading ? (
					<span className="flex items-center gap-2 text-[var(--text-tertiary)]">
						<Loader2 className="size-4 animate-spin" /> Cargando...
					</span>
				) : selectedContact ? (
					<span className="truncate">
						{selectedContact.name}{selectedContact.isPrimary ? " (principal)" : ""}
					</span>
				) : primaryContact ? (
					<span className="truncate text-[var(--text-tertiary)]">
						{primaryContact.name} (principal)
					</span>
				) : inheritedContact ? (
					<span className="truncate">{inheritedContact.name}</span>
				) : (
					<span className="text-[var(--text-tertiary)]">Seleccionar contacto</span>
				)}
				<ChevronDown className="size-4 shrink-0 text-[var(--text-tertiary)]" />
			</button>

			{state.isOpen && (
				<div className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-lg">
					{isError && (
						<div className="px-4 py-3 text-sm text-[var(--color-danger)]">
							Error al cargar contactos
						</div>
					)}
					{createContact.isError && (
						<div className="px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
							{createContact.error instanceof Error
								? createContact.error.message
								: "No se pudo crear el contacto"}
						</div>
					)}
					{!isError && activeContacts.length === 0 && !state.showCreate && (
						<div className="px-4 py-3 text-sm text-[var(--text-secondary)]">
							No hay contactos registrados
						</div>
					)}
					{!isError && activeContacts.length > 0 && (
						<div className="max-h-48 overflow-y-auto py-1">
							{activeContacts.map((contact) => (
								<button
									key={contact._id}
									type="button"
									onClick={() => handleSelect(contact)}
									className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-[var(--surface-secondary)]"
								>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
											<span className="truncate">{contact.name}</span>
											{contact.isPrimary && (
												<span className="shrink-0 rounded-full bg-[var(--color-brand)]/10 px-2 py-0.5 text-[10px] text-[var(--color-brand)]">
													Principal
												</span>
											)}
											{selectedContact?._id === contact._id && (
												<Check className="size-4 shrink-0 text-[var(--color-brand)]" />
											)}
										</div>
										{(contact.email || contact.phone) && (
											<div className="text-xs text-[var(--text-tertiary)]">
												{contact.email && <span>{contact.email}</span>}
												{contact.email && contact.phone && <span> · </span>}
												{contact.phone && <span>{contact.phone}</span>}
											</div>
										)}
									</div>
								</button>
							))}
						</div>
					)}

					{state.showCreate ? (
						<div className="border-t border-[var(--border-subtle)] p-3 space-y-2">
							<input
								type="text"
								value={state.newName}
								onChange={(e) => dispatch({ type: "SET_NEW_NAME", value: e.target.value })}
								placeholder="Nombre del contacto"
								aria-label="Nombre del contacto"
								className="h-9 w-full rounded-md border border-[var(--border-subtle)] px-2 text-sm"
							/>
							<input
								type="email"
								value={state.newEmail}
								onChange={(e) => dispatch({ type: "SET_NEW_EMAIL", value: e.target.value })}
								placeholder="Correo (opcional)"
								aria-label="Correo del contacto"
								className="h-9 w-full rounded-md border border-[var(--border-subtle)] px-2 text-sm"
							/>
							<input
								type="text"
								value={state.newPhone}
								onChange={(e) => dispatch({ type: "SET_NEW_PHONE", value: e.target.value })}
								placeholder="Teléfono (opcional)"
								aria-label="Teléfono del contacto"
								className="h-9 w-full rounded-md border border-[var(--border-subtle)] px-2 text-sm"
							/>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={handleCreate}
									disabled={createContact.isPending || !state.newName.trim()}
									className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-md bg-[var(--color-brand)] px-3 text-xs font-medium text-white disabled:opacity-50"
								>
									{createContact.isPending ? (
										<Loader2 className="size-3 animate-spin" />
									) : (
										<Plus className="size-3" />
									)}
									Crear
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
						<div className="border-t border-[var(--border-subtle)]">
							<button
								type="button"
								onClick={() => dispatch({ type: "SHOW_CREATE" })}
								className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--color-brand)] transition-colors hover:bg-[var(--surface-secondary)]"
							>
								<Plus className="size-4" />
								Crear contacto nuevo
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
