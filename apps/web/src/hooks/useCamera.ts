'use client';

import { useState, useCallback, useRef } from 'react';

interface CameraState {
  stream: MediaStream | null;
  error: string | null;
  isActive: boolean;
}

export function useCamera() {
  const [state, setState] = useState<CameraState>({
    stream: null,
    error: null,
    isActive: false,
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = useCallback(async (facingMode: 'user' | 'environment' = 'environment') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      
      setState({ stream, error: null, isActive: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error al acceder a la cámara';
      setState({ stream: null, error, isActive: false });
      throw new Error(error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
    }
    setState({ stream: null, error: null, isActive: false });
  }, [state.stream]);

  const takePhoto = useCallback((): Blob | null => {
    if (!videoRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(videoRef.current, 0, 0);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
    }) as unknown as Blob;
  }, []);

  return {
    ...state,
    videoRef,
    startCamera,
    stopCamera,
    takePhoto,
  };
}
