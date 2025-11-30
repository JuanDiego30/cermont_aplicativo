'use client';

/**
 * Weather Map Component
 * Shows Colombian regions with weather markers
 */

import { useState } from 'react';
import { Loader2, MapPin, RefreshCw } from 'lucide-react';
import { useMultiLocationWeather } from '../hooks';
import { COLOMBIAN_REGIONS, type WeatherMapRegion } from '../types';

interface WeatherMapProps {
  className?: string;
  onSelectRegion?: (region: WeatherMapRegion) => void;
}

export function WeatherMap({ className = '', onSelectRegion }: WeatherMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<WeatherMapRegion | null>(null);
  const { data: weatherData, isLoading, refetch, isFetching } = useMultiLocationWeather(COLOMBIAN_REGIONS);

  const handleRegionClick = (region: WeatherMapRegion) => {
    setSelectedRegion(region);
    onSelectRegion?.(region);
  };

  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 ${className}`}>
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mapa del Clima - Colombia
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Haz clic en un marcador para ver el clima
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="relative h-[400px] p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        ) : (
          <>
            {/* Simple placeholder map with markers */}
            <div className="relative h-full w-full rounded-lg bg-linear-to-br from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20">
              {/* Colombia outline placeholder */}
              <svg
                viewBox="0 0 400 400"
                className="h-full w-full opacity-20"
                preserveAspectRatio="xMidYMid meet"
              >
                <path
                  d="M200 50 L300 100 L350 200 L300 300 L250 350 L150 350 L100 300 L50 200 L100 100 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-400"
                />
              </svg>

              {/* Region markers */}
              <div className="absolute inset-0">
                {COLOMBIAN_REGIONS.map((region) => {
                  const weather = weatherData?.find(w => 
                    w.location.lat === region.lat && w.location.lon === region.lon
                  )?.data;

                  // Convert lat/lon to relative position (simplified)
                  const x = ((region.lon + 80) / 20) * 100;
                  const y = ((12 - region.lat) / 15) * 100;

                  return (
                    <button
                      key={region.id}
                      onClick={() => handleRegionClick(region)}
                      className={`absolute flex flex-col items-center transition-transform hover:scale-110 ${
                        selectedRegion?.id === region.id ? 'z-10' : ''
                      }`}
                      style={{
                        left: `${Math.min(Math.max(x, 5), 95)}%`,
                        top: `${Math.min(Math.max(y, 5), 95)}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full shadow-lg ${
                          selectedRegion?.id === region.id
                            ? 'bg-green-500 text-white'
                            : region.id === 'cano-limon'
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span className="mt-1 whitespace-nowrap rounded bg-white/90 px-1 text-xs font-medium text-gray-800 shadow dark:bg-gray-800/90 dark:text-white">
                        {region.name}
                        {weather?.current?.temp != null && ` ${Math.round(weather.current.temp)}°C`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected region info */}
            {selectedRegion && (
              <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/95 p-4 shadow-lg dark:bg-gray-800/95">
                {(() => {
                  const weather = weatherData?.find(w =>
                    w.location.lat === selectedRegion.lat && w.location.lon === selectedRegion.lon
                  )?.data;

                  if (!weather?.current) {
                    return (
                      <p className="text-gray-500">Cargando datos del clima...</p>
                    );
                  }

                  return (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`}
                          alt={weather.current.description}
                          className="h-12 w-12"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {selectedRegion.name}
                          </h4>
                          <p className="text-sm capitalize text-gray-500 dark:text-gray-400">
                            {weather.current.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {Math.round(weather.current.temp)}°C
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Humedad: {weather.current.humidity}%
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 border-t border-gray-200 px-6 py-3 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Caño Limón (Principal)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Otras ciudades</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Seleccionado</span>
        </div>
      </div>
    </div>
  );
}

export default WeatherMap;
