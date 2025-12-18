/**
 * ARCHIVO: hooks/use-feature-flag.ts
 * FUNCION: React Hook para usar feature flags en componentes cliente
 * IMPLEMENTACION: Basado en vercel/examples/edge-config
 */
'use client';

import { useState, useEffect } from 'react';

interface FeatureFlags {
  nuevosDashboards: boolean;
  modoOffline: boolean;
  notificacionesPush: boolean;
  reportesAvanzados: boolean;
  temaOscuroAuto: boolean;
  busquedaAvanzada: boolean;
  exportarPDF: boolean;
  integraciónWhatsApp: boolean;
}

const defaultFlags: FeatureFlags = {
  nuevosDashboards: false,
  modoOffline: false,
  notificacionesPush: false,
  reportesAvanzados: false,
  temaOscuroAuto: true,
  busquedaAvanzada: false,
  exportarPDF: true,
  integraciónWhatsApp: false,
};

/**
 * Hook para acceder a feature flags
 * @param flagName - Nombre del flag a verificar
 * @returns boolean indicando si el feature está habilitado
 */
export function useFeatureFlag(flagName: keyof FeatureFlags): boolean {
  const [enabled, setEnabled] = useState<boolean>(defaultFlags[flagName] ?? false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlag() {
      try {
        const response = await fetch(`/api/feature-flags?flag=${flagName}`);
        if (response.ok) {
          const data = await response.json();
          setEnabled(data.enabled ?? defaultFlags[flagName]);
        }
      } catch {
        // En caso de error, usar valor por defecto
        setEnabled(defaultFlags[flagName]);
      } finally {
        setLoading(false);
      }
    }

    fetchFlag();
  }, [flagName]);

  return enabled;
}

/**
 * Hook para obtener todos los feature flags
 */
export function useFeatureFlags(): { flags: FeatureFlags; loading: boolean } {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlags() {
      try {
        const response = await fetch('/api/feature-flags');
        if (response.ok) {
          const data = await response.json();
          setFlags({ ...defaultFlags, ...data });
        }
      } catch {
        // En caso de error, usar valores por defecto
      } finally {
        setLoading(false);
      }
    }

    fetchFlags();
  }, []);

  return { flags, loading };
}

/**
 * Componente wrapper para mostrar contenido condicionalmente
 */
interface FeatureProps {
  flag: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Feature({ flag, children, fallback = null }: FeatureProps) {
  const enabled = useFeatureFlag(flag);
  return <>{enabled ? children : fallback}</>;
}
