"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

interface DropdownProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
    isOpen,
    onClose,
    children,
    className = "",
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !(event.target as HTMLElement).closest('.dropdown-toggle')
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className={cn(
                "absolute z-40 right-0 mt-2 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900",
                className
            )}
        >
            {children}
        </div>
    );
};

interface DropdownItemProps {
    children: React.ReactNode;
    onItemClick?: () => void;
    className?: string;
    tag?: "button" | "a";
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
    children,
    onItemClick,
    className = "",
    tag = "button",
}) => {
    const Tag = tag;

    return (
        <Tag
            onClick={onItemClick}
            className={cn(
                "block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5",
                className
            )}
        >
            {children}
        </Tag>
    );
};

export default Dropdown;
