// Loading state para el dashboard
import { LoadingSpinner } from '@/components/shared';

export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-muted-foreground">Cargando dashboard...</p>
      </div>
    </div>
  );
}
