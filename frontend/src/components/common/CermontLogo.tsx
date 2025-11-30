'use client';

import Image from 'next/image';
import Link from 'next/link';

/**
 * Logo variants available
 */
export type LogoVariant = 'default' | 'transparent' | 'white';

/**
 * Frame styles for the logo
 */
export type LogoFrame = 'none' | 'circle' | 'rounded' | 'square';

/**
 * Size presets
 */
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

interface CermontLogoProps {
  /** Logo variant to display */
  variant?: LogoVariant;
  /** Frame style around the logo */
  frame?: LogoFrame;
  /** Size preset or custom dimensions */
  size?: LogoSize;
  /** Custom width (only when size='custom') */
  width?: number;
  /** Custom height (only when size='custom') */
  height?: number;
  /** Whether to show the company name below */
  showName?: boolean;
  /** Custom class for the container */
  className?: string;
  /** Whether to wrap in a link */
  href?: string;
  /** Show shadow on frame */
  withShadow?: boolean;
  /** Alt text for accessibility */
  alt?: string;
}

const LOGO_SOURCES: Record<LogoVariant, string> = {
  default: '/images/logo/cermont-logo.png',
  transparent: '/images/logo/cermont-logo-transparent.png',
  white: '/images/logo/cermont-logo-white.png',
};

const SIZE_MAP: Record<Exclude<LogoSize, 'custom'>, { width: number; height: number }> = {
  xs: { width: 32, height: 32 },
  sm: { width: 48, height: 48 },
  md: { width: 80, height: 80 },
  lg: { width: 120, height: 120 },
  xl: { width: 180, height: 180 },
};

const FRAME_STYLES: Record<LogoFrame, string> = {
  none: '',
  circle: 'rounded-full',
  rounded: 'rounded-xl',
  square: 'rounded-none',
};

/**
 * CermontLogo - Componente reutilizable del logo de CERMONT
 * 
 * @example
 * // Logo simple
 * <CermontLogo size="md" />
 * 
 * @example
 * // Logo con marco circular y sombra
 * <CermontLogo size="lg" frame="circle" withShadow />
 * 
 * @example
 * // Logo como link al dashboard
 * <CermontLogo href="/dashboard" size="sm" variant="transparent" />
 * 
 * @example
 * // Logo con nombre de empresa
 * <CermontLogo size="lg" showName />
 */
export function CermontLogo({
  variant = 'default',
  frame = 'none',
  size = 'md',
  width: customWidth,
  height: customHeight,
  showName = false,
  className = '',
  href,
  withShadow = false,
  alt = 'Cermont Logo',
}: CermontLogoProps) {
  // Calculate dimensions
  const dimensions = size === 'custom' 
    ? { width: customWidth || 80, height: customHeight || 80 }
    : SIZE_MAP[size];

  // Build frame classes
  const frameClasses = FRAME_STYLES[frame];
  const shadowClasses = withShadow ? 'shadow-2xl' : '';
  const bgClasses = frame !== 'none' ? 'bg-white p-3 ring-4 ring-white/20' : '';

  const logoContent = (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`${frameClasses} ${shadowClasses} ${bgClasses} inline-flex`}>
        <Image
          src={LOGO_SOURCES[variant]}
          alt={alt}
          width={dimensions.width}
          height={dimensions.height}
          className={`object-contain ${frame === 'circle' ? 'rounded-full' : ''}`}
          priority
        />
      </div>
      {showName && (
        <span className="mt-2 text-xl font-semibold text-brand-500 dark:text-brand-400">
          CERMONT
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

/**
 * CermontLogoWithTagline - Logo con eslogan para páginas de autenticación
 */
export function CermontLogoWithTagline({
  tagline = 'Sistema de Gestión de Órdenes de Trabajo y Mantenimiento',
  ...logoProps
}: CermontLogoProps & { tagline?: string }) {
  return (
    <div className="flex flex-col items-center">
      <CermontLogo {...logoProps} />
      <p className="mt-4 text-center text-gray-400 dark:text-white/60 max-w-xs">
        {tagline}
      </p>
    </div>
  );
}

export default CermontLogo;
