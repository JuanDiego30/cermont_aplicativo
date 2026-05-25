"use client";

import { ChevronDown, Plus } from "lucide-react";
import { type ReactNode, useCallback, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
	value: string;
	label: string;
}

export interface CustomizableSelectProps {
	/** Predefined options */
	options: SelectOption[];
	/** Current value (predefined value or custom text) */
	value?: string;
	/** Called when value changes */
	onChange?: (value: string, isCustom: boolean) => void;
	/** Allow custom values via "Personalizado" option */
	allowCustom?: boolean;
	/** Label for the custom option (default: "Personalizado") */
	customOptionLabel?: string;
	/** Label for proposing to catalog */
	catalogSuggestionLabel?: string;
	/** Allow proposing custom value to catalog */
	allowCatalogSuggestion?: boolean;
	/** Placeholder text when no option selected */
	placeholder?: string;
	/** Error state */
	error?: boolean;
	/** Disabled state */
	disabled?: boolean;
	/** Required field */
	required?: boolean;
	/** Field name */
	name?: string;
	/** Field label */
	label?: ReactNode;
	/** Helper text */
	helperText?: string;
	/** Error message */
	errorMessage?: string;
	/** Size variant */
	size?: "sm" | "md" | "lg";
	/** Additional class name */
	className?: string;
	/** Unique id for testing */
	"data-testid"?: string;
}

const SIZE_CLASSES = {
	sm: "h-9 px-3 text-sm",
	md: "h-10 px-4 text-sm",
	lg: "h-12 px-6 text-base",
} as const;

