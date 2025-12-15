/**
 * ARCHIVO: OptimizedImage.tsx
 * FUNCION: Componente de imagen optimizada con mejores prácticas
 * IMPLEMENTACION: Basado en vercel/examples/solutions/reduce-image-bandwidth-usage
 * DEPENDENCIAS: next/image
 * EXPORTS: OptimizedImage, ImageSkeleton
 */
'use client';

import Image, { type ImageProps } from 'next/image';
import { useState, memo } from 'react';
import { cn } from '@/lib/cn';

/**
 * Configuración de tamaños responsive por defecto
 * Basado en breakpoints de Tailwind
 */
const DEFAULT_SIZES = {
  full: '100vw',
  responsive: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px',
  thumbnail: '(max-width: 640px) 50vw, 256px',
  avatar: '48px',
  icon: '24px',
} as const;

type SizePreset = keyof typeof DEFAULT_SIZES;

interface OptimizedImageProps extends Omit<ImageProps, 'onLoadingComplete'> {
  /**
   * Preset de tamaño para el atributo sizes
   */
  sizePreset?: SizePreset;
  /**
   * Mostrar skeleton mientras carga
   */
  showSkeleton?: boolean;
  /**
   * Clase para el skeleton
   */
  skeletonClassName?: string;
  /**
   * Aspect ratio del contenedor (cuando se usa fill)
   */
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  /**
   * Callback cuando la imagen se carga
   */
  onLoad?: () => void;
  /**
   * Fallback cuando hay error
   */
  fallbackSrc?: string;
}

/**
 * Skeleton de carga para imágenes
 */
export function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
        className
      )}
      aria-hidden="true"
    />
  );
}

/**
 * Componente de imagen optimizada
 * - Lazy loading automático
 * - Skeleton de carga
 * - Manejo de errores con fallback
 * - Tamaños responsive optimizados
 */
export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  sizePreset = 'responsive',
  sizes,
  showSkeleton = true,
  skeletonClassName,
  aspectRatio,
  className,
  onLoad,
  fallbackSrc = '/placeholder-image.png',
  priority = false,
  fill,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  // Determinar sizes
  const computedSizes = sizes || DEFAULT_SIZES[sizePreset];

  // Clases de aspect ratio
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };

  // Contenedor para fill mode
  if (fill) {
    return (
      <div
        className={cn(
          'relative overflow-hidden',
          aspectRatio && aspectRatioClasses[aspectRatio],
          className
        )}
      >
        {showSkeleton && isLoading && (
          <ImageSkeleton
            className={cn('absolute inset-0', skeletonClassName)}
          />
        )}
        <Image
          src={hasError ? fallbackSrc : imageSrc}
          alt={alt}
          fill
          sizes={computedSizes}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          className={cn(
            'object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </div>
    );
  }

  // Modo con width/height explícito
  return (
    <div className={cn('relative inline-block', className)}>
      {showSkeleton && isLoading && (
        <ImageSkeleton
          className={cn(
            'absolute inset-0',
            skeletonClassName
          )}
        />
      )}
      <Image
        src={hasError ? fallbackSrc : imageSrc}
        alt={alt}
        sizes={computedSizes}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
});

/**
 * Avatar optimizado
 */
interface AvatarImageProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackInitials?: string;
  className?: string;
}

const avatarSizes = {
  sm: { size: 32, text: 'text-xs' },
  md: { size: 40, text: 'text-sm' },
  lg: { size: 48, text: 'text-base' },
  xl: { size: 64, text: 'text-lg' },
};

export const AvatarImage = memo(function AvatarImage({
  src,
  alt,
  size = 'md',
  fallbackInitials,
  className,
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);
  const { size: dimension, text: textSize } = avatarSizes[size];

  // Mostrar iniciales si no hay imagen o hay error
  if (!src || hasError) {
    const initials = fallbackInitials || alt.charAt(0).toUpperCase();
    return (
      <div
        className={cn(
          'rounded-full bg-brand-500 text-white flex items-center justify-center font-medium',
          textSize,
          className
        )}
        style={{ width: dimension, height: dimension }}
        aria-label={alt}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={dimension}
      height={dimension}
      sizes={`${dimension}px`}
      className={cn('rounded-full object-cover', className)}
      onError={() => setHasError(true)}
    />
  );
});

/**
 * Imagen de producto optimizada para cards
 */
interface ProductImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

export const ProductImage = memo(function ProductImage({
  src,
  alt,
  priority = false,
  className,
}: ProductImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      sizePreset="card"
      aspectRatio="square"
      priority={priority}
      showSkeleton
      className={cn('rounded-lg', className)}
    />
  );
});

export default OptimizedImage;
