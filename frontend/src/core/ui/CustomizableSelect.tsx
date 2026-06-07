"use client";

import { ChevronDown, Plus } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useId, useMemo, useReducer, useRef } from "react";
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

// ─── Subcomponents ──────────────────────────────────────────────────────────

interface DropdownSearchProps {
	value: string;
	onChange: (q: string) => void;
	onKeyDown: (e: React.KeyboardEvent) => void;
	dataTestId: string;
}

function DropdownSearch({ value, onChange, onKeyDown, dataTestId }: DropdownSearchProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	return (
		<div className="p-2 border-b border-border-default">
			<input
				ref={inputRef}
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Buscar…"
				aria-label="Buscar opciones"
				className="w-full rounded-lg border border-border-default bg-surface-secondary px-3 py-1.5 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-(--color-focus-ring)"
				onKeyDown={onKeyDown}
				data-testid={`${dataTestId}-search`}
			/>
		</div>
	);
}

interface OptionButtonProps {
	option: SelectOption;
	isSelected: boolean;
	onSelect: (value: string) => void;
	dataTestId: string;
}

function OptionButton({ option, isSelected, onSelect, dataTestId }: OptionButtonProps) {
	return (
		<button
			key={option.value}
			type="button"
			onClick={() => onSelect(option.value)}
			data-testid={`${dataTestId}-option-${option.value}`}
			className={cn(
				"w-full px-3 py-2 text-left text-sm transition-colors hover:bg-surface-secondary",
				isSelected ? "bg-brand/10 text-brand font-medium" : "text-(--text-primary)",
			)}
		>
			{option.label}
		</button>
	);
}

interface DropdownMenuProps {
	options: SelectOption[];
	filteredOptions: SelectOption[];
	value: string;
	allowCustom: boolean;
	customOptionLabel: string;
	searchQuery: string;
	showSearch: boolean;
	onSearch: (q: string) => void;
	onSelect: (value: string) => void;
	onKeyDown: (e: React.KeyboardEvent) => void;
	dataTestId: string;
}

function DropdownMenu({
	filteredOptions,
	value,
	allowCustom,
	customOptionLabel,
	searchQuery,
	showSearch,
	onSearch,
	onSelect,
	onKeyDown,
	dataTestId,
}: DropdownMenuProps) {
	return (
		<div
			className="absolute z-50 mt-1 w-full rounded-xl border border-border-strong bg-surface-primary shadow-lg"
			data-testid={`${dataTestId}-dropdown`}
		>
			{showSearch && (
				<DropdownSearch
					value={searchQuery}
					onChange={onSearch}
					onKeyDown={onKeyDown}
					dataTestId={dataTestId}
				/>
			)}

			<div className="max-h-60 overflow-y-auto py-1">
				{filteredOptions.length === 0 ? (
					<div className="px-3 py-2 text-sm text-(--text-muted)">
						{searchQuery ? "Sin resultados" : "Sin opciones disponibles"}
					</div>
				) : (
					filteredOptions.map((option) => (
						<OptionButton
							key={option.value}
							option={option}
							isSelected={value === option.value}
							onSelect={onSelect}
							dataTestId={dataTestId}
						/>
					))
				)}

				{allowCustom && (
					<>
						<div className="border-t border-border-default my-1" />
						<button
							type="button"
							onClick={() => onSelect("__custom__")}
							data-testid={`${dataTestId}-custom-option`}
							className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand transition-colors hover:bg-surface-secondary"
						>
							<Plus className="size-4" />
							{customOptionLabel}
						</button>
					</>
				)}
			</div>
		</div>
	);
}

interface CustomTextInputProps {
	id: string;
	value: string;
	isCustomMode: boolean;
	disabled?: boolean;
	required?: boolean;
	name?: string;
	size: "sm" | "md" | "lg";
	error?: boolean;
	allowCatalogSuggestion: boolean;
	catalogSuggestionLabel: string;
	proposeForCatalog: boolean;
	customText: string;
	onChange: (text: string) => void;
	onBlur: () => void;
	onReset: () => void;
	onProposalChange: (checked: boolean) => void;
	dataTestId: string;
}

