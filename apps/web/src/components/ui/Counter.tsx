'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface CounterProps {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    className?: string;
}

/**
 * Counter component that animates from 0 to the target value.
 * Uses framer-motion spring animation for smooth counting effect.
 */
export function Counter({
    value,
    duration = 2,
    prefix = '',
    suffix = '',
    decimals = 0,
    className = '',
}: CounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const [isInView, setIsInView] = useState(false);

    // Spring animation for smooth counting
    const springValue = useSpring(0, {
        bounce: 0,
        duration: duration * 1000,
    });

    // Transform the spring value to display format
    const displayValue = useTransform(springValue, (current) =>
        current.toFixed(decimals)
    );

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isInView) {
                    setIsInView(true);
                    springValue.set(value);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [springValue, value, isInView]);

    // Reset animation when value changes
    useEffect(() => {
        if (isInView) {
            springValue.set(value);
        }
    }, [value, springValue, isInView]);

    return (
        <span ref={ref} className={className}>
            {prefix}
            <motion.span>{displayValue}</motion.span>
            {suffix}
        </span>
    );
}

export default Counter;
