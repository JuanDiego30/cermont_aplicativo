// Componente wrapper para backgrounds personalizados
'use client';

import { ReactNode } from 'react';
import LiquidEther, { LiquidEtherProps } from '@/components/ui/LiquidEther';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps extends Partial<LiquidEtherProps> {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

export default function AnimatedBackground({
  children,
  className,
  containerClassName,
  colors = ['#0072FF', '#004A7C', '#00A878'],
  ...liquidEtherProps
}: AnimatedBackgroundProps) {
  return (
    <div className={cn('relative min-h-screen', containerClassName)}>
      {/* Background animado */}
      <div className={cn('absolute inset-0 -z-10', className)}>
        <LiquidEther
          colors={colors}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
          {...liquidEtherProps}
        />
      </div>

      {/* Contenido */}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
}

// Hook para usar backgrounds predefinidos
export const useBackgroundPresets = () => ({
  default: ['#0072FF', '#004A7C', '#00A878'],
  ocean: ['#1E3A8A', '#3B82F6', '#06B6D4'],
  sunset: ['#DC2626', '#EA580C', '#F59E0B'],
  forest: ['#166534', '#16A34A', '#65A30D'],
  purple: ['#7C3AED', '#A855F7', '#C084FC'],
  minimal: ['#374151', '#6B7280', '#9CA3AF'],
});
