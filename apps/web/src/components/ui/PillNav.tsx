'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PillNavItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface PillNavProps {
    items: PillNavItem[];
    defaultActiveId?: string;
    onChange?: (id: string) => void;
    className?: string;
}

/**
 * PillNav - Segmented control with sliding active state.
 * Uses framer-motion layoutId for smooth pill animation.
 */
export function PillNav({
    items,
    defaultActiveId,
    onChange,
    className,
}: PillNavProps) {
    const [activeId, setActiveId] = useState(defaultActiveId || items[0]?.id);

    const handleClick = (id: string) => {
        setActiveId(id);
        onChange?.(id);
    };

    return (
        <div
            className={cn(
                'inline-flex items-center gap-1 rounded-full',
                'bg-gray-100 dark:bg-gray-800 p-1',
                className
            )}
        >
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleClick(item.id)}
                    className={cn(
                        'relative z-10 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                        activeId === item.id
                            ? 'text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    )}
                >
                    {activeId === item.id && (
                        <motion.div
                            layoutId="pill-indicator"
                            className="absolute inset-0 rounded-full bg-brand-600"
                            transition={{
                                type: 'spring',
                                bounce: 0.2,
                                duration: 0.6,
                            }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        {item.icon}
                        {item.label}
                    </span>
                </button>
            ))}
        </div>
    );
}

export default PillNav;
