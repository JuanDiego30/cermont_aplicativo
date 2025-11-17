'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type GPSCaptureProps = {
  orderId: string;
  onBack: () => void;
};

type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
};

export function GPSCapture({ orderId, onBack }: GPSCaptureProps) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedLocations, setSavedLocations] = useState<Coordinates[]>([]);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setError('Tu dispositivo no soporta geolocalizaci�n');
      return;
    }

    setIsCapturing(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };

        setCoordinates(coords);
        setSavedLocations((prev) => [...prev, coords]);
        setIsCapturing(false);
      },
      (error) => {
        setError(`Error: ${error.message}`);
        setIsCapturing(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Capturar ubicaci�n autom�ticamente al entrar
  useEffect(() => {
    captureLocation();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 pb-24 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ? Volver
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Geolocalizaci�n
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {savedLocations.length} {savedLocations.length === 1 ? 'ubicaci�n' : 'ubicaciones'} registradas
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-4 p-4">
        {/* Ubicaci�n Actual */}
        {coordinates && (
          <Card>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">??</span>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  Ubicaci�n Actual
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-neutral-500">Latitud:</span>
                  <p className="font-mono font-medium text-neutral-900 dark:text-neutral-50">
                    {coordinates.latitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-500">Longitud:</span>
                  <p className="font-mono font-medium text-neutral-900 dark:text-neutral-50">
                    {coordinates.longitude.toFixed(6)}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-neutral-500">Precisi�n:</span>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">
                    {coordinates.accuracy.toFixed(0)} metros
                  </p>
                </div>
              </div>

              {/* Google Maps Link */}
              <a
                href={`https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-lg bg-primary-500 px-4 py-2 text-center font-medium text-white hover:bg-primary-600"
              >
                Abrir en Google Maps
              </a>
            </div>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="border-error-300 bg-error-50 dark:bg-error-900/20">
            <div className="flex items-center gap-2">
              <span className="text-2xl">??</span>
              <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
            </div>
          </Card>
        )}

        {/* Bot�n Capturar */}
        <Button
          variant="primary"
          size="lg"
          onClick={captureLocation}
          isLoading={isCapturing}
          className="w-full"
        >
          <span className="mr-2 text-xl">??</span>
          {isCapturing ? 'Obteniendo ubicaci�n...' : 'Actualizar Ubicaci�n'}
        </Button>

        {/* Historial */}
        {savedLocations.length > 0 && (
          <Card>
            <h3 className="mb-3 font-semibold text-neutral-900 dark:text-neutral-50">
              Historial de Ubicaciones
            </h3>
            <div className="space-y-2">
              {savedLocations.map((loc, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-900 dark:text-neutral-50">
                      Punto {index + 1}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {new Date(loc.timestamp).toLocaleTimeString('es-CO')}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                    {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

