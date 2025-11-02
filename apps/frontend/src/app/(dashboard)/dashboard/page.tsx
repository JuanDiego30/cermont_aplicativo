'use client';

import { useQuery } from '@tanstack/react-query';
import { getKPIs } from '@/services/dashboard.service';
import SkeletonCard from '@/components/shared/SkeletonCard';
import EmptyState from '@/components/shared/EmptyState';

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['kpis'],
    queryFn: getKPIs,
    staleTime: 60_000,
  });

  if (isLoading) return <SkeletonCard />;

  if (isError) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
        Error cargando KPIs: {(error as Error).message}
      </div>
    );
  }

  if (!data) return <EmptyState title="Sin datos" hint="No hay KPIs por ahora" />;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Stat title="Abiertas" value={data.open} />
      <Stat title="En progreso" value={data.inProgress} />
      <Stat title="Cerradas" value={data.closed} />
      <Stat title="Últimos 7 días" value={data.last7} />
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white/70 p-4 shadow-sm">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-3xl font-semibold">{value}</div>
    </div>
  );
}