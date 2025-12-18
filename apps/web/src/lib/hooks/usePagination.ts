/**
 * @hook usePagination
 * @description Reusable pagination logic
 * Eliminates duplicate pagination code across list pages
 */
'use client';

import { useState, useMemo, useCallback } from 'react';

export interface UsePaginationOptions {
    initialPage?: number;
    initialPageSize?: number;
    totalItems: number;
}

export interface UsePaginationReturn {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    setPageSize: (size: number) => void;
    pageNumbers: number[];
    getPageData: <T>(data: T[]) => T[];
}

export function usePagination({
    initialPage = 1,
    initialPageSize = 10,
    totalItems,
}: UsePaginationOptions): UsePaginationReturn {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSizeState] = useState(initialPageSize);

    const totalPages = useMemo(() =>
        Math.max(1, Math.ceil(totalItems / pageSize)),
        [totalItems, pageSize]
    );

    const startIndex = useMemo(() =>
        (currentPage - 1) * pageSize,
        [currentPage, pageSize]
    );

    const endIndex = useMemo(() =>
        Math.min(startIndex + pageSize, totalItems),
        [startIndex, pageSize, totalItems]
    );

    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    const goToPage = useCallback((page: number) => {
        const validPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(validPage);
    }, [totalPages]);

    const nextPage = useCallback(() => {
        if (hasNextPage) {
            setCurrentPage(prev => prev + 1);
        }
    }, [hasNextPage]);

    const prevPage = useCallback(() => {
        if (hasPrevPage) {
            setCurrentPage(prev => prev - 1);
        }
    }, [hasPrevPage]);

    const setPageSize = useCallback((size: number) => {
        setPageSizeState(size);
        setCurrentPage(1); // Reset to first page when page size changes
    }, []);

    // Generate page numbers for pagination UI
    const pageNumbers = useMemo(() => {
        const pages: number[] = [];
        const maxVisible = 5;

        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    }, [currentPage, totalPages]);

    // Helper to paginate data client-side
    const getPageData = useCallback(<T,>(data: T[]): T[] => {
        return data.slice(startIndex, endIndex);
    }, [startIndex, endIndex]);

    return {
        currentPage,
        pageSize,
        totalPages,
        totalItems,
        startIndex,
        endIndex,
        hasNextPage,
        hasPrevPage,
        goToPage,
        nextPage,
        prevPage,
        setPageSize,
        pageNumbers,
        getPageData,
    };
}
