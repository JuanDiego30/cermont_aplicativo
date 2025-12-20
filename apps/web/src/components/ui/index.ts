/**
 * ARCHIVO: index.ts
 * FUNCION: Barrel file que centraliza las exportaciones de todos los componentes UI
 * IMPLEMENTACION: Re-exporta componentes organizados por categoria (Botones, Forms, Layout, etc.)
 * DEPENDENCIAS: Todos los componentes UI del directorio
 * EXPORTS: Button, Input, Card, Alert, Badge, Avatar, Breadcrumb, Skeleton, Table, etc.
 */
// Botones
export { Button, buttonVariants } from './Button';

// Formularios
export { Input } from './Input';
export { Textarea } from './Textarea';
export { Select } from './Select';

// Layout
export { Card } from './Card';
export { Badge } from './Badge';
export { Alert } from './Alert';

// Loading & Empty States
export { Skeleton, CardSkeleton, TableSkeleton } from './LoadingSkeleton';
export { EmptyState } from './EmptyState';
