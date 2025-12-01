"use client";

import React, { useMemo, useState } from 'react';
import { useArchives, useExportArchives, useTriggerArchive } from '@/features/archives/hooks/useArchives';
import {
  ArchivesList,
  ArchiveDetailModal,
  ArchiveSummaryCards,
  ArchiveActivityCard,
} from '@/features/archives/components';
import { Input, Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui';
import Pagination from '@/components/tables/Pagination';
import { Alert } from '@/shared/components/ui/alert';
import {
  Search,
  Download,
  Archive as ArchiveIcon,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { addMonths, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ArchivedOrder } from '@/features/archives/types';

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEFAULT_LIMIT = 10;

export default function ArchivesPage() {
  const initialMonth = useMemo(() => format(new Date(), 'yyyy-MM'), []);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(DEFAULT_LIMIT);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(initialMonth);
  const [selectedOrder, setSelectedOrder] = useState<ArchivedOrder | null>(null);

  const { data, isLoading, isError, error, isFetching } = useArchives({
    page,
    limit,
    search,
    month,
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime()
      ),
    [orders]
  );
  const latestOrder = sortedOrders[0];

  const exportMutation = useExportArchives();
  const triggerMutation = useTriggerArchive();

  const monthDate = useMemo(() => {
    try {
      return month ? parseISO(`${month}-01`) : new Date();
    } catch {
      return new Date();
    }
  }, [month]);

  const monthLabel = useMemo(
    () => format(monthDate, 'LLLL yyyy', { locale: es }),
    [monthDate]
  );

  const showingFrom = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = total === 0 ? 0 : Math.min(showingFrom + orders.length - 1, total);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  };

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(month);
      alert(`Exportación exitosa: Se ha descargado el backup de ${monthLabel}`);
    } catch {
      alert('Error al exportar: No se pudo generar el archivo ZIP');
    }
  };

  const handleTriggerArchive = async () => {
    try {
      const result = await triggerMutation.mutateAsync();
      alert(`Archivado completado: Se han archivado ${result.archivedCount} órdenes antiguas.`);
    } catch {
      alert('Error: Falló el proceso de archivado manual');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleMonthChange = (value: string) => {
    setMonth(value);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const shiftMonth = (delta: number) => {
    const newDate = addMonths(monthDate, delta);
    setMonth(format(newDate, 'yyyy-MM'));
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setMonth(initialMonth);
    setLimit(DEFAULT_LIMIT);
    setPage(1);
  };

  const canResetFilters =
    search.trim().length > 0 || month !== initialMonth || limit !== DEFAULT_LIMIT;

  const errorMessage =
    error instanceof Error
      ? error.message
      : 'No se pudo cargar la información del archivo en este momento.';

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Archivo de Órdenes</h1>
          <p className="text-muted-foreground">
            Consulta, filtra y exporta el historial de órdenes resguardadas.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            startIcon={<ArchiveIcon className="h-4 w-4" />}
            loading={triggerMutation.isPending}
            onClick={handleTriggerArchive}
          >
            Ejecutar archivado
          </Button>
          <Button
            startIcon={<Download className="h-4 w-4" />}
            loading={exportMutation.isPending}
            onClick={handleExport}
          >
            Exportar {monthLabel}
          </Button>
        </div>
      </div>

      <ArchiveSummaryCards
        isLoading={isFetching && orders.length === 0}
        monthLabel={monthLabel}
        monthTotal={total}
        pageCount={orders.length}
        lastArchivedOrder={latestOrder}
      />

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Búsqueda</label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por orden, cliente o descripción..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Mes a consultar</label>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="px-2"
                  onClick={() => shiftMonth(-1)}
                  aria-label="Mes anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Input
                  type="month"
                  value={month}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="appearance-auto"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="px-2"
                  onClick={() => shiftMonth(1)}
                  aria-label="Mes siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Resultados por página</label>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              {monthLabel} · {total} registros encontrados
            </p>
            {canResetFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                startIcon={<RefreshCw className="h-4 w-4" />}
                onClick={resetFilters}
              >
                Restablecer filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isError && (
        <Alert
          variant="error"
          title="No pudimos cargar el archivo"
          message={errorMessage}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <ArchivesList orders={orders} isLoading={isLoading} onViewDetail={setSelectedOrder} />

          {total > 0 && (
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {showingFrom}-{showingTo} de {total} resultados
              </p>
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          )}
        </div>

        <ArchiveActivityCard
          orders={sortedOrders}
          onViewDetail={setSelectedOrder}
          isLoading={isLoading && orders.length === 0}
        />
      </div>

      <ArchiveDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
