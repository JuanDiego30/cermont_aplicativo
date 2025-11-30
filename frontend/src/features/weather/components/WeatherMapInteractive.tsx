'use client';

/**
 * Interactive Weather Map with Cloud Layers
 * Uses Leaflet for map and OpenWeatherMap tiles for weather layers
 */

import { useEffect, useRef, useState } from 'react';
import { 
  Loader2, 
  Layers, 
  CloudRain, 
  Thermometer, 
  Wind, 
  Eye,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { useMultiLocationWeather, CANO_LIMON_COORDS } from '@/features/weather';
import { COLOMBIAN_REGIONS, type WeatherMapRegion } from '../types';

// OpenWeatherMap API key should be in env
const OWM_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || '';

type WeatherLayer = 'clouds_new' | 'precipitation_new' | 'temp_new' | 'wind_new' | 'none';

const LAYER_OPTIONS: { id: WeatherLayer; label: string; icon: typeof CloudRain }[] = [
  { id: 'clouds_new', label: 'Nubes', icon: CloudRain },
  { id: 'precipitation_new', label: 'Precipitación', icon: CloudRain },
  { id: 'temp_new', label: 'Temperatura', icon: Thermometer },
  { id: 'wind_new', label: 'Viento', icon: Wind },
  { id: 'none', label: 'Sin capa', icon: Eye },
];

interface WeatherMapInteractiveProps {
  className?: string;
  onSelectRegion?: (region: WeatherMapRegion) => void;
}

export function WeatherMapInteractive({ 
  className = '', 
  onSelectRegion 
}: WeatherMapInteractiveProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const weatherLayerRef = useRef<any>(null);
  
  const [selectedLayer, setSelectedLayer] = useState<WeatherLayer>('clouds_new');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<WeatherMapRegion | null>(null);
  
  const { data: weatherData, isLoading, refetch, isFetching } = useMultiLocationWeather(COLOMBIAN_REGIONS);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const initMap = async () => {
      // Dynamically import Leaflet
      const L = (await import('leaflet')).default;
      
      // Import CSS via link tag (to avoid TypeScript errors)
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Clean up existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Create map centered on Colombia
      const map = L.map(mapRef.current!, {
        center: [5.5, -73.5],
        zoom: 6,
        zoomControl: true,
        attributionControl: true,
      });

      // Base tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
      setIsMapLoading(false);

      // Add initial weather layer
      if (selectedLayer !== 'none' && OWM_API_KEY) {
        addWeatherLayer(L, map, selectedLayer);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update weather layer when selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    const updateLayer = async () => {
      const L = (await import('leaflet')).default;
      addWeatherLayer(L, mapInstanceRef.current, selectedLayer);
    };

    updateLayer();
  }, [selectedLayer]);

  // Add weather markers when data loads
  useEffect(() => {
    if (!mapInstanceRef.current || !weatherData || typeof window === 'undefined') return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      // Clear existing markers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Add markers for each region
      COLOMBIAN_REGIONS.forEach((region) => {
        const weather = weatherData.find(w => 
          w.location.lat === region.lat && w.location.lon === region.lon
        )?.data;

        const temp = weather?.current?.temp;
        const icon = weather?.current?.icon;
        
        // Custom icon
        const customIcon = L.divIcon({
          className: 'custom-weather-marker',
          html: `
            <div class="flex flex-col items-center">
              <div class="flex h-10 w-10 items-center justify-center rounded-full shadow-lg ${
                region.id === 'cano-limon' 
                  ? 'bg-red-500' 
                  : selectedRegion?.id === region.id 
                    ? 'bg-green-500' 
                    : 'bg-blue-500'
              }">
                ${icon 
                  ? `<img src="https://openweathermap.org/img/wn/${icon}.png" alt="" class="h-8 w-8" />`
                  : '<svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>'
                }
              </div>
              <div class="mt-1 rounded bg-white/90 px-2 py-0.5 text-xs font-semibold text-gray-800 shadow dark:bg-gray-800/90 dark:text-white">
                ${region.name}${temp != null ? ` ${Math.round(temp)}°C` : ''}
              </div>
            </div>
          `,
          iconSize: [80, 60],
          iconAnchor: [40, 50],
        });

        const marker = L.marker([region.lat, region.lon], { icon: customIcon })
          .addTo(map)
          .on('click', () => {
            setSelectedRegion(region);
            onSelectRegion?.(region);
          });

        // Popup with weather details
        if (weather?.current) {
          marker.bindPopup(`
            <div class="min-w-[200px] p-2">
              <h4 class="font-bold text-gray-900">${region.name}</h4>
              <p class="capitalize text-gray-600">${weather.current.description}</p>
              <div class="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>🌡️ ${Math.round(weather.current.temp)}°C</div>
                <div>💧 ${weather.current.humidity}%</div>
                <div>💨 ${Math.round(weather.current.wind_speed)} km/h</div>
                <div>☁️ ${weather.current.clouds}%</div>
              </div>
            </div>
          `);
        }
      });
    };

    addMarkers();
  }, [weatherData, selectedRegion, onSelectRegion]);

  const addWeatherLayer = (L: any, map: any, layerType: WeatherLayer) => {
    // Remove existing weather layer
    if (weatherLayerRef.current) {
      map.removeLayer(weatherLayerRef.current);
      weatherLayerRef.current = null;
    }

    if (layerType === 'none' || !OWM_API_KEY) return;

    // Add new weather layer from OpenWeatherMap
    const weatherLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/${layerType}/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
      {
        attribution: '© OpenWeatherMap',
        opacity: 0.6,
        maxZoom: 18,
      }
    );

    weatherLayer.addTo(map);
    weatherLayerRef.current = weatherLayer;
  };

  const handleRegionClick = (region: WeatherMapRegion) => {
    setSelectedRegion(region);
    onSelectRegion?.(region);
    
    // Pan to region
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([region.lat, region.lon], 8, {
        animate: true,
        duration: 0.5,
      });
    }
  };

  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mapa Climatológico - Colombia
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vista interactiva con capas meteorológicas en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Layer Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Layers className="h-4 w-4" />
              Capas
            </button>
            
            {showLayerMenu && (
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {LAYER_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSelectedLayer(option.id);
                      setShowLayerMenu(false);
                    }}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors ${
                      selectedLayer === option.id
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                    {selectedLayer === option.id && (
                      <span className="ml-auto text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[500px]">
        {(isMapLoading || isLoading) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="text-sm text-gray-500">Cargando mapa...</span>
            </div>
          </div>
        )}
        
        <div ref={mapRef} className="h-full w-full" />

        {/* Selected Layer Info */}
        {selectedLayer !== 'none' && (
          <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-white/90 px-3 py-2 text-sm shadow-lg dark:bg-gray-800/90">
            <div className="flex items-center gap-2">
              {LAYER_OPTIONS.find(l => l.id === selectedLayer)?.icon && (
                <CloudRain className="h-4 w-4 text-blue-500" />
              )}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Capa: {LAYER_OPTIONS.find(l => l.id === selectedLayer)?.label}
              </span>
            </div>
          </div>
        )}

        {/* API Key Warning */}
        {!OWM_API_KEY && (
          <div className="absolute bottom-4 right-4 z-10 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800 shadow-lg dark:bg-yellow-900/50 dark:text-yellow-200">
            ⚠️ Configura NEXT_PUBLIC_OPENWEATHERMAP_API_KEY para ver capas meteorológicas
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 border-t border-gray-200 px-6 py-3 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Caño Limón (Principal)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Ciudades</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Seleccionado</span>
        </div>
      </div>
    </div>
  );
}

export default WeatherMapInteractive;
