// 📁 web/src/components/ui/Avatar.tsx
// Diseño TailAdmin - Componente Avatar mejorado

import React from 'react';
import { cn } from '@/lib/cn';
import Image from 'next/image';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-14 w-14 text-lg',
  '2xl': 'h-16 w-16 text-xl',
};

const statusClasses = {
  online: 'bg-success-500',
  offline: 'bg-gray-400',
  busy: 'bg-error-500',
  away: 'bg-warning-500',
};

const statusSizeClasses = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
  '2xl': 'h-4 w-4',
};

// Genera color de fondo basado en el nombre
const getBackgroundColor = (name: string) => {
  const colors = [
    'from-brand-400 to-brand-600',
    'from-success-400 to-success-600',
    'from-error-400 to-error-600',
    'from-warning-400 to-warning-600',
    'from-blue-light-400 to-blue-light-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// Obtiene las iniciales del nombre
const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  status,
  className,
}) => {
  const initials = name ? getInitials(name) : 'U';
  const bgColor = getBackgroundColor(name || 'User');

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <div
          className={cn(
            'overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
            sizeClasses[size]
          )}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-linear-to-br font-semibold text-white',
            bgColor,
            sizeClasses[size]
          )}
        >
          {initials}
        </div>
      )}

      {status && (
        <span
          className={cn(
            'absolute right-0 bottom-0 rounded-full border-2 border-white dark:border-gray-900',
            statusClasses[status],
            statusSizeClasses[size]
          )}
        />
      )}
    </div>
  );
};

// Grupo de avatares
export interface AvatarGroupProps {
  avatars: AvatarProps[];
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'md',
  className,
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          size={size}
          className="ring-2 ring-white dark:ring-gray-900"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-gray-100 font-medium text-gray-600 ring-2 ring-white dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-900',
            sizeClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
