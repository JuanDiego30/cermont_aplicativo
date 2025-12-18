'use client';

import { useCallback, useRef, type MouseEvent, type ReactNode } from 'react';

interface ClickSparkProps {
    children: ReactNode;
    sparkColor?: string;
    sparkCount?: number;
    sparkSize?: number;
    duration?: number;
    className?: string;
}

/**
 * ClickSpark - Particle explosion effect on click.
 * Creates flying spark particles from the click point.
 */
export function ClickSpark({
    children,
    sparkColor = '#fbbf24', // amber-400
    sparkCount = 8,
    sparkSize = 10,
    duration = 400,
    className,
}: ClickSparkProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const createSpark = useCallback(
        (x: number, y: number) => {
            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const relX = x - rect.left;
            const relY = y - rect.top;

            for (let i = 0; i < sparkCount; i++) {
                const spark = document.createElement('div');
                spark.style.cssText = `
                    position: absolute;
                    left: ${relX}px;
                    top: ${relY}px;
                    width: ${sparkSize}px;
                    height: ${sparkSize}px;
                    background: ${sparkColor};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                `;

                container.appendChild(spark);

                const angle = (360 / sparkCount) * i;
                const distance = 50 + Math.random() * 30;
                const tx = Math.cos((angle * Math.PI) / 180) * distance;
                const ty = Math.sin((angle * Math.PI) / 180) * distance;

                spark.animate(
                    [
                        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                        {
                            transform: `translate(${tx}px, ${ty}px) scale(0)`,
                            opacity: 0,
                        },
                    ],
                    {
                        duration,
                        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    }
                ).onfinish = () => spark.remove();
            }
        },
        [sparkCount, sparkSize, sparkColor, duration]
    );

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        createSpark(e.clientX, e.clientY);
    };

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            className={`relative ${className || ''}`}
            style={{ position: 'relative', overflow: 'hidden' }}
        >
            {children}
        </div>
    );
}

export default ClickSpark;
