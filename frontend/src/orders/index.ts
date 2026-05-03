/**
 * Orders Module - Barrel Exports
 *
 * Centralized exports for order management functionality.
 *
 * Usage:
 *   import { OrdersTable, useOrders, ORDER_STAGES } from '@/src/modules/orders';
 */

// ========== Queries ==========
export * from "./queries";
// ========== Types ==========
export * from "./types";
export { CreateOrderForm } from "./ui/CreateOrderForm";
export { OrderClosureTab } from "./ui/detail/OrderClosureTab";
// Detail components
export { OrderDetailHeader } from "./ui/detail/OrderDetailHeader";
export { OrderDetailsTab } from "./ui/detail/OrderDetailsTab";
export { OrderDocumentsTab } from "./ui/detail/OrderDocumentsTab";
export { OrderEvidencesTab } from "./ui/detail/OrderEvidencesTab";
export { OrderExecutionTab } from "./ui/detail/OrderExecutionTab";
export { OrderInspectionsTab } from "./ui/detail/OrderInspectionsTab";
export { OrderPlanningTab } from "./ui/detail/OrderPlanningTab";
export { EditOrderForm } from "./ui/EditOrderForm";
export { InvoicePageClient } from "./ui/InvoicePageClient";
export { OrderFilters } from "./ui/OrderFilters";
// ========== UI Components ==========
export { OrdersTable } from "./ui/OrdersTable";
