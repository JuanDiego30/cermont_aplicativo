/**
 * ARCHIVO: auth-branding-client.tsx
 * FUNCION: Componente de branding con efecto Antigravity animado para autenticación
 * IMPLEMENTACION: Client Component con Three.js/react-three-fiber para partículas interactivas
 * DEPENDENCIAS: @components/Antigravity, next/image
 * EXPORTS: AuthBrandingClient
 */
'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';

// Carga dinámica de Antigravity para evitar SSR issues con Three.js
const Antigravity = dynamic(() => import('@/components/Antigravity'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-linear-to-br from-brand-900 via-brand-950 to-black" />
  ),
});

export function AuthBrandingClient() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-brand-950 dark:bg-gray-950 items-center justify-center relative overflow-hidden">
      {/* Antigravity Background */}
      <div className="absolute inset-0 z-0">
        <Antigravity
          count={200}
          magnetRadius={15}
          ringRadius={12}
          waveSpeed={0.3}
          waveAmplitude={1.2}
          particleSize={1.8}
          lerpSpeed={0.08}
          color="#3B82F6"
          autoAnimate={true}
          particleVariance={1.2}
          rotationSpeed={0.1}
          depthFactor={1.5}
          pulseSpeed={2}
          particleShape="capsule"
          fieldStrength={8}
        />
      </div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-linear-to-t from-brand-950/90 via-transparent to-brand-950/60 z-10" />
      <div className="absolute inset-0 bg-linear-to-r from-brand-950/50 via-transparent to-brand-950/50 z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center max-w-md text-center px-8">
        {/* Logo with glow effect */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-36 h-36 drop-shadow-[0_0_35px_rgba(59,130,246,0.5)]">
            <Image
              src="/logo.svg"
              alt="Cermont"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Title with glow */}
        <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
          CERMONT S.A.S
        </h2>

        {/* Description */}
        <p className="text-gray-300 dark:text-white/70 leading-relaxed text-lg">
          Sistema de Gestión de Órdenes de Servicio Industrial.
          Optimiza tus procesos de mantenimiento y servicio técnico.
        </p>

        {/* Features list with enhanced styling */}
        <ul className="mt-10 space-y-4 text-left">
          {[
            'Gestión integral de órdenes de trabajo',
            'Seguimiento en tiempo real',
            'Reportes y métricas avanzadas',
            'Soporte offline para técnicos',
          ].map((feature, index) => (
            <li
              key={index}
              className="flex items-center gap-3 text-gray-300 dark:text-white/70 backdrop-blur-sm bg-white/5 rounded-lg px-4 py-2"
            >
              <span className="shrink-0 w-6 h-6 rounded-full bg-brand-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.4)]">
                <svg
                  className="w-3.5 h-3.5 text-brand-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
