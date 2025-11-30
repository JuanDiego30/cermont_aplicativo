'use client';

import { useEffect } from 'react';
import { useGeolocation, GeolocationPosition } from '@/hooks/useGeolocation';
import { 
  MapPin, 
  Navigation, 
  RefreshCw, 
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface LocationPickerProps {
  onLocationChange?: (position: GeolocationPosition | null) => void;
  showMap?: boolean;
  autoFetch?: boolean;
  className?: string;
}

export function LocationPicker({
  onLocationChange,
  showMap = true,
  autoFetch = false,
  className = '',
}: LocationPickerProps) {
  const {
    position,
    error,
    isLoading,
    isSupported,
    hasPermission,
    getCurrentPosition,
    getGoogleMapsUrl,
    formatPosition,
  } = useGeolocation();

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && isSupported) {
      getCurrentPosition();
    }
  }, [autoFetch, isSupported, getCurrentPosition]);

  // Notify parent of location changes
  useEffect(() => {
    onLocationChange?.(position);
  }, [position, onLocationChange]);

  const handleGetLocation = async () => {
    await getCurrentPosition();
  };

  const mapsUrl = getGoogleMapsUrl();
  const formattedPosition = formatPosition();

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg ${className}`}>
        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          La geolocalización no está disponible en este navegador.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Location button and status */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleGetLocation}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Obteniendo ubicación...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              {position ? 'Actualizar ubicación' : 'Obtener ubicación'}
            </>
          )}
        </button>

        {position && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            Ubicación obtenida
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Position display */}
      {position && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-brand-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Coordenadas
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {formattedPosition}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Precisión</p>
              <p className="font-medium text-gray-900 dark:text-white">
                ±{Math.round(position.accuracy)} m
              </p>
            </div>
            {position.altitude !== null && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Altitud</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {Math.round(position.altitude)} m
                </p>
              </div>
            )}
          </div>

          {/* Google Maps link */}
          {showMap && mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Ver en Google Maps
            </a>
          )}

          {/* Embedded map preview */}
          {showMap && (
            <div className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000!2d${position.longitude}!3d${position.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sco!4v1`}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>
      )}

      {/* Permission hint */}
      {hasPermission === false && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 Tip: Revisa la configuración de tu navegador para habilitar el acceso a la ubicación.
        </p>
      )}
    </div>
  );
}

export default LocationPicker;
