'use client';

// ============================================
// WEATHER WIDGET - Widget compacto para Dashboard
// ============================================

import React from 'react';
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useWeatherSummary } from '@/hooks/useWeather';

interface WeatherWidgetProps {
  className?: string;
  compact?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  className = '',
  compact = false,
}) => {
  // Coordenadas de Caño Limón
  const CANO_LIMON = { lat: 5.3667, lon: -71.7994 };

  const {
    data,
    isLoading,
    isValidating: isFetching,
    mutate: refetch
  } = useWeatherSummary({
    lat: CANO_LIMON.lat,
    lon: CANO_LIMON.lon,
    refreshInterval: 5 * 60 * 1000, // 5 minutos
  });

  const {
    current,
    alerts = [],
  } = data || {};

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="h-12 bg-gray-200 rounded mb-2" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-8 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <p className="text-gray-500 text-sm">Sin datos meteorológicos</p>
      </div>
    );
  }

  const hasAlerts = alerts.length > 0;
  const criticalAlert = alerts.find((a) => a.severity === 'CRITICA' || a.severity === 'ALTA');

  if (compact) {
    return (
      <div className={`bg-white rounded-lg shadow p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{current.icon}</span>
            <div>
              <p className="text-2xl font-bold">{current.temperature.toFixed(0)}°C</p>
              <p className="text-xs text-gray-500">Caño Limón</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="flex items-center gap-1 text-gray-600">
              <Droplets className="w-3 h-3" /> {current.humidity}%
            </p>
            <p className="flex items-center gap-1 text-gray-600">
              <Wind className="w-3 h-3" /> {current.windSpeed.toFixed(0)} m/s
            </p>
          </div>
        </div>
        {hasAlerts && (
          <div className="mt-2 px-2 py-1 bg-yellow-50 rounded text-xs text-yellow-700 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {alerts.length} alerta(s) activa(s)
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {/* Header con gradiente */}
      <div className="bg-linear-to-r from-blue-500 to-cyan-400 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Caño Limón, Arauca</h3>
            <p className="text-sm text-blue-100">{current.description}</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1 hover:bg-white/20 rounded"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Datos principales */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{current.icon}</span>
            <div>
              <p className="text-4xl font-bold text-gray-900">
                {current.temperature.toFixed(0)}°C
              </p>
              <p className="text-sm text-gray-500">
                Sensación: {current.feelsLike.toFixed(0)}°C
              </p>
            </div>
          </div>
        </div>

        {/* Grid de métricas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Humedad:</span>
            <span className="font-semibold">{current.humidity}%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wind className="w-4 h-4 text-cyan-500" />
            <span className="text-gray-600">Viento:</span>
            <span className="font-semibold">{current.windSpeed.toFixed(0)} m/s</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Cloud className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Nubes:</span>
            <span className="font-semibold">{current.cloudCover}%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CloudRain className="w-4 h-4 text-indigo-500" />
            <span className="text-gray-600">Lluvia:</span>
            <span className="font-semibold">{current.precipitation} mm</span>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {criticalAlert && (
        <div className="bg-orange-50 border-t border-orange-200 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-800 text-sm">
                {criticalAlert.title}
              </p>
              <p className="text-xs text-orange-600">
                {criticalAlert.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
