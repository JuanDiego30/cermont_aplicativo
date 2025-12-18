'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselProps {
    children: ReactNode[];
    autoPlay?: boolean;
    autoPlayInterval?: number;
    showArrows?: boolean;
    showDots?: boolean;
    className?: string;
}

/**
 * Carousel - Touch-optimized slider with swipe gestures.
 * Uses framer-motion for smooth transitions.
 */
export function Carousel({
    children,
    autoPlay = false,
    autoPlayInterval = 5000,
    showArrows = true,
    showDots = true,
    className,
}: CarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const slideCount = children.length;

    const nextSlide = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % slideCount);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
    };

    const goToSlide = (index: number) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 50;
        if (info.offset.x > threshold) {
            prevSlide();
        } else if (info.offset.x < -threshold) {
            nextSlide();
        }
    };

    // Auto-play
    useEffect(() => {
        if (autoPlay) {
            intervalRef.current = setInterval(nextSlide, autoPlayInterval);
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoPlay, autoPlayInterval]);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    };

    return (
        <div className={cn('relative overflow-hidden', className)}>
            {/* Slides Container */}
            <div className="relative h-full w-full">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: 'spring', stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={handleDragEnd}
                        className="w-full cursor-grab active:cursor-grabbing"
                    >
                        {children[currentIndex]}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            {showArrows && slideCount > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 dark:bg-gray-900/80 p-2 shadow-lg backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 dark:bg-gray-900/80 p-2 shadow-lg backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 transition-colors"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {showDots && slideCount > 1 && (
                <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                    {children.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                'h-2 w-2 rounded-full transition-all duration-300',
                                currentIndex === index
                                    ? 'w-6 bg-brand-600'
                                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Carousel;
