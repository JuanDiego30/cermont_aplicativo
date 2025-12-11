'use client';

import { Badge } from '@/components/ui/Badge';
import type { Order, OrderStatus } from '@/types/order';

interface OrdersListProps {
  orders: Order[];
  onSelect?: (order: Order) => void;
  isLoading?: boolean;
}

const statusColors: Record<OrderStatus, 'gray' | 'blue' | 'yellow' | 'green' | 'red'> = {
  planeacion: 'blue',
  ejecucion: 'yellow',
  pausada: 'gray',
  completada: 'green',
  cancelada: 'red',
};

const statusLabels: Record<OrderStatus, string> = {
  planeacion: 'Planeación',
  ejecucion: 'En Ejecución',
  pausada: 'Pausada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export function OrdersList({ orders, onSelect, isLoading }: OrdersListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 animate-pulse h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No hay órdenes</p>
        <p className="text-sm">Crea una nueva orden para comenzar</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => onSelect?.(order)}
          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-500">#{order.numero}</span>
                <Badge color={statusColors[order.estado]}>
                  {statusLabels[order.estado]}
                </Badge>
              </div>
              <h3 className="font-medium truncate">{order.descripcion}</h3>
              {order.cliente && (
                <p className="text-sm text-gray-500">{order.cliente}</p>
              )}
            </div>
            <div className="text-right text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