export function CustomizableSelect({
	options,
	value = "",
	onChange,
	allowCustom = true,
	customOptionLabel = "Personalizado",
	catalogSuggestionLabel = "Proponer para catálogo",
	allowCatalogSuggestion = false,
	placeholder = "Seleccionar...",
	error,
	disabled,
	required,
	name,
	label,
	helperText,
	errorMessage,
	size = "md",
	className,
	"data-testid": dataTestId = "customizable-select",
}: CustomizableSelectProps) {
	const selectId = useId();
	const [isOpen, setIsOpen] = useState(false);
	const [isCustomMode, setIsCustomMode] = useState(false);
	const [customText, setCustomText] = useState("");
	const [proposeForCatalog, setProposeForCatalog] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const isPredefined = useMemo(() => {
		return options.some((opt) => opt.value === value);
	}, [options, value]);

	const selectedLabel = useMemo(() => {
		if (!value) return "";
		const option = options.find((opt) => opt.value === value);
		return option ? option.label : value;
	}, [options, value]);

	const filteredOptions = useMemo(() => {
		if (!searchQuery) return options;
		const q = searchQuery.toLowerCase();
		return options.filter(
			(opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q),
		);
	}, [options, searchQuery]);

	const handleSelect = useCallback(
		(selectedValue: string) => {
			if (selectedValue === "__custom__") {
				setIsCustomMode(true);
				setIsOpen(false);
				// If there was a previous custom value, restore it
				if (!isPredefined && value) {
					setCustomText(value);
				} else {
					setCustomText("");
				}
				return;
			}

			setIsCustomMode(false);
			setIsOpen(false);
			setCustomText("");
			setProposeForCatalog(false);
			onChange?.(selectedValue, false);
		},
		[isPredefined, value, onChange],
	);

	const handleCustomTextChange = useCallback(
		(text: string) => {
			setCustomText(text);
			onChange?.(text, true);
		},
		[onChange],
	);

	const handleCustomBlur = useCallback(() => {
		if (!customText.trim() && required) {
			// Don't clear if required - validation will handle
			return;
		}
		if (customText.trim()) {
			onChange?.(customText.trim(), true);
		}
	}, [customText, required, onChange]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && isOpen) {
				e.preventDefault();
				if (filteredOptions.length === 1) {
					handleSelect(filteredOptions[0].value);
				}
			}
			if (e.key === "Escape") {
				setIsOpen(false);
			}
		},
		[isOpen, filteredOptions, handleSelect],
	);

	const isCustomValue = !isPredefined && value !== "";

	return (
		<div className={cn("space-y-2", className)} ref={containerRef}>
			{label ? (
				<label
					htmlFor={selectId}
					className="block text-sm font-medium text-[var(--text-secondary)]"
				>
					{label}
					{required ? <span className="ml-1 text-[var(--color-danger)]">*</span> : null}
				</label>
			) : null}

			{/* Custom text input mode */}
			{isCustomMode || isCustomValue ? (
				<div className="space-y-2">
					<div className="relative">
						<input
							id={selectId}
							type="text"
							value={isCustomMode ? customText : value}
							onChange={(e) => {
								if (isCustomMode) {
									handleCustomTextChange(e.target.value);
								}
							}}
							onBlur={handleCustomBlur}
							placeholder="Escriba su opción personalizada..."
							disabled={disabled}
							required={required}
							name={name}
							data-testid={`${dataTestId}-custom-input`}
							className={cn(
								"w-full rounded-full border bg-[var(--surface-primary)] px-4 text-[var(--text-primary)] transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]/20 disabled:cursor-not-allowed disabled:bg-[var(--surface-secondary)]",
								SIZE_CLASSES[size],
								error
									? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
									: "border-[var(--border-medium)] focus:border-[var(--color-focus-ring)]",
							)}
						/>
						<button
							type="button"
							onClick={() => {
								setIsCustomMode(false);
								setCustomText("");
								onChange?.("", false);
							}}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-brand)] hover:underline"
							disabled={disabled}
							data-testid={`${dataTestId}-back-to-list`}
						>
							Volver a lista
						</button>
					</div>

					{/* Catalog suggestion checkbox */}
					{allowCatalogSuggestion && isCustomMode && customText.trim() ? (
						<label className="inline-flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
							<input
								type="checkbox"
								checked={proposeForCatalog}
								onChange={(e) => setProposeForCatalog(e.target.checked)}
								className="rounded border-[var(--border-medium)] text-[var(--color-brand)]"
							/>
							{catalogSuggestionLabel}
						</label>
					) : null}
				</div>
			) : (
				/* Dropdown mode */
				<div className="relative">
					<button
						id={selectId}
						type="button"
						onClick={() => !disabled && setIsOpen(!isOpen)}
						disabled={disabled}
						aria-required={required}
						name={name}
						data-testid={dataTestId}
						className={cn(
							"w-full flex items-center justify-between rounded-full border bg-[var(--surface-primary)] text-left transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]/20 disabled:cursor-not-allowed disabled:bg-[var(--surface-secondary)] disabled:text-[var(--text-muted)]",
							SIZE_CLASSES[size],
							value ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]",
							error
								? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
								: "border-[var(--border-medium)] focus:border-[var(--color-focus-ring)]",
						)}
					>
						<span className="truncate">{selectedLabel || placeholder}</span>
						<ChevronDown
							className={cn(
								"size-4 shrink-0 transition-transform text-[var(--text-tertiary)]",
								isOpen && "rotate-180",
							)}
						/>
					</button>

					{/* Dropdown */}
					{isOpen ? (
						<div
							className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--border-medium)] bg-[var(--surface-primary)] shadow-lg"
							data-testid={`${dataTestId}-dropdown`}
						>
							{/* Search */}
							{options.length > 8 ? (
								<div className="p-2 border-b border-[var(--border-subtle)]">
									<input
										type="text"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Buscar..."
										className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--color-focus-ring)]"
										autoFocus
										onKeyDown={handleKeyDown}
										data-testid={`${dataTestId}-search`}
									/>
								</div>
							) : null}

							{/* Options */}
							<div className="max-h-60 overflow-y-auto py-1">
								{filteredOptions.length === 0 ? (
									<div className="px-3 py-2 text-sm text-[var(--text-muted)]">
										{searchQuery ? "Sin resultados" : "Sin opciones disponibles"}
									</div>
								) : (
									filteredOptions.map((option) => (
										<button
											key={option.value}
											type="button"
											onClick={() => handleSelect(option.value)}
											data-testid={`${dataTestId}-option-${option.value}`}
											className={cn(
												"w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--surface-secondary)]",
												value === option.value
													? "bg-[var(--color-brand)]/10 text-[var(--color-brand)] font-medium"
													: "text-[var(--text-primary)]",
											)}
										>
											{option.label}
										</button>
									))
								)}

								{/* Personalizado option */}
								{allowCustom ? (
									<>
										<div className="border-t border-[var(--border-subtle)] my-1" />
										<button
											type="button"
											onClick={() => handleSelect("__custom__")}
											data-testid={`${dataTestId}-custom-option`}
											className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-brand)] transition-colors hover:bg-[var(--surface-secondary)]"
										>
											<Plus className="size-4" />
											{customOptionLabel}
										</button>
									</>
								) : null}
							</div>
						</div>
					) : null}
				</div>
			)}

			{/* Error / Helper text */}
			{error && errorMessage ? (
				<p className="text-xs font-medium text-[var(--color-danger)]" role="alert">
					{errorMessage}
				</p>
			) : null}
			{helperText && !error ? (
				<p className="text-xs text-[var(--text-tertiary)]">{helperText}</p>
			) : null}
		</div>
	);
}
