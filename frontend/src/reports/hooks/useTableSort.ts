"use client";

import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc" | "none";
type SortValue = string | number | Date;
type SortAccessor<TItem> = (item: TItem) => SortValue;

interface UseTableSortOptions<TItem, TKey extends string> {
	data: TItem[];
	initialSortKey: TKey;
	accessors: Record<TKey, SortAccessor<TItem>>;
}

interface UseTableSortReturn<TItem, TKey extends string> {
	sortedData: TItem[];
	sortKey: TKey;
	sortDirection: SortDirection;
	toggleSort: (key: TKey) => void;
}

function compareSortValues(left: SortValue, right: SortValue): number {
	if (left instanceof Date && right instanceof Date) {
		return left.getTime() - right.getTime();
	}

	if (typeof left === "number" && typeof right === "number") {
		return left - right;
	}

	return String(left).localeCompare(String(right), "es-CO", {
		numeric: true,
		sensitivity: "base",
	});
}

export function useTableSort<TItem, TKey extends string>({
	data,
	initialSortKey,
	accessors,
}: UseTableSortOptions<TItem, TKey>): UseTableSortReturn<TItem, TKey> {
	const [sortKey, setSortKey] = useState<TKey>(initialSortKey);
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	const toggleSort = (key: TKey) => {
		if (sortKey !== key) {
			setSortKey(key);
			setSortDirection("asc");
			return;
		}

		if (sortDirection === "asc") {
			setSortDirection("desc");
			return;
		}

		if (sortDirection === "desc") {
			setSortDirection("none");
			return;
		}

		setSortDirection("asc");
	};

	const sortedData = useMemo(() => {
		if (sortDirection === "none") {
			return data;
		}

		const direction = sortDirection === "asc" ? 1 : -1;
		const accessor = accessors[sortKey];

		return [...data].sort((left, right) => {
			return compareSortValues(accessor(left), accessor(right)) * direction;
		});
	}, [accessors, data, sortDirection, sortKey]);

	return { sortedData, sortKey, sortDirection, toggleSort };
}
