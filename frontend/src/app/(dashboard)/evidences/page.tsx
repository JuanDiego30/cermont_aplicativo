"use client";

import type { Evidence, EvidenceType, Order } from "@cermont/shared-types";
import { Camera, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { Button } from "@/core/ui/Button";
import { CreatableSelectField } from "@/core/ui/CreatableSelectField";
import { useEvidences } from "@/evidences/queries";
import { useOrders } from "@/orders/queries";
import { EvidenceCard } from "./EvidenceCard";
import { EvidenceTableRow } from "./EvidenceTableRow";
import { EVIDENCE_LABELS, type EvidenceFilter, toEvidenceFilter } from "./evidence-helpers";

const FIELD_CLASS =
	"w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/15";

const FILTER_OPTIONS: Array<{ value: EvidenceFilter; label: string }> = [
	{ value: "all", label: "All stages" },
	...Object.entries(EVIDENCE_LABELS).map(([value, label]) => ({
		value: value as EvidenceType,
		label,
	})),
];

type EvidenceCounts = Record<"total" | EvidenceType, number>;

function buildCounts(items: Evidence[]): EvidenceCounts {
	return items.reduce<EvidenceCounts>(
		(accumulator, evidence) => {
			accumulator.total += 1;
			accumulator[evidence.type] += 1;
			return accumulator;
		},
		{
			total: 0,
			before: 0,
			during: 0,
			after: 0,
			defect: 0,
			safety: 0,
			signature: 0,
		} as EvidenceCounts,
	);
}

export default function EvidencesPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Read state from URL
	const selectedOrderId = searchParams.get("orderId") || "";
	const rawFilter = searchParams.get("filter") || "all";
	const filter = toEvidenceFilter(rawFilter);

	const [searchTerm, setSearchTerm] = useState("");

	// Queries
	const { data: ordersData, isLoading: isLoadingOrders } = useOrders();

	const orders = ordersData?.items || [];
	const isKnownSelectedOrder = orders.some((order) => order._id === selectedOrderId);
	const evidenceOrderId = isKnownSelectedOrder ? selectedOrderId : "";
	const { data: evidences = [], isLoading: isLoadingEvidences } = useEvidences(evidenceOrderId);

	// Filtering logic
	const filteredEvidences = useMemo(() => {
		if (!evidences) {
			return [];
		}

		return evidences.filter((evidence: Evidence) => {
			// Filter by stage
			if (filter !== "all" && evidence.type !== filter) {
				return false;
			}

			// Filter by search term (filename or description)
			if (searchTerm) {
				const term = searchTerm.toLowerCase();
				const filename = (evidence.filename || "").toLowerCase();
				const description = (evidence.description || "").toLowerCase();
				return filename.includes(term) || description.includes(term);
			}

			return true;
		});
	}, [evidences, filter, searchTerm]);

	const counts = useMemo(() => buildCounts(evidences || []), [evidences]);

	// Handlers
	function handleOrderChange(orderId: string) {
		const params = new URLSearchParams(searchParams);
		if (orderId) {
			params.set("orderId", orderId);
		} else {
			params.delete("orderId");
		}
		router.push(`/evidences?${params.toString()}`);
	}

	function handleFilterChange(newFilter: EvidenceFilter) {
		const params = new URLSearchParams(searchParams);
		params.set("filter", newFilter);
		router.push(`/evidences?${params.toString()}`);
	}

	function handleSearch(e: FormEvent) {
		e.preventDefault();
		// Local search handled by useMemo, no URL update needed for performance
	}

	const isLoading = isLoadingOrders || (!!evidenceOrderId && isLoadingEvidences);

	return (
		<section
			className="flex h-full flex-col p-4 md:p-6 lg:p-8"
			aria-labelledby="evidences-page-title"
		>
			{/* Header */}
			<header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1
						id="evidences-page-title"
						className="text-2xl font-bold tracking-tight text-[var(--text-primary)]"
					>
						Field evidence
					</h1>
					<p className="mt-1 text-sm text-[var(--text-tertiary)]">
						Manage visual records and traceability by work order.
					</p>
				</div>

				<div className="flex items-center gap-3">
					<Button asChild variant="outline">
						<Link href="/orders">View orders</Link>
					</Button>
					<Button asChild>
						<Link href={selectedOrderId ? `/orders/${selectedOrderId}?tab=execution` : "/orders"}>
							<Camera className="mr-2 h-4 w-4" />
							Upload evidence
						</Link>
					</Button>
				</div>
			</header>

			{/* Filter Bar */}
			<div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-sm md:grid-cols-3">
				{/* Order Selection */}
				<div className="space-y-1.5">
					<CreatableSelectField
						id="order-select"
						label="Filter by work order"
						value={selectedOrderId}
						onValueChange={handleOrderChange}
						options={[
							{ value: "", label: "Select an order..." },
							...orders.map((order: Order) => ({
								value: order._id,
								label: `${order.code} - ${order.assetName}`,
							})),
						]}
						placeholder="Search work order or enter a reference"
					/>
				</div>

				{/* Category Filter */}
				<div className="space-y-1.5">
					<label
						htmlFor="filter-select"
						className="text-xs font-medium text-[var(--text-secondary)]"
					>
						Process stage
					</label>
					<select
						id="filter-select"
						className={FIELD_CLASS}
						value={filter}
						onChange={(e) => handleFilterChange(e.target.value as EvidenceFilter)}
					>
						{FILTER_OPTIONS.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</div>

				{/* Keyword Search */}
				<div className="space-y-1.5">
					<label
						htmlFor="search-input"
						className="text-xs font-medium text-[var(--text-secondary)]"
					>
						Search by name or description
					</label>
					<form onSubmit={handleSearch} className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
						<input
							id="search-input"
							type="text"
							className={`${FIELD_CLASS} pl-9`}
							placeholder="Example: grinder, signature..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</form>
				</div>
			</div>

			{/* Stats Summary (Conditional) */}
			{selectedOrderId && evidences.length > 0 && (
				<div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
					<StatPill label="All" count={counts.total} active={filter === "all"} />
					<StatPill
						label={EVIDENCE_LABELS.before}
						count={counts.before}
						active={filter === "before"}
					/>
					<StatPill
						label={EVIDENCE_LABELS.during}
						count={counts.during}
						active={filter === "during"}
					/>
					<StatPill
						label={EVIDENCE_LABELS.after}
						count={counts.after}
						active={filter === "after"}
					/>
					<StatPill
						label={EVIDENCE_LABELS.defect}
						count={counts.defect}
						active={filter === "defect"}
					/>
					<StatPill
						label={EVIDENCE_LABELS.safety}
						count={counts.safety}
						active={filter === "safety"}
					/>
					<StatPill
						label={EVIDENCE_LABELS.signature}
						count={counts.signature}
						active={filter === "signature"}
					/>
				</div>
			)}

			{/* Content Area */}
			<div className="flex-1 overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)]">
				{isLoading ? (
					<div className="flex h-64 flex-col items-center justify-center space-y-4">
						<Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-blue)]" />
						<p className="text-sm text-[var(--text-tertiary)]">Loading evidence...</p>
					</div>
				) : !selectedOrderId ? (
					<div className="flex h-64 flex-col items-center justify-center space-y-4 px-4 text-center">
						<div className="rounded-full bg-[var(--surface-primary)] p-4 text-[var(--text-tertiary)]">
							<Search className="h-8 w-8" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-[var(--text-primary)]">
								No order selected
							</h3>
							<p className="mx-auto max-w-xs text-sm text-[var(--text-tertiary)]">
								Select a work order above to review its photographic and traceability evidence.
							</p>
						</div>
					</div>
				) : filteredEvidences.length === 0 ? (
					<div className="flex h-64 flex-col items-center justify-center space-y-4 px-4 text-center">
						<div className="rounded-full bg-[var(--surface-primary)] p-4 text-[var(--text-tertiary)]">
							<Camera className="h-8 w-8" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-[var(--text-primary)]">No results</h3>
							<p className="mx-auto max-w-xs text-sm text-[var(--text-tertiary)]">
								{searchTerm || filter !== "all"
									? "No evidence matches the selected criteria."
									: "This work order does not have registered evidence yet."}
							</p>
						</div>
					</div>
				) : (
					/* View Toggle / List */
					<div className="h-full overflow-y-auto p-4 md:p-6">
						{/* Table View (Desktop) */}
						<div className="hidden lg:block">
							<div className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-primary)]">
								<table className="w-full text-left text-sm">
									<thead className="bg-[var(--surface-tertiary)] text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
										<tr>
											<th className="px-6 py-3">Stage</th>
											<th className="px-6 py-3">File</th>
											<th className="px-6 py-3">Order</th>
											<th className="px-6 py-3">Captured at</th>
											<th className="px-6 py-3 text-right">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-[var(--border-subtle)]">
										{filteredEvidences.map((evidence: Evidence) => (
											<EvidenceTableRow key={evidence._id} evidence={evidence} />
										))}
									</tbody>
								</table>
							</div>
						</div>

						{/* Grid View (Mobile/Tablet) */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
							{filteredEvidences.map((evidence: Evidence) => (
								<EvidenceCard key={evidence._id} evidence={evidence} />
							))}
						</div>
					</div>
				)}
			</div>
		</section>
	);
}

function StatPill({ label, count, active }: { label: string; count: number; active: boolean }) {
	return (
		<div
			className={`flex items-center justify-between rounded-full px-3 py-1 text-xs font-medium transition-colors ${
				active
					? "bg-[var(--color-brand-blue)] text-[var(--text-inverse)]"
					: "bg-[var(--surface-primary)] text-[var(--text-secondary)] border border-[var(--border-default)]"
			}`}
		>
			<span className="mr-2 truncate">{label}</span>
			<span
				className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] ${
					active ? "bg-[oklch(0.99_0.006_260_/_0.2)]" : "bg-[var(--surface-secondary)]"
				}`}
			>
				{count}
			</span>
		</div>
	);
}
