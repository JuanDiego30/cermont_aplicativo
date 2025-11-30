'use client';

import { useState, useRef, useCallback } from 'react';

export interface CameraOptions {
  facingMode?: 'user' | 'environment';
  quality?: number; // 0-1
  maxWidth?: number;
  maxHeight?: number;
}

export interface CapturedPhoto {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  timestamp: Date;
}

export interface UseCameraReturn {
  // State
  isSupported: boolean;
  isCapturing: boolean;
  hasPermission: boolean | null;
  error: string | null;
  photo: CapturedPhoto | null;
  stream: MediaStream | null;
  
  // Refs
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  
  // Actions
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => Promise<CapturedPhoto | null>;
  clearPhoto: () => void;
  switchCamera: () => Promise<void>;
  
  // File input fallback
  openFilePicker: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const defaultOptions: CameraOptions = {
  facingMode: 'environment',
  quality: 0.85,
  maxWidth: 1920,
  maxHeight: 1080,
};

export function useCamera(options: CameraOptions = {}): UseCameraReturn {
  const opts = { ...defaultOptions, ...options };
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<CapturedPhoto | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>(opts.facingMode || 'environment');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isSupported = typeof navigator !== 'undefined' && 
    'mediaDevices' in navigator && 
    'getUserMedia' in navigator.mediaDevices;

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  }, [stream]);

  const startCamera = useCallback(async () => {
    if (!isSupported) {
      setError('La cámara no está soportada en este dispositivo');
      return;
    }

    try {
      setError(null);
      setIsCapturing(true);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: currentFacingMode,
          width: { ideal: opts.maxWidth },
          height: { ideal: opts.maxHeight },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      setIsCapturing(false);
      setHasPermission(false);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Permiso de cámara denegado. Por favor, habilítalo en la configuración.');
        } else if (err.name === 'NotFoundError') {
          setError('No se encontró ninguna cámara en el dispositivo.');
        } else if (err.name === 'NotReadableError') {
          setError('La cámara está siendo usada por otra aplicación.');
        } else {
          setError(`Error al acceder a la cámara: ${err.message}`);
        }
      }
    }
  }, [isSupported, currentFacingMode, opts.maxWidth, opts.maxHeight]);

  const switchCamera = useCallback(async () => {
    stopCamera();
    setCurrentFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    // Re-start will happen on next render due to state change
    setTimeout(() => startCamera(), 100);
  }, [stopCamera, startCamera]);

  const capturePhoto = useCallback(async (): Promise<CapturedPhoto | null> => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Error: Referencias de video/canvas no disponibles');
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setError('Error: No se pudo obtener contexto del canvas');
      return null;
    }

    // Set canvas size to video size
    let width = video.videoWidth;
    let height = video.videoHeight;

    // Scale down if needed
    if (opts.maxWidth && width > opts.maxWidth) {
      const ratio = opts.maxWidth / width;
      width = opts.maxWidth;
      height = Math.round(height * ratio);
    }
    if (opts.maxHeight && height > opts.maxHeight) {
      const ratio = opts.maxHeight / height;
      height = opts.maxHeight;
      width = Math.round(width * ratio);
    }

    canvas.width = width;
    canvas.height = height;

    // Draw the video frame
    ctx.drawImage(video, 0, 0, width, height);

    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError('Error al capturar la foto');
            resolve(null);
            return;
          }

          const dataUrl = canvas.toDataURL('image/jpeg', opts.quality);
          const capturedPhoto: CapturedPhoto = {
            dataUrl,
            blob,
            width,
            height,
            timestamp: new Date(),
          };

          setPhoto(capturedPhoto);
          resolve(capturedPhoto);
        },
        'image/jpeg',
        opts.quality
      );
    });
  }, [opts.maxWidth, opts.maxHeight, opts.quality]);

  const clearPhoto = useCallback(() => {
    setPhoto(null);
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    isSupported,
    isCapturing,
    hasPermission,
    error,
    photo,
    stream,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    clearPhoto,
    switchCamera,
    openFilePicker,
    fileInputRef,
  };
}

export default useCamera;
