/**
 * ARCHIVO: MapaGPS.tsx
 * FUNCION: Mapa GPS interactivo para rastrear órdenes, técnicos, vehículos y alertas
 * IMPLEMENTACION: Leaflet desde CDN, marcadores personalizados, rutas de seguimiento, geolocalización del usuario
 * DEPENDENCIAS: React, lucide-react, Leaflet (CDN dinámico)
 * EXPORTS: MapaGPS (named), default, interfaces (GPSLocation, MapMarker, RouteTrack)
 */
'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  MapPin,
  Locate,
  Filter,
  User,
  Truck,
  AlertTriangle
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface GPSLocation {
  lat: number;
  lng: number;
  timestamp?: string;
  accuracy?: number;
}

export interface MapMarker {
  id: string;
  position: GPSLocation;
  type: 'orden' | 'tecnico' | 'vehiculo' | 'punto_interes' | 'alerta';
  title: string;
  subtitle?: string;
  status?: string;
  icon?: string;
  color?: string;
  metadata?: Record<string, any>;
}

export interface RouteTrack {
  id: string;
  points: GPSLocation[];
  color: string;
  label: string;
  tecnicoId?: string;
  ordenId?: string;
  fecha: string;
}

interface MapaGPSProps {
  markers?: MapMarker[];
  routes?: RouteTrack[];
  center?: GPSLocation;
  zoom?: number;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (location: GPSLocation) => void;
  showCurrentLocation?: boolean;
  showFilters?: boolean;
  className?: string;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_MARKERS: MapMarker[] = [
  {
    id: 'orden-1',
    position: { lat: 7.0847, lng: -70.7564 },
    type: 'orden',
    title: 'OT-2024-001',
    subtitle: 'Mantenimiento Torre T-15',
    status: 'EN_EJECUCION',
    color: '#3B82F6',
  },
  {
    id: 'orden-2',
    position: { lat: 7.0912, lng: -70.7623 },
    type: 'orden',
    title: 'OT-2024-002',
    subtitle: 'Inspección Línea de Vida',
    status: 'PENDIENTE',
    color: '#F59E0B',
  },
  {
    id: 'tecnico-1',
    position: { lat: 7.0867, lng: -70.7589 },
    type: 'tecnico',
    title: 'Carlos Rodríguez',
    subtitle: 'Técnico Electricista',
    status: 'ACTIVO',
    color: '#10B981',
  },
  {
    id: 'vehiculo-1',
    position: { lat: 7.0825, lng: -70.7541 },
    type: 'vehiculo',
    title: 'Camioneta CLM-001',
    subtitle: 'En ruta a T-15',
    status: 'EN_MOVIMIENTO',
    color: '#8B5CF6',
  },
  {
    id: 'alerta-1',
    position: { lat: 7.0889, lng: -70.7612 },
    type: 'alerta',
    title: 'Zona de riesgo',
    subtitle: 'Precaución: trabajo en alturas',
    status: 'ACTIVA',
    color: '#EF4444',
  },
];

const MOCK_ROUTES: RouteTrack[] = [
  {
    id: 'route-1',
    label: 'Recorrido Carlos R.',
    color: '#3B82F6',
    fecha: '2024-12-08',
    tecnicoId: 'tecnico-1',
    points: [
      { lat: 7.0800, lng: -70.7500, timestamp: '08:00:00' },
      { lat: 7.0820, lng: -70.7520, timestamp: '08:15:00' },
      { lat: 7.0845, lng: -70.7555, timestamp: '08:30:00' },
      { lat: 7.0867, lng: -70.7589, timestamp: '09:00:00' },
    ],
  },
];

// ============================================
// HELPERS (movidos antes del componente)
// ============================================

function createCustomIcon(L: any, marker: MapMarker) {
  const color = marker.color || '#3B82F6';
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="transform: rotate(45deg); color: white; font-size: 14px;">
        ${getMarkerEmoji(marker.type)}
      </span>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

function createPopupContent(marker: MapMarker): string {
  return `
    <div style="min-width: 150px;">
      <strong>${marker.title}</strong>
      ${marker.subtitle ? `<br><span style="color: #666; font-size: 12px;">${marker.subtitle}</span>` : ''}
      ${marker.status ? `<br><span style="color: #888; font-size: 11px;">${marker.status}</span>` : ''}
    </div>
  `;
}

function getMarkerEmoji(type: string): string {
  const emojis: Record<string, string> = {
    orden: '📋',
    tecnico: '👷',
    vehiculo: '🚗',
    punto_interes: '📍',
    alerta: '⚠️',
  };
  return emojis[type] || '📍';
}

function getMarkerIcon(type: string) {
  switch (type) {
    case 'orden': return <MapPin className="w-5 h-5" />;
    case 'tecnico': return <User className="w-5 h-5" />;
    case 'vehiculo': return <Truck className="w-5 h-5" />;
    case 'alerta': return <AlertTriangle className="w-5 h-5" />;
    default: return <MapPin className="w-5 h-5" />;
  }
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    EN_EJECUCION: 'bg-blue-100 text-blue-700',
    PENDIENTE: 'bg-yellow-100 text-yellow-700',
    COMPLETADA: 'bg-green-100 text-green-700',
    ACTIVO: 'bg-green-100 text-green-700',
    EN_MOVIMIENTO: 'bg-purple-100 text-purple-700',
    ACTIVA: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

// ============================================
// COMPONENT
// ============================================

export function MapaGPS({
  markers = MOCK_MARKERS,
  routes = MOCK_ROUTES,
  center = { lat: 7.0850, lng: -70.7570 },
  zoom = 14,
  onMarkerClick,
  onMapClick,
  showCurrentLocation = true,
  showFilters = true,
  className = '',
}: MapaGPSProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(
    new Set(['orden', 'tecnico', 'vehiculo', 'alerta'])
  );
  const [showRoutes, setShowRoutes] = useState(true);

  // Inicializar mapa (definido ANTES del useEffect que lo usa)
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !(window as any).L || mapInstanceRef.current) return;

    const L = (window as any).L;

    // Crear mapa
    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: zoom,
      zoomControl: false,
    });

