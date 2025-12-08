// ============================================
// EVIDENCIAS HOOKS - Cermont FSM
// Hooks para gestión de evidencias
// ============================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  evidenciasApi, 
  UploadEvidenciaInput, 
  ListEvidenciasParams,
  TipoEvidencia 
} from '../api/evidencias.api';
import { useOffline } from '@/hooks/use-offline';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';

/**
 * Hook para listar evidencias
 */
export function useEvidencias(params?: ListEvidenciasParams) {
  return useQuery({
    queryKey: ['evidencias', params],
    queryFn: () => evidenciasApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener evidencias por orden
 */
export function useEvidenciasByOrden(ordenId: string) {
  return useQuery({
    queryKey: ['evidencias', 'orden', ordenId],
    queryFn: () => evidenciasApi.getByOrdenId(ordenId),
    enabled: !!ordenId,
  });
}

/**
 * Hook para obtener evidencias por ejecución
 */
export function useEvidenciasByEjecucion(ejecucionId: string) {
  return useQuery({
    queryKey: ['evidencias', 'ejecucion', ejecucionId],
    queryFn: () => evidenciasApi.getByEjecucionId(ejecucionId),
    enabled: !!ejecucionId,
  });
}

/**
 * Hook para subir evidencia
 */
export function useUploadEvidencia() {
  const queryClient = useQueryClient();
  const { queueAction, isOnline } = useOffline();

  return useMutation({
    mutationFn: async (data: UploadEvidenciaInput) => {
      if (!isOnline) {
        // Guardar archivo en IndexedDB para sincronizar después
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(data.archivo);
        });

        await queueAction({
          endpoint: '/api/evidencias/upload',
          method: 'POST',
          payload: {
            ...data,
            archivo: base64,
            archivoNombre: data.archivo.name,
            archivoTipo: data.archivo.type,
          },
        });
        throw new Error('Guardado offline. Se sincronizará cuando haya conexión.');
      }
      return evidenciasApi.upload(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['evidencias', 'orden', data.ordenId] });
      queryClient.invalidateQueries({ queryKey: ['evidencias', 'ejecucion', data.ejecucionId] });
      toast.success('Evidencia subida exitosamente');
    },
    onError: (error: Error) => {
      if (error.message.includes('offline')) {
        toast.info(error.message);
      } else {
        toast.error(error.message || 'Error al subir evidencia');
      }
    },
  });
}

/**
 * Hook para verificar evidencia
 */
export function useVerificarEvidencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => evidenciasApi.verificar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidencias'] });
      toast.success('Evidencia verificada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al verificar evidencia');
    },
  });
}

/**
 * Hook para eliminar evidencia
 */
export function useDeleteEvidencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => evidenciasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidencias'] });
      toast.success('Evidencia eliminada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar evidencia');
    },
  });
}

/**
 * Hook para captura de cámara
 */
export function useCamera() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async (facingMode: 'user' | 'environment' = 'environment') => {
    try {
      setIsCapturing(true);
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      return mediaStream;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al acceder a la cámara';
      setError(message);
      setIsCapturing(false);
      throw err;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  }, [stream]);

  const capturePhoto = useCallback(async (videoElement: HTMLVideoElement): Promise<File> => {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No se pudo crear el contexto del canvas');
    }

    ctx.drawImage(videoElement, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
            resolve(file);
          } else {
            reject(new Error('Error al capturar foto'));
          }
        },
        'image/jpeg',
        0.85
      );
    });
  }, []);

  return {
    isCapturing,
    stream,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
  };
}

/**
 * Hook para obtener ubicación GPS
 */
export function useGeoLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = useCallback(async (): Promise<{
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: string;
  }> => {
    setIsLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setError('Geolocalización no soportada');
        setIsLoading(false);
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          });
        },
        (err) => {
          setIsLoading(false);
          const message = err.message || 'Error al obtener ubicación';
          setError(message);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  return {
    isLoading,
    error,
    getCurrentPosition,
  };
}
