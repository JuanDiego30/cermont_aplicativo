// Ejemplo de uso en página específica (opcional)
'use client';

import LiquidEther from '@/components/ui/LiquidEther';

export default function ExamplePage() {
  return (
    <div className="relative min-h-screen">
      {/* Background personalizado para esta página */}
      <div className="absolute inset-0 -z-10">
        <LiquidEther
          colors={['#FF6B6B', '#4ECDC4', '#45B7D1']} // Colores personalizados
          mouseForce={15}
          autoDemo={false} // Sin auto-movimiento
          resolution={0.3} // Menor resolución para mejor rendimiento
        />
      </div>

      {/* Contenido de la página */}
      <div className="relative z-0 p-8">
        <h1 className="text-3xl font-bold">Página con Background Personalizado</h1>
        <p className="mt-4 text-muted-foreground">
          Esta página tiene su propio background animado.
        </p>
      </div>
    </div>
  );
}
