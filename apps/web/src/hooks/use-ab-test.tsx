/**
 * ARCHIVO: hooks/use-ab-test.ts
 * FUNCION: React Hook para usar A/B testing en componentes cliente
 * IMPLEMENTACION: Basado en vercel/examples/ab-testing
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getExperimentBucket, experiments, type ExperimentName, type Experiment } from '@/lib/ab-testing';

interface UseABTestResult {
  variant: string;
  isControl: boolean;
  isVariant: (variantName: string) => boolean;
  experiment: Experiment | undefined;
  loading: boolean;
}

/**
 * Hook para obtener la variante de un experimento A/B
 * @param experimentName - Nombre del experimento
 * @returns Información sobre la variante asignada
 */
export function useABTest(experimentName: ExperimentName): UseABTestResult {
  const [variant, setVariant] = useState<string>('control');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener bucket del experimento
    const bucket = getExperimentBucket(experimentName);
    setVariant(bucket);
    setLoading(false);
  }, [experimentName]);

  const isVariant = useCallback(
    (variantName: string) => variant === variantName,
    [variant]
  );

  const experiment = experiments[experimentName];

  return {
    variant,
    isControl: variant === 'control',
    isVariant,
    experiment,
    loading,
  };
}

/**
 * Componente para renderizar contenido según variante A/B
 */
interface ABTestProps {
  experiment: ExperimentName;
  control: React.ReactNode;
  variants: Record<string, React.ReactNode>;
}

export function ABTest({ experiment, control, variants }: ABTestProps) {
  const { variant, loading } = useABTest(experiment);

  if (loading) {
    return <>{ control } </>;
  }

  if (variant === 'control') {
    return <>{ control } </>;
  }

  return <>{ variants[variant] ?? control } </>;
}

/**
 * Hook para trackear eventos de conversión en experimentos
 */
export function useABTestTracking() {
  const trackConversion = useCallback(
    async (experimentName: ExperimentName, conversionType: string) => {
      try {
        const bucket = getExperimentBucket(experimentName);

        // Enviar evento de conversión
        await fetch('/api/ab-testing/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            experiment: experimentName,
            variant: bucket,
            conversionType,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error('[A/B Tracking] Error:', error);
      }
    },
    []
  );

  return { trackConversion };
}

/**
 * Hook para obtener información de todos los experimentos activos del usuario
 */
export function useActiveExperiments(): Record<ExperimentName, string> {
  const [activeExperiments, setActiveExperiments] = useState<Record<ExperimentName, string>>({} as Record<ExperimentName, string>);

  useEffect(() => {
    const result = {} as Record<ExperimentName, string>;

    for (const experimentName of Object.keys(experiments) as ExperimentName[]) {
      const exp = experiments[experimentName];
      if (exp) {
        result[experimentName] = getExperimentBucket(experimentName);
      }
    }

    setActiveExperiments(result);
  }, []);

  return activeExperiments;
}
