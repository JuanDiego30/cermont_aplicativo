'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

type EvidenceUploadProps = {
  onUpload: (args: { file: File; stage: string; type: string }) => Promise<void>;
  isUploading: boolean;
};

const STAGE_OPTIONS = [
  { value: 'SOLICITUD', label: 'Solicitud' },
  { value: 'VISITA', label: 'Visita' },
  { value: 'EJECUCION', label: 'En ejecución' },
  { value: 'INFORME', label: 'Informe' },
] as const;

const TYPE_OPTIONS = [
  { value: 'FOTO', label: 'Fotografía' },
  { value: 'PDF', label: 'Documento PDF' },
  { value: 'ACTA', label: 'Acta / Informe' },
] as const;

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function EvidenceUpload({ onUpload, isUploading }: EvidenceUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stage, setStage] = useState('EJECUCION');
  const [type, setType] = useState('FOTO');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`El archivo no puede superar los ${MAX_FILE_SIZE_MB}MB.`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setError('Selecciona un archivo primero.');
      return;
    }

    setError(null);
    
    try {
      await onUpload({ file: selectedFile, stage, type });
      
      // Reset form on success
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Error al subir el archivo. Intenta nuevamente.');
    }
  };

  const fileSizeMB = selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Stage Select */}
        <Select
          label="Etapa"
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          options={STAGE_OPTIONS}
        />

        {/* Type Select */}
        <Select
          label="Tipo de evidencia"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={TYPE_OPTIONS}
        />

        {/* File Input */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Archivo</label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            disabled={isUploading}
            className="block w-full text-xs text-neutral-700 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-primary-700 disabled:opacity-50"
          />
          {selectedFile && (
            <p className="mt-1 text-xs text-neutral-500">
              {selectedFile.name} · {fileSizeMB} MB
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-error-300 bg-error-50 px-3 py-2">
          <p className="text-xs text-error-600">{error}</p>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          onClick={handleUploadClick}
          disabled={isUploading || !selectedFile}
          isLoading={isUploading}
        >
          Subir evidencia
        </Button>
      </div>
    </div>
  );
}


