/**
 * @fileoverview Ordenes Feature Module
 * Feature-based organization for orders functionality
 */

// Components from feature
export { OrdersList } from './components/OrdersList';
export { CreateOrderForm } from './components/CreateOrderForm';
export { OrderStats } from './components/OrderStats';

// Hooks - React Query based
export * from './hooks/use-orders';

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

