'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { syncService } from '@/lib/offline/sync-service';
import { useEvidences } from '@/lib/hooks/useEvidences';

type PhotoCaptureProps = {
  orderId: string;
  onBack: () => void;
};

export function PhotoCapture({ orderId, onBack }: PhotoCaptureProps) {
  const [photos, setPhotos] = useState<{ id: string; url: string; blob: Blob }[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadMutation } = useEvidences(orderId);

  const handleCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsCapturing(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Guardar offline
        const photoId = await syncService.savePhoto(file, true);
        const url = URL.createObjectURL(file);

        setPhotos((prev) => [
          ...prev,
          { id: photoId, url, blob: file },
        ]);
      }
    } catch (error) {
      console.error('Error capturando foto:', error);
      alert('Error al capturar foto');
    } finally {
      setIsCapturing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  };

  const handleUpload = async () => {
    if (photos.length === 0) {
      alert('No hay fotos para subir');
      return;
    }

    try {
      // Subir cada foto como evidencia separada
      for (const [index, photo] of photos.entries()) {
        await uploadMutation.mutateAsync({
          file: new File([photo.blob], `photo-${index}.jpg`, { type: 'image/jpeg' }),
          stage: 'EXECUTION',
          type: 'PHOTO',
        });
      }

      alert('Fotos subidas exitosamente');
      setPhotos([]);
      setDescription('');
      onBack();
    } catch (error) {
      console.error('Error subiendo fotos:', error);
      alert('Error al subir fotos. Se guardar�n localmente.');

      // Guardar para sincronizar despu�s
      await syncService.savePendingAction({
        type: 'CREATE',
        endpoint: '/evidences',
        data: {
          orderId,
          type: 'PHOTO',
          description,
          photos: photos.map(p => p.id),
        },
      });

      onBack();
    }
  };

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
              Captura de Fotos
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {photos.length} {photos.length === 1 ? 'foto capturada' : 'fotos capturadas'}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-4 p-4">
        {/* Descripci�n */}
        <Card>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-100">
              Descripci�n de las evidencias
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Instalaci�n completada, pruebas funcionales"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
              rows={3}
            />
          </label>
        </Card>

        {/* Bot�n de Captura */}
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleCapture}
            className="hidden"
          />
          <Button
            variant="primary"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            isLoading={isCapturing}
            className="w-full"
          >
            <span className="mr-2 text-2xl">??</span>
            {isCapturing ? 'Procesando...' : 'Tomar Fotos'}
          </Button>
          <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
            Las fotos se guardan autom�ticamente y se suben cuando hay conexi�n
          </p>
        </div>

        {/* Grid de Fotos */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative overflow-hidden rounded-lg">
                <img
                  src={photo.url}
                  alt="Evidencia"
                  className="h-48 w-full object-cover"
                />
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute right-2 top-2 rounded-full bg-error-500 p-2 text-white shadow-lg hover:bg-error-600"
                >
                  ???
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bot�n de Upload */}
        {photos.length > 0 && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleUpload}
            isLoading={uploadMutation.isPending}
            className="w-full"
          >
            Subir {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
          </Button>
        )}
      </div>
    </div>
  );
}

