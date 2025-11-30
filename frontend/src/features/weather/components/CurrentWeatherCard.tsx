'use client';

/**
 * Current Weather Card Component
 */

import { Cloud, Droplets, Wind, Eye, Thermometer, Sun, Sunset, Loader2 } from 'lucide-react';
import { useCurrentWeather } from '../hooks';
import type { WeatherLocation } from '../types';

interface CurrentWeatherCardProps {
  location?: WeatherLocation;
  className?: string;
}
// OpenWeather icon URL
const getWeatherIconUrl = (icon: string) =>
  `https://openweathermap.org/img/wn/${icon}@2x.png`;

export function CurrentWeatherCard({ location, className = '' }: CurrentWeatherCardProps) {
  const { data, isLoading, error } = useCurrentWeather(location);

  if (isLoading) {
    return (
      <div className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 ${className}`}>
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20 ${className}`}>
        <p className="text-center text-red-600 dark:text-red-400">
          Error al cargar datos del clima
        </p>
      </div>
    );
  }

  // Validate data structure
  if (!data.current || !data.location || !data.sun) {
    return (
      <div className={`rounded-xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20 ${className}`}>
        <p className="text-center text-yellow-600 dark:text-yellow-400">
          Datos del clima incompletos
        </p>
      </div>
    );
  }

  const { current, location: loc, sun } = data;

  return (
    <div className={`rounded-xl border border-gray-200 bg-linear-to-br from-blue-50 to-indigo-50 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {loc.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{loc.country}</p>
        </div>
        <div className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getWeatherIconUrl(current.icon)}
            alt={current.description}
            className="h-16 w-16"
          />
        </div>
      </div>

      {/* Temperature */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-gray-900 dark:text-white">
            {Math.round(current.temp)}°
          </span>
          <span className="text-xl text-gray-500 dark:text-gray-400">C</span>
        </div>
        <p className="mt-1 capitalize text-gray-600 dark:text-gray-300">
          {current.description}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Sensación térmica: {Math.round(current.feels_like)}°C
        </p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Humedad</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {current.humidity}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-teal-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Viento</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {current.wind_speed} m/s
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Nubosidad</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {current.clouds}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-indigo-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Visibilidad</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {(current.visibility / 1000).toFixed(1)} km
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-orange-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Presión</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {current.pressure} hPa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4 text-yellow-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Amanecer</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(sun.sunrise).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Sunset */}
      <div className="mt-4 flex items-center justify-center gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Sunset className="h-4 w-4 text-orange-400" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Atardecer: {new Date(sun.sunset).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

export default CurrentWeatherCard;
