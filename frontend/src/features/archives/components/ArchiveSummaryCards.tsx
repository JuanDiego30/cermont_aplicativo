import React from 'react';
import { CalendarDays, FolderArchive, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui';
import { SkeletonStatCard, SkeletonText } from '@/components/common/Skeleton';
import type { ArchivedOrder } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ArchiveSummaryCardsProps {
  monthLabel: string;
  monthTotal: number;
  pageCount: number;
  lastArchivedOrder?: ArchivedOrder;
  isLoading?: boolean;
}

const numberFormatter = new Intl.NumberFormat('es-CO');

export function ArchiveSummaryCards({
  monthLabel,
  monthTotal,
  pageCount,
  lastArchivedOrder,
  isLoading,
}: ArchiveSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>
    );
  }

  const lastArchiveDate = lastArchivedOrder?.archivedAt
    ? format(new Date(lastArchivedOrder.archivedAt), "d 'de' MMMM, p", { locale: es })
    : null;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Órdenes archivadas</CardTitle>
          <CalendarDays className="h-5 w-5 text-brand-500" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-gray-900 dark:text-white">
            {numberFormatter.format(monthTotal)}
          </p>
          <p className="text-sm text-muted-foreground">Correspondientes a {monthLabel}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Resultados mostrados</CardTitle>
          <FolderArchive className="h-5 w-5 text-brand-500" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-gray-900 dark:text-white">
            {numberFormatter.format(pageCount)}
          </p>
          <p className="text-sm text-muted-foreground">Órdenes en la página actual</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Última orden archivada</CardTitle>
          <History className="h-5 w-5 text-brand-500" />
        </CardHeader>
        <CardContent>
          {lastArchivedOrder ? (
            <div className="space-y-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {lastArchivedOrder.orderNumber}
              </p>
              <p className="text-sm text-muted-foreground">{lastArchivedOrder.clientName}</p>
              <p className="text-xs text-muted-foreground">
                Archivado por {lastArchivedOrder.archivedBy} · {lastArchiveDate}
              </p>
            </div>
          ) : (
            <SkeletonText lines={3} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
