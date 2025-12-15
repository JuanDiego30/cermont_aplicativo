/**
 * ARCHIVO: index.ts
 * FUNCION: Barrel file del módulo de órdenes que centraliza exports
 * IMPLEMENTACION: Re-exporta componentes, hooks, APIs y tipos del feature
 * DEPENDENCIAS: Componentes locales, hooks, ordenesApi, tipos de @/types/order
 * EXPORTS: OrdersList, CreateOrderForm, OrderStats, hooks, ordenesApi, tipos Order
 */
// Components from feature
export { OrdersList } from './components/OrdersList';
export { CreateOrderForm } from './components/CreateOrderForm';
export { OrderStats } from './components/OrderStats';

// Hooks - React Query based
export * from './hooks/use-orders';
export * from './hooks/use-ordenes';

// API layer
export { ordenesApi } from './api/ordenes.api';

// Types re-export
export type {
  Order,
  OrderItem,
  OrderStatus,
  OrderPriority,
  OrderFilters,
  CreateOrderInput,
  UpdateOrderInput,
} from '@/types/order';

