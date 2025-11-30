'use client';

import { useState } from 'react';
import { Cloud, MapPin, Calendar, Thermometer, Layers } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import {
  CurrentWeatherCard,
  WeatherForecast,
  WeatherMapInteractive,
  type WeatherMapRegion,
  type WeatherLocation,
  CANO_LIMON_COORDS
} from '@/features/weather';

export default function WeatherPageClient() {
  const [selectedLocation, setSelectedLocation] = useState<WeatherLocation>(CANO_LIMON_COORDS);

  const handleRegionSelect = (region: WeatherMapRegion) => {
    setSelectedLocation({
      lat: region.lat,
      lon: region.lon,
      name: region.name,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb pageTitle="Clima y Pronóstico" />

      {/* Header Card */}
      <div className="rounded-xl border border-gray-200 bg-linear-to-r from-blue-500 to-cyan-500 p-6 text-white shadow-lg dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Cloud className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Clima y Pronóstico</h1>
            <p className="mt-1 text-white/80">
              Monitoreo de condiciones climáticas para operaciones seguras en campo petrolero.
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
            <MapPin className="h-5 w-5" />
            <div>
              <p className="font-medium">Ubicación Principal</p>
              <p className="text-sm text-white/70">Caño Limón, Arauca</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
            <Calendar className="h-5 w-5" />
            <div>
              <p className="font-medium">Pronóstico</p>
              <p className="text-sm text-white/70">5 días disponibles</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
            <Thermometer className="h-5 w-5" />
            <div>
              <p className="font-medium">Actualización</p>
              <p className="text-sm text-white/70">Cada 15 minutos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
            <Layers className="h-5 w-5" />
            <div>
              <p className="font-medium">Capas del Mapa</p>
              <p className="text-sm text-white/70">Nubes, lluvia, viento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Weather Card - Full width */}
      <CurrentWeatherCard location={selectedLocation} />

      {/* Interactive Weather Map with Cloud Layers */}
      <WeatherMapInteractive onSelectRegion={handleRegionSelect} />

      {/* Forecast */}
      <WeatherForecast location={selectedLocation} />

      {/* Safety Note */}
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/40">
            <Cloud className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
              Nota de Seguridad
            </h4>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              Las condiciones climáticas pueden afectar las operaciones en campo. Consulta siempre el
              pronóstico antes de iniciar trabajos al aire libre y sigue los protocolos de seguridad
              establecidos por CERMONT S.A.S.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