    // Capa base (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Controles de zoom personalizados
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;
    setMapInstance(map);
    setIsLoading(false);

    // Click en mapa
    map.on('click', (e: any) => {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });
  }, [center.lat, center.lng, zoom, onMapClick]);

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    const loadLeaflet = async () => {
      if (typeof window === 'undefined' || mapInstanceRef.current || !mapRef.current) return;

      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const onLeafletReady = () => {
        if (!mapInstanceRef.current) {
          initializeMap();
        }
      };

      if (!(window as any).L) {
        script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = onLeafletReady;
        document.head.appendChild(script);
      } else {
        onLeafletReady();
      }
    };

    loadLeaflet();

    return () => {
      if (script) {
        script.onload = null;
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapInstance(null);
      }
    };
  }, [initializeMap]);

  // Actualizar marcadores
  useEffect(() => {
    if (!mapInstance || !(window as any).L) return;

    const L = (window as any).L;

    // Limpiar marcadores anteriores
    mapInstance.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        mapInstance.removeLayer(layer);
      }
    });

    // Agregar marcadores visibles
    markers
      .filter(m => visibleTypes.has(m.type))
      .forEach(marker => {
        const icon = createCustomIcon(L, marker);

        const leafletMarker = L.marker([marker.position.lat, marker.position.lng], { icon })
          .addTo(mapInstance)
          .bindPopup(createPopupContent(marker));

        leafletMarker.on('click', () => {
          setSelectedMarker(marker);
          if (onMarkerClick) onMarkerClick(marker);
        });
      });

    // Ubicación actual
    if (currentLocation) {
      L.circleMarker([currentLocation.lat, currentLocation.lng], {
        radius: 10,
        fillColor: '#3B82F6',
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(mapInstance);
    }
  }, [mapInstance, markers, visibleTypes, currentLocation, onMarkerClick]);

  // Actualizar rutas
  useEffect(() => {
    if (!mapInstance || !(window as any).L || !showRoutes) return;

    const L = (window as any).L;

    // Limpiar rutas anteriores
    mapInstance.eachLayer((layer: any) => {
      if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
        mapInstance.removeLayer(layer);
      }
    });

    // Agregar rutas
    routes.forEach(route => {
      const validPoints = route.points.filter((point) =>
        Number.isFinite(point.lat) && Number.isFinite(point.lng)
      );

      if (!validPoints.length) {
        return;
      }

      if (validPoints.length >= 2) {
        const latLngs = validPoints.map(p => [p.lat, p.lng]);
        L.polyline(latLngs, {
          color: route.color,
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 5',
        })
          .addTo(mapInstance)
          .bindPopup(`<strong>${route.label}</strong><br>Fecha: ${route.fecha}`);
      }

      if (validPoints.length > 0) {
        const start = validPoints[0];
        const end = validPoints[validPoints.length - 1];

        L.circleMarker([start.lat, start.lng], {
          radius: 6,
          fillColor: '#10B981',
          color: '#fff',
          weight: 2,
          fillOpacity: 1,
        }).addTo(mapInstance).bindPopup('Inicio: ' + (start.timestamp || ''));

        if (validPoints.length > 1) {
          L.circleMarker([end.lat, end.lng], {
            radius: 6,
            fillColor: '#EF4444',
            color: '#fff',
            weight: 2,
            fillOpacity: 1,
          }).addTo(mapInstance).bindPopup('Fin: ' + (end.timestamp || ''));
        }
      }
    });
  }, [mapInstance, routes, showRoutes]);

  // Obtener ubicación actual
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc: GPSLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
        setCurrentLocation(loc);

        if (mapInstance) {
          mapInstance.setView([loc.lat, loc.lng], 16);
        }
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('No se pudo obtener la ubicación');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [mapInstance]);

  // Toggle tipo de marcador
  const toggleMarkerType = (type: string) => {
    setVisibleTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  return (
    <div className={`relative bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden ${className}`}>
      {/* Mapa */}
      <div ref={mapRef} className="w-full h-full min-h-100" />

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
            <p className="text-gray-500">Cargando mapa...</p>
          </div>
        </div>
      )}

      {/* Controles superiores */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-1000">
        {/* Filtros */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
            <div className="flex items-center gap-1">
              <Filter className="w-4 h-4 text-gray-500 mx-2" />
              <button
                onClick={() => toggleMarkerType('orden')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition ${visibleTypes.has('orden')
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500'
                  }`}
              >
                Órdenes
              </button>
              <button
                onClick={() => toggleMarkerType('tecnico')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition ${visibleTypes.has('tecnico')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
                  }`}
              >
                Técnicos
              </button>
              <button
                onClick={() => toggleMarkerType('vehiculo')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition ${visibleTypes.has('vehiculo')
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-500'
                  }`}
              >
                Vehículos
              </button>
              <button
                onClick={() => toggleMarkerType('alerta')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition ${visibleTypes.has('alerta')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-500'
                  }`}
              >
                Alertas
              </button>
              <button
                onClick={() => setShowRoutes(!showRoutes)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition ${showRoutes
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-500'
                  }`}
              >
                Rutas
              </button>
            </div>
          </div>
        )}

        {/* Botón de ubicación */}
        {showCurrentLocation && (
          <button
            onClick={getCurrentLocation}
            className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            title="Mi ubicación"
          >
            <Locate className="w-5 h-5 text-blue-600" />
          </button>
        )}
      </div>

      {/* Panel de información del marcador seleccionado */}
      {selectedMarker && (
        <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-1000">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: selectedMarker.color || '#3B82F6' }}
            >
              {getMarkerIcon(selectedMarker.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {selectedMarker.title}
                </h4>
                <button
                  onClick={() => setSelectedMarker(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  ×
                </button>
              </div>
              {selectedMarker.subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedMarker.subtitle}
                </p>
              )}
              {selectedMarker.status && (
                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedMarker.status)}`}>
                  {selectedMarker.status.replace(/_/g, ' ')}
                </span>
              )}
              <p className="text-xs text-gray-400 mt-2">
                📍 {selectedMarker.position.lat.toFixed(6)}, {selectedMarker.position.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-1000">
        <p className="text-xs font-semibold text-gray-500 mb-2">Leyenda</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Órdenes de Trabajo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Técnicos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-gray-600 dark:text-gray-400">Vehículos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600 dark:text-gray-400">Alertas</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapaGPS;

