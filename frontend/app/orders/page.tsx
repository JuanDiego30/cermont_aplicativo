// app/orders/page.tsx
'use client';

// ============================================================================
// IMPORTS
// ============================================================================
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/lib/hooks/useOrders';

// Universal Components
import { PageHeader } from '@/components/patterns/PageHeader';
import { LoadingState } from '@/components/patterns/LoadingState';
import { EmptyState } from '@/components/patterns/EmptyState';

// UI Components
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

// Types & Icons
import type { Order } from '@/lib/types/order';
import type { ReactNode } from 'react';
import { FileText, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================
type OrderColumn = {
  key: keyof Order | string;
  label: string;
  render?: (value: unknown, order: Order) => ReactNode;
};

// ============================================================================
// CONSTANTS
// ============================================================================
const ORDER_COLUMNS: OrderColumn[] = [
  { key: 'cliente', label: 'Cliente' },
  { key: 'ubicacion', label: 'Ubicación' },
  {
    key: 'estado',
    label: 'Estado',
    render: (_value: unknown, order: Order) => <Badge state={order.state} />,
  },
  {
    key: 'prioridad',
    label: 'Prioridad',
    render: (value: unknown) => (value as string) || 'N/A',
  },
  {
    key: 'fechaCreacion',
    label: 'Creado',
    render: (value: unknown) => new Date(String(value)).toLocaleDateString('es-ES'),
  },
];

const ORDERS_PER_PAGE = 10;

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function OrdersPage() {
  // ------------------------------------
  // Hooks & State
  // ------------------------------------
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { orders, totalPages, isLoading } = useOrders({ page, limit: ORDERS_PER_PAGE });

  // ------------------------------------
  // Handlers
  // ------------------------------------
  const handleNewOrder = () => {
    router.push('/orders/new');
  };

  const handleRowClick = (order: Order) => {
    router.push(`/orders/${order.id}`);
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ========================================
          SECTION: Page Header
      ========================================== */}
      <PageHeader
        icon={FileText}
        title="Órdenes de Trabajo"
        description="Gestiona y visualiza todas las órdenes de trabajo del sistema"
        badge={{ text: 'Gestión', variant: 'primary' }}
        action={
          <Button
            variant="primary"
            onClick={handleNewOrder}
            className="group flex items-center gap-2 shadow-xl"
          >
            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
            Nueva Orden
          </Button>
        }
      />

      {/* ========================================
          SECTION: Orders Table
      ========================================== */}
      <div className="rounded-3xl border-2 border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <LoadingState message="Cargando órdenes..." subMessage="Obteniendo datos" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex h-96 items-center justify-center">
            <EmptyState
              icon={FileText}
              title="No hay órdenes disponibles"
              description="Crea tu primera orden de trabajo para comenzar"
              action={{
                label: 'Crear Primera Orden',
                onClick: handleNewOrder,
                icon: Plus,
              }}
            />
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-hidden">
              <Table data={orders} columns={ORDER_COLUMNS} onRowClick={handleRowClick} />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t-2 border-neutral-200 bg-neutral-50 px-8 py-6 dark:border-neutral-800 dark:bg-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Mostrando página <span className="font-bold text-neutral-900 dark:text-neutral-50">{page}</span> de{' '}
                    <span className="font-bold text-neutral-900 dark:text-neutral-50">{totalPages}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page === 1}
                      onClick={handlePreviousPage}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold transition-all ${
                              page === pageNum
                                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={handleNextPage}
                      className="flex items-center gap-2"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


