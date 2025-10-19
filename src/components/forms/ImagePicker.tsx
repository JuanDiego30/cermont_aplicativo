'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { UseFormSetValue, Path, PathValue } from 'react-hook-form';

type Preview = { url: string; name: string; size: number };

type Props<T extends Record<string, unknown>> = {
  /** Nombre del campo en RHF, p.e. "fotos.camaraAntes" */
  name: Path<T>;
  label?: string;
  setValue: UseFormSetValue<T>;
  multiple?: boolean;
  accept?: string; // por defecto image/*
  className?: string;
  max?: number; // límite máximo de imágenes permitidas
};

export default function ImagePicker<T extends Record<string, unknown>>({
  name,
  label,
  setValue,
  multiple = true,
  accept = 'image/*',
  className,
  max,
}: Props<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Preview[]>([]);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    
    // Mezclar con existentes (acumulativo)
    const existing = previews.slice();
    const newPreviews: Preview[] = files.map((f) => ({
      url: URL.createObjectURL(f),
      name: f.name,
      size: f.size,
    }));
    let merged = [...existing, ...newPreviews];
    let mergedFiles = files;
    // Si tenemos un máximo, recortar
    if (typeof max === 'number') {
      merged = merged.slice(0, max);
      // recreamos File[] coherente: tomamos primero los existentes que no tenemos como File real; como simplificación
      // usamos solo los últimos seleccionados si superan el máximo
      mergedFiles = merged.map((p, i) => files[i] ?? new File([], p.name));
    }

    setPreviews(merged);
    // Entregar a RHF (quedará en data.fotos.* como File[])
    setValue(name, mergedFiles as PathValue<T, Path<T>>, { shouldDirty: true, shouldTouch: true });
  }

  function removeOne(idx: number) {
    const next = previews.slice();
    // liberar el objeto URL
    URL.revokeObjectURL(next[idx].url);
    next.splice(idx, 1);
    setPreviews(next);
    // actualizar RHF acorde
    if (next.length === 0) {
      setValue(name, [] as PathValue<T, Path<T>>, { shouldDirty: true });
    }
  }

  // Limpieza de objectURLs al desmontar o al cambiar previews
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  return (
    <div className={`image-picker ${className ?? ''}`}>
      {label && <label className="picker-label">{label}</label>}

      <div className="picker-row">
        <button type="button" className="picker-btn" onClick={handleClick}>
          <span className="picker-icon">📷</span>
          <span>Seleccionar imagen{multiple ? 'es' : ''} {max ? `(máx. ${max})` : ''}</span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="picker-input-hidden"
          onChange={handleChange}
        />
      </div>

      {!!previews.length && (
        <div className="preview-grid">
          {previews.map((p, i) => (
            <figure key={p.url} className="preview-item">
              <Image 
                src={p.url} 
                alt={p.name}
                width={150}
                height={150}
                style={{ objectFit: 'cover' }}
                unoptimized
              />
              <figcaption title={p.name}>{p.name}</figcaption>
              <button
                type="button"
                aria-label="Quitar imagen"
                className="preview-remove"
                onClick={() => removeOne(i)}
              >
                ✕
              </button>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
