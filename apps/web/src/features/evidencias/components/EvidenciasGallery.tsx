'use client';

import { useState } from 'react';
import type { Evidence, EvidenceStage } from '@/types/evidence';

interface EvidenciasGalleryProps {
  evidences: Evidence[];
  onSelect?: (evidence: Evidence) => void;
  onUpload?: () => void;
}

const stageLabels: Record<EvidenceStage, string> = {
  ANTES: 'Antes',
  DURANTE: 'Durante',
  DESPUES: 'Después',
};

export function EvidenciasGallery({ evidences, onSelect, onUpload }: EvidenciasGalleryProps) {
  const [activeStage, setActiveStage] = useState<EvidenceStage | 'ALL'>('ALL');
  
  const filteredEvidences = activeStage === 'ALL'
    ? evidences
    : evidences.filter((e) => e.etapa === activeStage);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveStage('ALL')}
          className={`px-3 py-1.5 rounded-lg text-sm ${
            activeStage === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        {(['ANTES', 'DURANTE', 'DESPUES'] as EvidenceStage[]).map((stage) => (
          <button
            key={stage}
            onClick={() => setActiveStage(stage)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              activeStage === stage
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'
            }`}
          >
            {stageLabels[stage]}
          </button>
        ))}
        
        {onUpload && (
          <button
            onClick={onUpload}
            className="ml-auto px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            + Subir
          </button>
        )}
      </div>

      {/* Gallery */}
      {filteredEvidences.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No hay evidencias</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredEvidences.map((evidence) => (
            <div
              key={evidence.id}
              onClick={() => onSelect?.(evidence)}
              className="relative group cursor-pointer"
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                {evidence.tipo === 'FOTO' || evidence.tipo === 'VIDEO' ? (
                  <img
                    src={evidence.thumbnail || evidence.url}
                    alt={evidence.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">📄</span>
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-end">
                  <div className="p-2 w-full bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm truncate">{evidence.nombre}</p>
                  </div>
                </div>
              </div>
              
              {/* Stage badge */}
              <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium ${
                evidence.etapa === 'ANTES' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : evidence.etapa === 'DURANTE'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {stageLabels[evidence.etapa]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
