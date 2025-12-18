'use client';

import { motion } from 'framer-motion';
import { type ReactNode, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface MagnetButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    className?: string;
    strength?: number; // How strong the magnetic pull is (default: 50)
    activeScale?: number; // Scale when pressed (default: 0.95)
}

export function MagnetButton({
    children,
    className,
    strength = 30,
    activeScale = 0.95,
    onClick,
    ...props
}: MagnetButtonProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current!.getBoundingClientRect();

        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);

        setPosition({ x, y });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const { x, y } = position;

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            animate={{ x: x / (100 / strength), y: y / (100 / strength) }}
            transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
            whileTap={{ scale: activeScale }}
            className={cn('relative inline-flex items-center justify-center cursor-pointer', className)}
            {...props as any}
        >
            {children}
        </motion.div>
    );
}
