'use client';

import { useOrders } from '../hooks/use-orders';
import type { Order, OrderStatus, OrderPriority } from '@/types/order';

interface OrdersListProps {
  filters?: {
    estado?: OrderStatus;
    prioridad?: OrderPriority;
    search?: string;
  };
  onOrderClick?: (orderId: string) => void;
}

const estadoColors: Record<OrderStatus, string> = {
  planeacion: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  ejecucion: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completada: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelada: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  pausada: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const prioridadColors: Record<OrderPriority, string> = {
  baja: 'border-l-gray-400',
  media: 'border-l-blue-400',
  alta: 'border-l-orange-400',
  urgente: 'border-l-red-500',
};

export function OrdersList({ filters, onOrderClick }: OrdersListProps) {
  const { data, isLoading, error, refetch } = useOrders(filters);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-red-600 dark:text-red-400">Error: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const orders = data?.data || [];

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <svg
          className="w-12 h-12 mx-auto mb-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p>No hay órdenes registradas</p>
        {filters && Object.keys(filters).length > 0 && (
          <p className="text-sm mt-1">Intenta ajustar los filtros</p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Número
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Cliente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Prioridad
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Fecha
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => onOrderClick?.(order.id)}
              className={`border-l-4 ${prioridadColors[order.prioridad]} hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.numero}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {order.cliente}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {order.tipo?.replace('_', ' ') || '-'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${estadoColors[order.estado]}`}
                >
                  {order.estado.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {order.prioridad}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {new Date(order.createdAt).toLocaleDateString('es-CO')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
