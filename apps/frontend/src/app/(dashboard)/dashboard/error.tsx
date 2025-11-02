'use client';

// Error boundary para el dashboard
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log del error a un servicio de monitoreo
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold">Algo salió mal</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || 'Ha ocurrido un error inesperado'}
        </p>
        <Button onClick={reset} className="mt-6">
          Intentar de nuevo
        </Button>
      </div>
    </div>
  );
}
