/**
 * ARCHIVO: Table.tsx
 * FUNCION: Sistema de componentes de tabla responsivo para listados de datos
 * IMPLEMENTACION: Componentes atómicos (Table, TableHeader, TableBody, TableRow, TableCell) con wrapper responsive
 * DEPENDENCIAS: react, @/lib/cn
 * EXPORTS: TableWrapper, Table, TableHeader, TableBody, TableRow, TableCell
 */
import React, { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface TableProps {
    children: ReactNode;
    className?: string;
}

interface TableHeaderProps {
    children: ReactNode;
    className?: string;
}

interface TableBodyProps {
    children: ReactNode;
    className?: string;
}

interface TableRowProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

interface TableCellProps {
    children: ReactNode;
    isHeader?: boolean;
    className?: string;
    colSpan?: number;
}

// Wrapper component for responsive tables
export const TableWrapper: React.FC<TableProps> = ({ children, className }) => {
    return (
        <div className={cn(
            "overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3",
            className
        )}>
            <div className="overflow-x-auto">
                {children}
            </div>
        </div>
    );
};

export const Table: React.FC<TableProps> = ({ children, className }) => {
    return (
        <table className={cn("min-w-full divide-y divide-gray-200 dark:divide-gray-800", className)}>
            {children}
        </table>
    );
};

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
    return (
        <thead className={cn("bg-gray-50 dark:bg-gray-900", className)}>
            {children}
        </thead>
    );
};

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
    return (
        <tbody className={cn("divide-y divide-gray-100 dark:divide-gray-800", className)}>
            {children}
        </tbody>
    );
};

export const TableRow: React.FC<TableRowProps> = ({ children, className, onClick }) => {
    return (
        <tr
            className={cn(
                "transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50",
                onClick && "cursor-pointer",
                className
            )}
            onClick={onClick}
        >
            {children}
        </tr>
    );
};

export const TableCell: React.FC<TableCellProps> = ({
    children,
    isHeader = false,
    className,
    colSpan,
}) => {
    if (isHeader) {
        return (
            <th
                className={cn(
                    "px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:px-6",
                    className
                )}
                colSpan={colSpan}
            >
                {children}
            </th>
        );
    }

    return (
        <td
            className={cn(
                "whitespace-nowrap px-5 py-4 text-sm text-gray-700 dark:text-gray-300 sm:px-6",
                className
            )}
            colSpan={colSpan}
        >
            {children}
        </td>
    );
};
