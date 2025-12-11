// 📁 web/src/components/ui/Badge.tsx

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Map color strings to variants
const colorToVariant: Record<string, 'success' | 'warning' | 'info' | 'destructive' | 'default'> = {
  green: 'success',
  yellow: 'warning',
  blue: 'info',
  red: 'destructive',
  gray: 'default',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  color?: string;
}

function Badge({ className, variant, size, color, ...props }: BadgeProps) {
  // If color is provided, map it to a variant
  const resolvedVariant = color ? (colorToVariant[color] || variant) : variant;
  
  return <div className={cn(badgeVariants({ variant: resolvedVariant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
