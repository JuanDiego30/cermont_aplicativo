/**
 * ARCHIVO: loading.tsx (Dashboard Loading)
 * FUNCION: Componente de carga (loading state) para el dashboard
 * IMPLEMENTACION: Renderiza SkeletonDashboard mientras se carga el contenido
 * DEPENDENCIAS: @/components/ui/Skeleton
 * EXPORTS: DashboardLoading (default)
 */
import { SkeletonDashboard } from '@/components/ui/Skeleton';
export default function DashboardLoading() {
  return (
    <div className="p-6">
      <SkeletonDashboard />
    </div>
  );
}
