'use client';

import { useEffect, useCallback } from 'react';
import { useCamera, CapturedPhoto } from '@/hooks/useCamera';
import { 
  Camera, 
  X, 
  RotateCcw, 
  Check, 
  ImagePlus,
  SwitchCamera,
  AlertCircle
} from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (photo: CapturedPhoto) => void;
  onClose?: () => void;
  facingMode?: 'user' | 'environment';
  quality?: number;
  showPreview?: boolean;
  className?: string;
}

export function CameraCapture({
  onCapture,
  onClose,
  facingMode = 'environment',
  quality = 0.85,
  showPreview = true,
  className = '',
}: CameraCaptureProps) {
  const {
    isSupported,
    isCapturing,
    error,
    photo,
    videoRef,
    canvasRef,
    fileInputRef,
    startCamera,
    stopCamera,
    capturePhoto,
    clearPhoto,
    switchCamera,
    openFilePicker,
  } = useCamera({ facingMode, quality });

  // Start camera on mount
  useEffect(() => {
    if (isSupported) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isSupported, startCamera, stopCamera]);

  const handleCapture = useCallback(async () => {
    const capturedPhoto = await capturePhoto();
    if (capturedPhoto && !showPreview) {
      onCapture(capturedPhoto);
      onClose?.();
    }
  }, [capturePhoto, showPreview, onCapture, onClose]);

  const handleConfirm = useCallback(() => {
    if (photo) {
      onCapture(photo);
      onClose?.();
    }
  }, [photo, onCapture, onClose]);

  const handleRetake = useCallback(() => {
    clearPhoto();
    startCamera();
  }, [clearPhoto, startCamera]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      // Create image to get dimensions
      const img = new Image();
      img.onload = () => {
        const capturedPhoto: CapturedPhoto = {
          dataUrl,
          blob: file,
          width: img.width,
          height: img.height,
          timestamp: new Date(),
        };
        onCapture(capturedPhoto);
        onClose?.();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [onCapture, onClose]);

  // Fallback for unsupported browsers
  if (!isSupported) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-xl ${className}`}>
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
        <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
          Tu navegador no soporta el acceso a la cámara.
        </p>
        <button
          onClick={openFilePicker}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
        >
          <ImagePlus className="w-5 h-5" />
          Seleccionar imagen
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-xl overflow-hidden ${className}`}>
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Hidden file input as fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 z-20 p-4">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-center text-white mb-4">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={openFilePicker}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              <ImagePlus className="w-5 h-5" />
              Elegir archivo
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Photo preview */}
      {photo && showPreview ? (
        <div className="relative">
          <img
            src={photo.dataUrl}
            alt="Captured"
            className="w-full h-auto"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            <button
              onClick={handleRetake}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800/80 text-white rounded-full hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Repetir
            </button>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-500 transition-colors"
            >
              <Check className="w-5 h-5" />
              Usar foto
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Video stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto min-h-[300px] object-cover"
          />

          {/* Controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/70 to-transparent">
            <div className="flex items-center justify-center gap-6">
              {/* Gallery button */}
              <button
                onClick={openFilePicker}
                className="p-3 bg-gray-800/60 text-white rounded-full hover:bg-gray-700/60 transition-colors"
                title="Seleccionar de galería"
              >
                <ImagePlus className="w-6 h-6" />
              </button>

              {/* Capture button */}
              <button
                onClick={handleCapture}
                disabled={!isCapturing}
                className="relative w-16 h-16 rounded-full bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-transform"
              >
                <div className="absolute inset-2 rounded-full border-4 border-gray-800" />
              </button>

              {/* Switch camera button */}
              <button
                onClick={switchCamera}
                className="p-3 bg-gray-800/60 text-white rounded-full hover:bg-gray-700/60 transition-colors"
                title="Cambiar cámara"
              >
                <SwitchCamera className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Close button */}
          {onClose && (
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="absolute top-4 right-4 p-2 bg-gray-800/60 text-white rounded-full hover:bg-gray-700/60 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default CameraCapture;