function CustomTextInput({
	id,
	value,
	isCustomMode,
	disabled,
	required,
	name,
	size,
	error,
	allowCatalogSuggestion,
	catalogSuggestionLabel,
	proposeForCatalog,
	customText,
	onChange,
	onBlur,
	onReset,
	onProposalChange,
	dataTestId,
}: CustomTextInputProps) {
	return (
		<div className="space-y-2">
			<div className="relative">
				<input
					id={id}
					type="text"
					value={isCustomMode ? customText : value}
					onChange={(e) => {
						if (isCustomMode) {
							onChange(e.target.value);
						}
					}}
					onBlur={onBlur}
					placeholder="Escriba su opción personalizada…"
					aria-label="Opción personalizada"
					disabled={disabled}
					required={required}
					name={name}
					data-testid={`${dataTestId}-custom-input`}
					className={cn(
						"w-full rounded-full border bg-surface-primary px-4 text-(--text-primary) transition-[border-color,box-shadow] duration-150 placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-focus-ring)/20 disabled:cursor-not-allowed disabled:bg-surface-secondary",
						SIZE_CLASSES[size],
						error
							? "border-(--color-danger) focus:border-(--color-danger)"
							: "border-border-strong focus:border-(--color-focus-ring)",
					)}
				/>
				<button
					type="button"
					onClick={onReset}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand hover:underline"
					disabled={disabled}
					data-testid={`${dataTestId}-back-to-list`}
				>
					Volver a lista
				</button>
			</div>

			{allowCatalogSuggestion && isCustomMode && customText.trim() && (
				<label className="inline-flex items-center gap-2 cursor-pointer text-sm text-(--text-secondary)">
					<input
						type="checkbox"
						checked={proposeForCatalog}
						onChange={(e) => onProposalChange(e.target.checked)}
						className="rounded border-border-strong text-brand"
					/>
					{catalogSuggestionLabel}
				</label>
			)}
		</div>
	);
}

// ─── Main Component ──────────────────────────────────────────────────────────

type SelectState = {
	isOpen: boolean;
	isCustomMode: boolean;
	customText: string;
	proposeForCatalog: boolean;
	searchQuery: string;
};

type SelectAction =
	| { type: "TOGGLE_OPEN"; payload?: boolean }
	| { type: "SET_SEARCH"; payload: string }
	| { type: "ENTER_CUSTOM_MODE"; payload: { text: string } }
	| { type: "SELECT_OPTION" }
	| { type: "UPDATE_CUSTOM_TEXT"; payload: string }
	| { type: "TOGGLE_PROPOSAL"; payload: boolean }
	| { type: "RESET" };

function selectReducer(state: SelectState, action: SelectAction): SelectState {
	switch (action.type) {
		case "TOGGLE_OPEN":
			return {
				...state,
				isOpen: action.payload ?? !state.isOpen,
				searchQuery: action.payload === false ? "" : state.searchQuery,
			};
		case "SET_SEARCH":
			return { ...state, searchQuery: action.payload };
		case "ENTER_CUSTOM_MODE":
			return {
				...state,
				isCustomMode: true,
				isOpen: false,
				customText: action.payload.text,
			};
		case "SELECT_OPTION":
			return {
				...state,
				isCustomMode: false,
				isOpen: false,
				customText: "",
				proposeForCatalog: false,
			};
		case "UPDATE_CUSTOM_TEXT":
			return { ...state, customText: action.payload };
		case "TOGGLE_PROPOSAL":
			return { ...state, proposeForCatalog: action.payload };
		case "RESET":
			return {
				...state,
				isCustomMode: false,
				customText: "",
				proposeForCatalog: false,
			};
		default:
			return state;
	}
}

