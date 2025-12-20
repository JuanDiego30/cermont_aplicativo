/**
 * @file page.tsx
 * @description Página de Weather con mejor UI/UX
 */

'use client';

import React, { useState } from 'react';
import { useWeather, useWeatherForecast } from '@/features/weather';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Cloud, MapPin, Thermometer, Droplets, Wind, Eye } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function WeatherPage() {
  const [coords, setCoords] = useState({ latitud: 4.6097, longitud: -74.0817 }); // Bogotá por defecto
  const [customCoords, setCustomCoords] = useState({ latitud: '', longitud: '' });

  const { data: weather, isLoading: loadingWeather } = useWeather(coords);
  const { data: forecast, isLoading: loadingForecast } = useWeatherForecast({ ...coords, dias: 7 });

  const handleSearch = () => {
    const lat = parseFloat(customCoords.latitud);
    const lng = parseFloat(customCoords.longitud);
    if (!isNaN(lat) && !isNaN(lng)) {
      setCoords({ latitud: lat, longitud: lng });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Cloud className="w-6 h-6" />
            Clima
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Información meteorológica para ubicaciones de trabajo
          </p>
        </div>
      </div>

      {/* Búsqueda de coordenadas */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Buscar por Coordenadas
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Latitud
            </label>
            <Input
              type="number"
              step="any"
              placeholder="4.6097"
              value={customCoords.latitud}
              onChange={(e) => setCustomCoords({ ...customCoords, latitud: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Longitud
            </label>
            <Input
              type="number"
              step="any"
              placeholder="-74.0817"
              value={customCoords.longitud}
              onChange={(e) => setCustomCoords({ ...customCoords, longitud: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleSearch} className="w-full">
              Buscar
            </Button>
          </div>
        </div>
      </Card>

      {/* Clima Actual */}
      {loadingWeather ? (
        <Card className="p-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </Card>
      ) : weather ? (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Clima Actual
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Temperatura Principal */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Thermometer className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                    {weather.temperatura.actual}°
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {weather.temperatura.min}° / {weather.temperatura.max}°
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {weather.condiciones.descripcion}
                  </p>
                </div>
              </div>
            </div>

            {/* Detalles */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Droplets className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Humedad</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{weather.humedad}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Wind className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Viento</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {weather.viento.velocidad} {weather.viento.unidad}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Visibilidad</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{weather.visibilidad} km</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Pronóstico */}
      {loadingForecast ? (
        <Card className="p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </Card>
      ) : forecast?.data && forecast.data.length > 0 ? (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Pronóstico 7 Días
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {forecast.data.map((dia, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {new Date(dia.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {dia.temperatura.max}°
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {dia.temperatura.min}°
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {dia.probabilidadLluvia}% lluvia
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
