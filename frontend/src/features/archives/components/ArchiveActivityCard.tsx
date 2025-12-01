import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/shared/components/ui';
import { SkeletonText } from '@/components/common/Skeleton';
import type { ArchivedOrder } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ArchiveActivityCardProps {
  orders: ArchivedOrder[];
  onViewDetail: (order: ArchivedOrder) => void;
  isLoading?: boolean;
}

export function ArchiveActivityCard({ orders, onViewDetail, isLoading }: ArchiveActivityCardProps) {
  const recentOrders = orders.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Clock className="h-4 w-4 text-brand-500" />
          Actividad reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SkeletonText lines={5} />
        ) : recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No se registran archivos recientes para los filtros actuales.
          </p>
        ) : (
          <ul className="space-y-4">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.clientName}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="light">{order.finalState}</Badge>
                    <span>
                      Archivado {formatDistanceToNow(new Date(order.archivedAt), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => onViewDetail(order)}>
                  Ver
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