export function CustomizableSelect({
	options,
	value = "",
	onChange,
	allowCustom = true,
	customOptionLabel = "Personalizado",
	catalogSuggestionLabel = "Proponer para catálogo",
	allowCatalogSuggestion = false,
	placeholder = "Seleccionar…",
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
	const containerRef = useRef<HTMLDivElement>(null);

	const [state, dispatch] = useReducer(selectReducer, {
		isOpen: false,
		isCustomMode: false,
		customText: "",
		proposeForCatalog: false,
		searchQuery: "",
	});

	const { isOpen, isCustomMode, customText, proposeForCatalog, searchQuery } = state;

	const isPredefined = useMemo(() => options.some((opt) => opt.value === value), [options, value]);

	const selectedLabel = useMemo(() => {
		if (!value) {
			return "";
		}
		const option = options.find((opt) => opt.value === value);
		return option ? option.label : value;
	}, [options, value]);

	const filteredOptions = useMemo(() => {
		if (!searchQuery) {
			return options;
		}
		const q = searchQuery.toLowerCase();
		return options.filter(
			(opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q),
		);
	}, [options, searchQuery]);

	const handleSelect = useCallback(
		(selectedValue: string) => {
			if (selectedValue === "__custom__") {
				dispatch({
					type: "ENTER_CUSTOM_MODE",
					payload: { text: !isPredefined && value ? value : "" },
				});
				return;
			}
			dispatch({ type: "SELECT_OPTION" });
			onChange?.(selectedValue, false);
		},
		[isPredefined, value, onChange],
	);

	const handleCustomTextChange = useCallback(
		(text: string) => {
			dispatch({ type: "UPDATE_CUSTOM_TEXT", payload: text });
			onChange?.(text, true);
		},
		[onChange],
	);

	const handleCustomBlur = useCallback(() => {
		if (!customText.trim() && required) {
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
				dispatch({ type: "TOGGLE_OPEN", payload: false });
			}
		},
		[isOpen, filteredOptions, handleSelect],
	);

	const handleReset = useCallback(() => {
		dispatch({ type: "RESET" });
		onChange?.("", false);
	}, [onChange]);

	const isCustomValue = !isPredefined && value !== "";
	const showDropdownSearch = options.length > 8;

	return (
		<div className={cn("space-y-2", className)} ref={containerRef}>
			{label && (
				<label htmlFor={selectId} className="block text-sm font-medium text-(--text-secondary)">
					{label}
					{required ? <span className="ml-1 text-(--color-danger)">*</span> : null}
				</label>
			)}

			{isCustomMode || isCustomValue ? (
				<CustomTextInput
					id={selectId}
					value={value}
					isCustomMode={isCustomMode}
					disabled={disabled}
					required={required}
					name={name}
					size={size}
					error={error}
					allowCatalogSuggestion={allowCatalogSuggestion}
					catalogSuggestionLabel={catalogSuggestionLabel}
					proposeForCatalog={proposeForCatalog}
					customText={customText}
					onChange={handleCustomTextChange}
					onBlur={handleCustomBlur}
					onReset={handleReset}
					onProposalChange={(checked) => dispatch({ type: "TOGGLE_PROPOSAL", payload: checked })}
					dataTestId={dataTestId}
				/>
			) : (
				<div className="relative">
					<button
						id={selectId}
						type="button"
						onClick={() => !disabled && dispatch({ type: "TOGGLE_OPEN" })}
						disabled={disabled}
						name={name}
						data-testid={dataTestId}
						className={cn(
							"w-full flex items-center justify-between rounded-full border bg-surface-primary text-left transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-2 focus:ring-(--color-focus-ring)/20 disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-(--text-muted)",
							SIZE_CLASSES[size],
							value ? "text-(--text-primary)" : "text-(--text-muted)",
							error
								? "border-(--color-danger) focus:border-(--color-danger)"
								: "border-border-strong focus:border-(--color-focus-ring)",
						)}
					>
						<span className="truncate">{selectedLabel || placeholder}</span>
						<ChevronDown
							className={cn(
								"size-4 shrink-0 transition-transform text-(--text-tertiary)",
								isOpen && "rotate-180",
							)}
						/>
					</button>

					{isOpen && (
						<DropdownMenu
							options={options}
							filteredOptions={filteredOptions}
							value={value}
							allowCustom={allowCustom}
							customOptionLabel={customOptionLabel}
							searchQuery={searchQuery}
							showSearch={showDropdownSearch}
							onSearch={(q) => dispatch({ type: "SET_SEARCH", payload: q })}
							onSelect={handleSelect}
							onKeyDown={handleKeyDown}
							dataTestId={dataTestId}
						/>
					)}
				</div>
			)}

			{error && errorMessage && (
				<p className="text-xs font-medium text-(--color-danger)" role="alert">
					{errorMessage}
				</p>
			)}
			{helperText && !error && <p className="text-xs text-(--text-tertiary)">{helperText}</p>}
		</div>
	);
}
