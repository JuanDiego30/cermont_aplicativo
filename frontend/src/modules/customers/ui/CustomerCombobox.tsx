"use client";

import { useCustomerSearch } from "@/modules/customers/queries";
import { Check, ChevronDown, Loader2, Plus, Search, X } from "lucide-react";
import {
	type KeyboardEvent,
	useCallback,
	useId,
	useRef,
	useState,
} from "react";

export interface CustomerResult {
	_id: string;
	name: string;
	nit: string;
	city?: string;
	status: string;
	contactName?: string;
	email?: string;
	phone?: string;
}

export interface CustomerComboboxProps {
	value?: CustomerResult | null;
	onChange: (customer: CustomerResult) => void;
	onCreateNew?: () => void;
	disabled?: boolean;
	required?: boolean;
	error?: string;
	placeholder?: string;
}

function highlightMatch(text: string, query: string) {
	if (!query) {
		return text;
	}
	const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const parts = text.split(new RegExp(`(${escaped})`, "gi"));
	let keyCounter = 0;
	return parts.map((part) => {
		keyCounter += 1;
		return part.toLowerCase() === query.toLowerCase() ? (
			<strong key={keyCounter} className="font-semibold text-[var(--color-brand)]">
				{part}
			</strong>
		) : (
			part
		);
	});
}

