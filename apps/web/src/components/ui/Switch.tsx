// 📁 web/src/components/ui/Switch.tsx
// Diseño TailAdmin - Componente Switch/Toggle mejorado

import React from 'react';
import { cn } from '@/lib/cn';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  className?: string;
  id?: string;
}

const sizeClasses = {
  sm: {
    track: 'h-5 w-9',
    thumb: 'h-4 w-4',
    translateActive: 'translate-x-4',
    translateInactive: 'translate-x-0.5',
  },
  md: {
    track: 'h-6 w-11',
    thumb: 'h-5 w-5',
    translateActive: 'translate-x-5',
    translateInactive: 'translate-x-0.5',
  },
  lg: {
    track: 'h-7 w-14',
    thumb: 'h-6 w-6',
    translateActive: 'translate-x-7',
    translateInactive: 'translate-x-0.5',
  },
};

export const Switch: React.FC<SwitchProps> = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  className,
  id,
}) => {
  const sizes = sizeClasses[size];

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <label
      className={cn(
        'inline-flex cursor-pointer select-none items-center gap-3',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={handleClick}
          disabled={disabled}
          className="sr-only"
          aria-checked={checked}
          role="switch"
        />
        <div
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="switch"
          aria-checked={checked}
          className={cn(
            'block rounded-full transition-colors duration-200',
            sizes.track,
            checked
              ? 'bg-brand-500'
              : 'bg-gray-200 dark:bg-gray-700'
          )}
        >
          <div
            className={cn(
              'absolute top-0.5 rounded-full bg-white shadow-theme-sm transition-transform duration-200',
              sizes.thumb,
              checked ? sizes.translateActive : sizes.translateInactive
            )}
          />
        </div>
      </div>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {description && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
};

// Switch Group para múltiples opciones
export interface SwitchGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const SwitchGroup: React.FC<SwitchGroupProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
};
