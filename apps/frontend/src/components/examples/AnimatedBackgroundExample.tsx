// Ejemplo de uso del componente AnimatedBackground
'use client';

import { AnimatedBackground, useBackgroundPresets } from '@/components/ui';

export default function ExampleWithAnimatedBackground() {
  const presets = useBackgroundPresets();

  return (
    <AnimatedBackground
      colors={presets.sunset} // Usa preset de colores
      autoDemo={false} // Sin movimiento automático
      mouseForce={15} // Menos fuerza
      resolution={0.3} // Mejor rendimiento
    >
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white">Background Animado Personalizado</h1>
        <p className="mt-4 text-white/80">
          Este contenido está sobre un background animado personalizado.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white/10 backdrop-blur-sm p-6">
            <h3 className="font-semibold text-white">Interactividad</h3>
            <p className="text-white/70">Mueve el mouse para interactuar</p>
          </div>
          <div className="rounded-lg bg-white/10 backdrop-blur-sm p-6">
            <h3 className="font-semibold text-white">Transparencia</h3>
            <p className="text-white/70">Contenido con blur de fondo</p>
          </div>
          <div className="rounded-lg bg-white/10 backdrop-blur-sm p-6">
            <h3 className="font-semibold text-white">Personalización</h3>
            <p className="text-white/70">Colores y efectos ajustables</p>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
}