export function CustomerCombobox({
	value,
	onChange,
	onCreateNew,
	disabled = false,
	required = false,
	error,
	placeholder = "Buscar cliente por nombre o NIT...",
}: CustomerComboboxProps) {
	const comboboxId = useId();
	const listboxId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(-1);
	const [isTyping, setIsTyping] = useState(false);

	const shouldSearch = query.length >= 2;
	const { data, isLoading, isError } = useCustomerSearch(query, shouldSearch && isOpen);

	const rawResults = data?.data ?? [];
	const results: CustomerResult[] = rawResults.map((c) => ({
		_id: c._id ?? "",
		name: c.name,
		nit: c.nit,
		city: c.city,
		status: c.status ?? "active",
		...(c.contactName ? { contactName: c.contactName } : {}),
		...(c.email ? { email: c.email } : {}),
		...(c.phone ? { phone: c.phone } : {}),
	}));
	const totalResults = data?.pagination?.total ?? 0;

	const showDropdown = isOpen && shouldSearch;

	const handleInputChange = useCallback((input: string) => {
		setQuery(input);
		setIsOpen(true);
		setIsTyping(true);
		setActiveIndex(-1);
	}, []);

	const handleSelect = useCallback(
		(customer: CustomerResult) => {
			onChange(customer);
			setIsOpen(false);
			setQuery("");
			setActiveIndex(-1);
		},
		[onChange],
	);

	const handleClear = useCallback(() => {
		onChange({ _id: "", name: "", nit: "", city: "", status: "" });
		setQuery("");
		setIsOpen(false);
	}, [onChange]);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!isOpen && e.key === "ArrowDown") {
				setIsOpen(true);
				setIsTyping(true);
				setActiveIndex(-1);
				e.preventDefault();
				return;
			}
			if (!showDropdown) {
				return;
			}
			const itemCount = results.length + (onCreateNew ? 1 : 0);
			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					setActiveIndex((prev) => (prev < itemCount - 1 ? prev + 1 : 0));
					break;
				case "ArrowUp":
					e.preventDefault();
					setActiveIndex((prev) => (prev > 0 ? prev - 1 : itemCount - 1));
					break;
				case "Enter":
					e.preventDefault();
					if (activeIndex >= 0 && activeIndex < results.length) {
						handleSelect(results[activeIndex]);
					} else if (activeIndex === results.length && onCreateNew) {
						onCreateNew();
						setIsOpen(false);
					}
					break;
				case "Escape":
					e.preventDefault();
					setIsOpen(false);
					break;
			}
		},
		[isOpen, showDropdown, results, activeIndex, onCreateNew, handleSelect],
	);

	const handleBlur = useCallback((e: React.FocusEvent) => {
		if (!containerRef.current?.contains(e.relatedTarget as Node)) {
			setIsOpen(false);
			setQuery("");
		}
	}, []);

	return (
		<div
				ref={containerRef}
				role="none"
				tabIndex={-1}
				className="relative"
				onBlur={handleBlur}
			>
			<div
				className={`flex items-center rounded-[var(--radius-md)] border bg-[var(--surface-primary)] transition-colors focus-within:ring-2 focus-within:ring-[var(--color-focus-ring)]/20 ${
					error ? "border-[var(--color-danger)]" : "border-[var(--border-subtle)]"
				}`}
			>
				<Search className="ml-3 size-4 shrink-0 text-[var(--text-tertiary)]" aria-hidden="true" />
				<input
					ref={inputRef}
					id={comboboxId}
					role="combobox"
					aria-expanded={isOpen}
					aria-haspopup="listbox"
					aria-controls={listboxId}
					aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
					aria-autocomplete="list"
					aria-label="Buscar cliente"
					type="text"
					value={value && !isTyping ? `${value.name} · ${value.nit}` : query}
					onChange={(e) => handleInputChange(e.target.value)}
					onFocus={() => !value && setIsOpen(true)}
					onKeyDown={handleKeyDown}
					disabled={disabled}
					required={required}
					placeholder={value ? "" : placeholder}
					className="h-10 flex-1 bg-transparent px-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none disabled:cursor-not-allowed"
				/>
				{value?._id ? (
					<button
						type="button"
						onClick={handleClear}
						aria-label="Limpiar selección"
						className="mr-1 flex size-8 items-center justify-center rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
					>
						<X className="size-4" />
					</button>
				) : isLoading ? (
					<Loader2 className="mr-3 size-4 animate-spin text-[var(--text-tertiary)]" />
				) : (
					<ChevronDown className="mr-3 size-4 text-[var(--text-tertiary)]" aria-hidden="true" />
				)}
			</div>
			{error && <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>}

			{showDropdown && (
				<div
					id={listboxId}
					role="listbox"
					aria-label="Resultados de búsqueda"
					className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-lg"
				>
					{isLoading && (
						<div className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-secondary)]">
							<Loader2 className="size-4 animate-spin" />
							<span>Buscando...</span>
						</div>
					)}
					{isError && (
						<div className="px-4 py-3 text-sm text-[var(--color-danger)]">
							Error al buscar clientes
						</div>
					)}
					{!isLoading && !isError && results.length === 0 && (
						<div className="px-4 py-3 text-sm text-[var(--text-secondary)]">
							{query.length < 2
								? "Escribe al menos 2 caracteres"
								: "No se encontraron clientes"}
						</div>
					)}
					{!isLoading && !isError && results.length > 0 && (
						<>
							<div className="max-h-60 overflow-y-auto py-1">
								{results.map((customer, index) => (
									<button
										key={customer._id}
										id={`${listboxId}-option-${index}`}
										role="option"
										aria-selected={value?._id === customer._id}
										type="button"
										onClick={() => handleSelect(customer)}
										className={`flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-[var(--surface-secondary)] ${
											activeIndex === index ? "bg-[var(--surface-secondary)]" : ""
										}`}
									>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium text-[var(--text-primary)] truncate">
													{highlightMatch(customer.name, query)}
												</span>
												{value?._id === customer._id && (
													<Check className="size-4 shrink-0 text-[var(--color-brand)]" />
												)}
											</div>
											<div className="text-xs text-[var(--text-tertiary)] truncate">
												NIT {customer.nit}
												{customer.city ? ` · ${customer.city}` : ""}
											</div>
										</div>
										{customer.status !== "active" && (
											<span className="shrink-0 rounded-full bg-[var(--surface-warning)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-warning)]">
												{customer.status === "inactive" ? "Inactivo" : "Suspendido"}
											</span>
										)}
									</button>
								))}
							</div>
							{totalResults > results.length && (
								<div className="border-t border-[var(--border-subtle)] px-4 py-2 text-xs text-[var(--text-tertiary)]">
									{totalResults - results.length} resultados más...
								</div>
							)}
							{onCreateNew && (
								<>
									<div className="border-t border-[var(--border-subtle)]" />
									<button
										type="button"
										onClick={() => {
											onCreateNew();
											setIsOpen(false);
										}}
										className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--color-brand)] transition-colors hover:bg-[var(--surface-secondary)] ${
											activeIndex === results.length ? "bg-[var(--surface-secondary)]" : ""
										}`}
									>
										<Plus className="size-4" />
										Crear cliente nuevo
									</button>
								</>
							)}
						</>
					)}
				</div>
			)}
		</div>
	);
}
