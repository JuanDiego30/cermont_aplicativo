'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Evidence } from '@/lib/types/evidence';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type EvidenceListProps = {
  evidences: Evidence[];
  onApprove: (id: string) => Promise<void>;
  isApprovingId?: string | null;
};

const STATUS_LABELS = {
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  PENDING: 'Pendiente',
} as const;

export function EvidenceList({ evidences, onApprove, isApprovingId }: EvidenceListProps) {
  if (!evidences.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 py-12">
        <span className="mb-2 text-4xl">📄</span>
        <p className="text-sm font-medium text-neutral-600">No hay evidencias registradas</p>
        <p className="text-xs text-neutral-500">Sube archivos para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {evidences.map((evidence) => {
        const fileSizeMB = (evidence.fileSize / 1024 / 1024).toFixed(2);
        const formattedDate = format(new Date(evidence.createdAt), "dd 'de' MMM yyyy HH:mm", {
          locale: es,
        });
        const statusLabel = STATUS_LABELS[evidence.status] || 'Desconocido';
        const isPending = evidence.status === 'PENDING';
        const isApproving = isApprovingId === evidence.id;

        return (
          <div
            key={evidence.id}
            className="flex flex-col justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 md:flex-row md:items-center"
          >
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-900">{evidence.fileName}</p>
              <p className="text-xs text-neutral-500">
                {evidence.type} · {evidence.mimeType} · {fileSizeMB} MB
              </p>
              <p className="text-xs text-neutral-400">Subida el {formattedDate}</p>
            </div>

            <div className="flex items-center gap-3">
              <Badge state={evidence.status as any}>{statusLabel}</Badge>
              {isPending && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onApprove(evidence.id)}
                  isLoading={isApproving}
                  disabled={isApproving}
                >
                  Aprobar
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


