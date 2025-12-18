'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
    name: string;
    role?: string;
    avatar?: string;
    stats?: Array<{ label: string; value: string | number }>;
    className?: string;
}

/**
 * ProfileCard with gradient border, floating avatar, and statistical badges.
 * Enhanced with hover animations using framer-motion.
 */
export function ProfileCard({
    name,
    role = 'Usuario',
    avatar,
    stats = [],
    className,
}: ProfileCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                'relative overflow-hidden rounded-2xl',
                'bg-gradient-to-br from-brand-500/10 via-purple-500/10 to-pink-500/10',
                'border border-gray-200 dark:border-gray-800',
                'p-6',
                className
            )}
        >
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500 via-purple-500 to-pink-500 opacity-20 blur-xl" />

            {/* Content */}
            <div className="relative z-10">
                {/* Avatar */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white dark:border-gray-900 shadow-xl"
                >
                    {avatar ? (
                        <Image
                            src={avatar}
                            alt={name}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-purple-600 text-3xl font-bold text-white">
                            {name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </motion.div>

                {/* Name & Role */}
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {role}
                    </p>
                </div>

                {/* Stats */}
                {stats.length > 0 && (
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="text-center"
                            >
                                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                                    {stat.value}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default ProfileCard;
