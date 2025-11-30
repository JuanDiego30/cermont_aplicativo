'use client';

/**
 * Weather Forecast Component
 */

import { Loader2, Droplets, Wind } from 'lucide-react';
import { useWeatherForecast } from '../hooks';
import type { WeatherLocation, ForecastItem } from '../types';

interface WeatherForecastProps {
  location?: WeatherLocation;
  className?: string;
}

// OpenWeather icon URL
const getWeatherIconUrl = (icon: string) => 
  `https://openweathermap.org/img/wn/${icon}@2x.png`;

// Group forecast by date
function groupByDate(forecast: ForecastItem[]): Record<string, ForecastItem[]> {
  return forecast.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, ForecastItem[]>);
}

// Get day name from date string
function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Hoy';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Mañana';
  }
  return date.toLocaleDateString('es-CO', { weekday: 'long' });
}

export function WeatherForecast({ location, className = '' }: WeatherForecastProps) {
  const { data, isLoading, error } = useWeatherForecast(location);

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
          Error al cargar pronóstico
        </p>
      </div>
    );
  }

  const groupedForecast = groupByDate(data.forecast);
  const dates = Object.keys(groupedForecast).slice(0, 5); // Max 5 days

  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 ${className}`}>
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Pronóstico 5 días
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {data.location.name}, {data.location.country}
        </p>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {dates.map((date) => {
          const items = groupedForecast[date];
          // Get midday or first available forecast
          const representative = items.find(i => i.time.startsWith('12')) || items[0];
          const minTemp = Math.min(...items.map(i => i.temp));
          const maxTemp = Math.max(...items.map(i => i.temp));
          const avgPop = Math.round(items.reduce((sum, i) => sum + i.pop, 0) / items.length);

          return (
            <div key={date} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getWeatherIconUrl(representative.icon)}
                  alt={representative.description}
                  className="h-12 w-12"
                />
                <div>
                  <p className="font-medium capitalize text-gray-900 dark:text-white">
                    {getDayName(date)}
                  </p>
                  <p className="text-sm capitalize text-gray-500 dark:text-gray-400">
                    {representative.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {avgPop > 0 && (
                  <div className="flex items-center gap-1 text-blue-500">
                    <Droplets className="h-4 w-4" />
                    <span className="text-sm">{avgPop}%</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-gray-400">
                  <Wind className="h-4 w-4" />
                  <span className="text-sm">{representative.wind_speed} m/s</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {Math.round(maxTemp)}°
                  </span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {Math.round(minTemp)}°
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeatherForecast;
