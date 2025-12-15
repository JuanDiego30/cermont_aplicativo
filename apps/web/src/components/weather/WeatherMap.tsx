/**
 * ARCHIVO: WeatherMap.tsx
 * FUNCION: Mapa meteorológico interactivo con datos de clima en tiempo real
 * IMPLEMENTACION: Carga Leaflet desde CDN, muestra ubicación de Caño Limón con datos de Open-Meteo, alertas y pronóstico
 * DEPENDENCIAS: React, lucide-react, useWeatherSummary, Leaflet (CDN dinámico)
 * EXPORTS: WeatherMap (named), default export
 */
'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import { useWeatherSummary } from '@/hooks/useWeather';
import type { WeatherData, WeatherAlert, HourlyForecast } from '@/services/weather.service';

// Declaración de tipo para Leaflet (cargado dinámicamente desde CDN)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletLib = any;

// ============================================
// TYPES
// ============================================

interface WeatherMapProps {
  className?: string;
  showAlerts?: boolean;
  showForecast?: boolean;
  refreshInterval?: number;
}

// ============================================
// COMPONENT
// ============================================

export const WeatherMap: React.FC<WeatherMapProps> = ({
  className = '',
  showAlerts = true,
  showForecast = true,
  refreshInterval = 5 * 60 * 1000, // 5 minutos
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<LeafletLib>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Coordenadas de Caño Limón
  const CANO_LIMON = { lat: 5.3667, lon: -71.7994 };

  // Hook de datos meteorológicos
  const {
    data,
    isLoading,
    error,
    isValidating: isFetching,
    mutate: refetch
  } = useWeatherSummary({
    lat: CANO_LIMON.lat,
    lon: CANO_LIMON.lon,
    refreshInterval
  });

  const {
    current,
    rainfall = [],
    alerts = [],
    hourlyNext12: hourly = [],
  } = data || {};

  const isError = !!error;

  // ============================================
  // INICIALIZAR MAPA LEAFLET CON RAINVIEWER
  // ============================================

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Cargar Leaflet desde CDN
    const loadLeaflet = async () => {
      if ((window as any).L) {
        initializeMap();
        return;
      }

      // Cargar CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Cargar JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initializeMap();
      document.body.appendChild(script);
    };

    const initializeMap = async () => {
      const L = (window as any).L;
      if (!L || !mapRef.current || leafletMapRef.current) return;

      // Crear mapa
      const map = L.map(mapRef.current).setView([CANO_LIMON.lat, CANO_LIMON.lon], 7);

      // Capa base: OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // ============================================
      // RAINVIEWER - Radar de precipitación en tiempo real (Open Source)
      // ============================================
      try {
        // Obtener timestamps de RainViewer
        const rainviewerResponse = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const rainviewerData = await rainviewerResponse.json();

        if (rainviewerData.radar?.past?.length > 0) {
          // Usar el timestamp más reciente
          const latestRadar = rainviewerData.radar.past[rainviewerData.radar.past.length - 1];

          // Capa de radar de precipitación
          const radarLayer = L.tileLayer(
            `https://tilecache.rainviewer.com${latestRadar.path}/512/{z}/{x}/{y}/2/1_1.png`,
            {
              attribution: 'RainViewer.com',
              opacity: 0.6,
              maxZoom: 18,
            }
          );
          radarLayer.addTo(map);

          // Agregar animación de radar (opcional - cicla a través de los frames pasados)
          let currentFrame = rainviewerData.radar.past.length - 1;
          const radarFrames = rainviewerData.radar.past;

          // Actualizar radar cada 2 segundos para animación
          const radarInterval = setInterval(() => {
            radarLayer.setUrl(
              `https://tilecache.rainviewer.com${radarFrames[currentFrame].path}/512/{z}/{x}/{y}/2/1_1.png`
            );
            currentFrame = (currentFrame + 1) % radarFrames.length;
          }, 2000);

          // Limpiar intervalo al desmontar
          (map as any)._radarInterval = radarInterval;
        }
      } catch (e) {
        console.warn('RainViewer no disponible, continuando sin radar:', e);
      }

      // Marcador de Caño Limón
      const mainMarker = L.marker([CANO_LIMON.lat, CANO_LIMON.lon], {
        icon: L.divIcon({
          className: 'weather-marker',
          html: `<div class="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full border-2 border-white shadow-lg">
                   <span class="text-white text-lg">🌡️</span>
                 </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        }),
      }).addTo(map);

      mainMarker.bindPopup(`
        <div class="text-center p-2">
          <strong>Caño Limón</strong><br>
          <span class="text-gray-600">Arauca, Colombia</span><br>
          <span class="text-xs">${CANO_LIMON.lat}°N, ${Math.abs(CANO_LIMON.lon)}°W</span>
        </div>
      `);

      // Leyenda del radar
      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'bg-white/90 p-2 rounded shadow text-xs');
        div.innerHTML = `
          <div class="font-semibold mb-1">🌧️ Precipitación</div>
          <div class="flex items-center gap-1">
            <span class="w-3 h-3 rounded" style="background: #0000FF40"></span> Leve
          </div>
          <div class="flex items-center gap-1">
            <span class="w-3 h-3 rounded" style="background: #00FF0080"></span> Moderada
          </div>
          <div class="flex items-center gap-1">
            <span class="w-3 h-3 rounded" style="background: #FFFF00A0"></span> Fuerte
          </div>
          <div class="flex items-center gap-1">
            <span class="w-3 h-3 rounded" style="background: #FF0000C0"></span> Intensa
          </div>
        `;
        return div;
      };
      legend.addTo(map);

      leafletMapRef.current = map;
      setMapLoaded(true);
    };

    loadLeaflet();

    return () => {
      if (leafletMapRef.current) {
        // Limpiar intervalo del radar
        if ((leafletMapRef.current as any)._radarInterval) {
          clearInterval((leafletMapRef.current as any)._radarInterval);
        }
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // ============================================
  // ACTUALIZAR POPUP CON DATOS DE CLIMA
  // ============================================

  useEffect(() => {
    if (!leafletMapRef.current || !current || !mapLoaded) return;

    const L = (window as any).L;

    // Actualizar o crear círculo de nubes
    const cloudOpacity = (current.cloudCover || 0) / 100;

    // Añadir círculo de cobertura de nubes
    L.circle([CANO_LIMON.lat, CANO_LIMON.lon], {
      color: 'gray',
      fillColor: '#9CA3AF',
      fillOpacity: cloudOpacity * 0.3,
      radius: 15000, // 15km
    }).addTo(leafletMapRef.current);

    // Si hay lluvia, añadir indicador
    if (current.precipitation > 0) {
      L.circle([CANO_LIMON.lat, CANO_LIMON.lon], {
        color: 'blue',
        fillColor: '#3B82F6',
        fillOpacity: 0.4,
        radius: 10000,
      }).addTo(leafletMapRef.current);
    }
  }, [current, mapLoaded]);

  // ============================================
  // HELPERS
  // ============================================

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'CRITICA': return 'bg-red-500 text-white';
      case 'ALTA': return 'bg-orange-500 text-white';
      case 'MEDIA': return 'bg-yellow-500 text-black';
      case 'BAJA': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  // ============================================
  // RENDER
  // ============================================

  if (isError) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <span>Error al cargar datos meteorológicos</span>
        </div>
        <button
          onClick={() => refetch()}
          className="mt-2 text-sm text-red-600 hover:underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-cyan-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <h2 className="text-lg font-semibold">
              Clima en Caño Limón, Arauca
            </h2>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {current && (
          <p className="text-sm text-blue-100 mt-1">
            Actualizado: {new Date(current.timestamp).toLocaleTimeString('es-CO')}
          </p>
        )}
      </div>

      {/* Mapa */}
      <div ref={mapRef} className="w-full h-64 md:h-80" />

      {/* Datos actuales */}
      {isLoading ? (
        <div className="p-4 animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-20 rounded-lg" />
            ))}
          </div>
        </div>
      ) : current && (
        <div className="p-4">
          {/* Panel de datos principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {/* Temperatura */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Thermometer className="w-4 h-4" />
                <span className="text-xs font-medium">Temperatura</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {current.temperature.toFixed(1)}°C
              </p>
              <p className="text-xs text-gray-500">
                Sensación: {current.feelsLike.toFixed(1)}°C
              </p>
            </div>

            {/* Humedad */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Droplets className="w-4 h-4" />
                <span className="text-xs font-medium">Humedad</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {current.humidity}%
              </p>
              <p className="text-xs text-gray-500">
                Presión: {current.pressure} hPa
              </p>
            </div>

            {/* Nubes */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Cloud className="w-4 h-4" />
                <span className="text-xs font-medium">Nubosidad</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {current.cloudCover}%
              </p>
              <p className="text-xs text-gray-500">
                {current.description}
              </p>
            </div>

            {/* Viento */}
            <div className="bg-cyan-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-cyan-600 mb-1">
                <Wind className="w-4 h-4" />
                <span className="text-xs font-medium">Viento</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {current.windSpeed.toFixed(1)} m/s
              </p>
              <p className="text-xs text-gray-500">
                Dirección: {getWindDirection(current.windDirection)}
              </p>
            </div>
          </div>

          {/* Fila adicional de datos */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Precipitación */}
            <div className="bg-indigo-50 p-3 rounded-lg flex items-center gap-3">
              <CloudRain className="w-6 h-6 text-indigo-500" />
              <div>
                <p className="text-xs text-gray-500">Precipitación</p>
                <p className="font-semibold">{current.precipitation} mm</p>
              </div>
            </div>

            {/* UV */}
            <div className="bg-yellow-50 p-3 rounded-lg flex items-center gap-3">
              <Sun className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="text-xs text-gray-500">Índice UV</p>
                <p className="font-semibold">{current.uvIndex?.toFixed(1) ?? 'N/A'}</p>
              </div>
            </div>

            {/* Estado */}
            <div className="bg-green-50 p-3 rounded-lg flex items-center gap-3">
              <span className="text-2xl">{current.icon}</span>
              <div>
                <p className="text-xs text-gray-500">Estado</p>
                <p className="font-semibold text-sm">{current.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alertas */}
      {showAlerts && alerts.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Alertas Activas ({alerts.length})
          </h3>
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{alert.title}</p>
                    <p className="text-sm opacity-90">{alert.description}</p>
                    <p className="text-xs mt-1 opacity-75">
                      💡 {alert.recommendation}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-white/20 rounded">
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pronóstico por hora */}
      {showForecast && hourly.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Próximas 12 Horas
          </h3>
          <div className="flex overflow-x-auto gap-3 pb-2">
            {hourly.map((hour, idx) => (
              <div
                key={idx}
                className="shrink-0 bg-gray-50 p-3 rounded-lg text-center min-w-20"
              >
                <p className="text-xs text-gray-500">
                  {new Date(hour.time).toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xl my-1">{hour.icon}</p>
                <p className="font-semibold">{hour.temperature.toFixed(0)}°C</p>
                <p className="text-xs text-blue-500">
                  💧 {hour.precipitationProbability}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pronóstico de lluvia (7 días) */}
      {showForecast && rainfall.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Pronóstico de Lluvia (7 días)
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {rainfall.map((day, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-2 rounded-lg text-center text-sm"
              >
                <p className="text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString('es-CO', {
                    weekday: 'short',
                  })}
                </p>
                <p className="font-semibold text-blue-600">
                  {day.precipitationProbability}%
                </p>
                <p className="text-xs text-gray-600">
                  {day.rainSum.toFixed(1)}mm
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherMap;
