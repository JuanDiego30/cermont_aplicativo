'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Logo {
    src: string;
    alt: string;
}

interface LogoLoopProps {
    logos: Logo[];
    speed?: number; // seconds for one full loop
    className?: string;
    direction?: 'left' | 'right';
}

/**
 * LogoLoop - Infinite marquee for brands or partners.
 * Smooth scrolling animation using CSS transforms.
 */
export function LogoLoop({
    logos,
    speed = 20,
    className,
    direction = 'left',
}: LogoLoopProps) {
    // Duplicate logos for seamless loop
    const duplicatedLogos = [...logos, ...logos];

    return (
        <div
            className={cn(
                'relative overflow-hidden py-4',
                'before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-20 before:bg-gradient-to-r before:from-white before:to-transparent dark:before:from-gray-900',
                'after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-20 after:bg-gradient-to-l after:from-white after:to-transparent dark:after:from-gray-900',
                className
            )}
        >
            <motion.div
                className="flex items-center gap-12"
                animate={{
                    x: direction === 'left' ? [0, '-50%'] : ['-50%', 0],
                }}
                transition={{
                    duration: speed,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            >
                {duplicatedLogos.map((logo, index) => (
                    <div
                        key={`${logo.alt}-${index}`}
                        className="flex h-12 w-32 flex-shrink-0 items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                    >
                        <Image
                            src={logo.src}
                            alt={logo.alt}
                            width={128}
                            height={48}
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

export default LogoLoop;
