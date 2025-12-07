"use client";
import React, { useState } from "react";
import { cn } from "@/lib/cn";

interface ChartTabProps {
    tabs?: string[];
    defaultTab?: string;
    onChange?: (tab: string) => void;
}

const ChartTab: React.FC<ChartTabProps> = ({
    tabs = ["Mensual", "Trimestral", "Anual"],
    defaultTab,
    onChange
}) => {
    const [selected, setSelected] = useState(defaultTab || tabs[0]);

    const handleTabClick = (tab: string) => {
        setSelected(tab);
        onChange?.(tab);
    };

    return (
        <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => handleTabClick(tab)}
                    className={cn(
                        "px-3 py-2 font-medium w-full rounded-md text-sm hover:text-gray-900 dark:hover:text-white transition-colors",
                        selected === tab
                            ? "shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                            : "text-gray-500 dark:text-gray-400"
                    )}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

export default ChartTab;
