/**
 * ARCHIVO: Card.tsx
 * FUNCION: Componente Card contenedor con subcomponentes para estructura de tarjetas
 * IMPLEMENTACION: Composicion de componentes (Header, Title, Content, Footer) con forwardRef
 * DEPENDENCIAS: React, cn utility
 * EXPORTS: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
 */
import React from 'react';
import { cn } from '@/lib/cn';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 transition-shadow hover:shadow-md',
        className
      )}
      {...props}
    />
  )
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn('flex flex-col gap-1 px-5 py-4 sm:px-6 sm:py-5', className)} 
      {...props} 
    />
  )
);

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-gray-800 dark:text-white/90', className)}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn('border-t border-gray-100 p-5 sm:p-6 dark:border-gray-800', className)} 
      {...props} 
    />
  )
);

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn('flex items-center gap-3 border-t border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-800', className)} 
      {...props} 
    />
  )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
