'use client';

import React, { useState } from 'react';
import { useArchives, useExportArchives, useTriggerArchive } from '@/features/archives/hooks/useArchives';
import { ArchivesList, ArchiveDetailModal } from '@/features/archives/components';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Download, Archive, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { ArchivedOrder } from '@/features/archives/types';
import { useToast } from '@/shared/hooks/use-toast';

export default function ArchivesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedOrder, setSelectedOrder] = useState<ArchivedOrder | null>(null);

  const { toast } = useToast();

  const { data, isLoading, isError } = useArchives({
    page,
    limit: 10,
    search,
    month,
  });

  const exportMutation = useExportArchives();
  const triggerMutation = useTriggerArchive();

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(month);
      toast({
        title: 'Exportación exitosa',
        description: `Se ha descargado el backup de ${month}`,
      });
    } catch (error) {
      toast({
        title: 'Error al exportar',
        description: 'No se pudo generar el archivo ZIP',
        variant: 'destructive',
      });
    }
  };

  const handleTriggerArchive = async () => {
    try {
      const result = await triggerMutation.mutateAsync();
      toast({
        title: 'Archivado completado',
        description: `Se han archivado ${result.data.archivedCount} órdenes antiguas.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Falló el proceso de archivado manual',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Archivo de Órdenes</h1>
          <p className="text-muted-foreground">
            Consulta y exporta el historial de órdenes antiguas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTriggerArchive}
            disabled={triggerMutation.isPending}
          >
            {triggerMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Archive className="h-4 w-4 mr-2" />
            )}
            Ejecutar Archivado
          </Button>
          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Exportar Mes ({month})
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por orden, cliente o descripción..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <ArchivesList
        orders={data?.data || []}
        isLoading={isLoading}
        onViewDetail={setSelectedOrder}
      />

      {/* Pagination Controls could go here */}

      <ArchiveDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
