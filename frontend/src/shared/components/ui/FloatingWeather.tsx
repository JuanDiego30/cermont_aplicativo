'use client';

/**
 * Floating Weather Widget
 * Shows current weather in a small floating bubble
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  X,
  MapPin,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useCurrentWeather, CANO_LIMON_COORDS } from '@/features/weather';

interface FloatingWeatherProps {
  className?: string;
}

const getWeatherIcon = (iconCode?: string) => {
  if (!iconCode) return <Cloud className="h-6 w-6" />;

  const code = iconCode.slice(0, 2);
  switch (code) {
    case '01':
      return <Sun className="h-6 w-6 text-yellow-500" />;
    case '02':
    case '03':
    case '04':
      return <Cloud className="h-6 w-6 text-gray-400" />;
    case '09':
    case '10':
      return <CloudRain className="h-6 w-6 text-blue-500" />;
    case '11':
      return <CloudLightning className="h-6 w-6 text-yellow-600" />;
    case '13':
      return <CloudSnow className="h-6 w-6 text-blue-300" />;
    default:
      return <Cloud className="h-6 w-6 text-gray-400" />;
  }
};

export function FloatingWeather({ className = '' }: FloatingWeatherProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const { data, isLoading } = useCurrentWeather(CANO_LIMON_COORDS);
  const weather = data?.current;

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      className={`fixed right-6 top-24 z-40 ${className}`}
    >
      <motion.div
        layout
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95"
      >
        {/* Collapsed View - Using div instead of nested buttons to avoid hydration error */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
          className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {isLoading ? (
            <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          ) : (
            getWeatherIcon(weather?.icon)
          )}

          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {weather?.temp != null ? `${Math.round(weather.temp)}°C` : '--°C'}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="h-3 w-3" />
              <span>Caño Limón</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="ml-2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
            aria-label="Cerrar widget de clima"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Expanded View */}
        <AnimatePresence>
          {isExpanded && weather && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-200 dark:border-gray-700"
            >
              <div className="p-4">
                {/* Description */}
                <p className="mb-4 text-center text-sm capitalize text-gray-600 dark:text-gray-300">
                  {weather.description || 'Sin datos'}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Humedad</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {weather.humidity ?? '--'}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/20">
                    <Wind className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Viento</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {weather.wind_speed != null ? `${Math.round(weather.wind_speed)} km/h` : '--'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 dark:bg-orange-900/20">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sensación</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {weather.feels_like != null ? `${Math.round(weather.feels_like)}°C` : '--°C'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-900/20">
                    <Cloud className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nubes</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {weather.clouds ?? '--'}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Link to full weather page */}
                <a
                  href="/weather"
                  className="mt-4 block w-full rounded-lg bg-linear-to-r from-blue-500 to-cyan-500 py-2 text-center text-sm font-medium text-white transition-all hover:shadow-lg"
                >
                  Ver pronóstico completo
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default FloatingWeather;
