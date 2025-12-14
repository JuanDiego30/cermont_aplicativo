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
export { Select } from './Select';
export { Textarea } from './Textarea';
export { Switch, SwitchGroup } from './Switch';

// Layout
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './Dialog';

// Feedback
export { Skeleton, SkeletonDashboard, SkeletonTable } from './Skeleton';
export { Badge, badgeVariants } from './Badge';
export { Alert, AlertTitle, AlertDescription } from './Alert';
export { Spinner } from './Spinner';

// Data Display
export { Table, TableHeader, TableBody, TableRow, TableCell, TableWrapper } from './Table';
export { MetricCard, MetricsGrid } from './MetricCard';
export { Avatar, AvatarGroup } from './Avatar';

// Navigation
export { Breadcrumb, PageHeader } from './Breadcrumb';
export { Dropdown } from './Dropdown';

