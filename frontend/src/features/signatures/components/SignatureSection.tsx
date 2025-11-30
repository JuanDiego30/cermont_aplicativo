'use client';

import { SignaturePad } from './SignaturePad';
import { useSignatures } from '../hooks/useSignatures';
import { FileCheck, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface SignatureSectionProps {
  entityType: 'order' | 'workplan' | 'acta' | 'evidence';
  entityId: string;
  requiredSignatures?: ('technician' | 'supervisor' | 'client' | 'witness')[];
  title?: string;
  onAllSigned?: () => void;
}

export function SignatureSection({
  entityType,
  entityId,
  requiredSignatures = ['technician', 'supervisor'],
  title = 'Firmas Requeridas',
  onAllSigned,
}: SignatureSectionProps) {
  const {
    signedDocument,
    isLoading,
    isComplete,
    signatureCount,
    requiredCount,
    finalizeDocument,
    isFinalizing,
  } = useSignatures(entityType, entityId);

  const getStatusIcon = () => {
    if (isComplete) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
    if (signatureCount > 0) {
      return <Clock className="w-5 h-5 text-yellow-600" />;
    }
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const getStatusText = () => {
    if (isComplete) {
      return 'Documento completamente firmado';
    }
    if (signatureCount > 0) {
      return `${signatureCount} de ${requiredSignatures.length} firmas completadas`;
    }
    return 'Pendiente de firmas';
  };

  const getStatusColor = () => {
    if (isComplete) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (signatureCount > 0) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  const allSigned = requiredSignatures.every((type) =>
    signedDocument?.signatures.some((sig) => sig.signedBy.role === type)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>
      </div>

      {/* Status banner */}
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>

      {/* Signature pads */}
      <div className="grid gap-4">
        {requiredSignatures.map((signatureType) => (
          <SignaturePad
            key={signatureType}
            entityType={entityType}
            entityId={entityId}
            signatureType={signatureType}
          />
        ))}
      </div>

      {/* Finalize button */}
      {allSigned && !isComplete && (
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => {
              finalizeDocument(undefined, {
                onSuccess: () => {
                  onAllSigned?.();
                },
              });
            }}
            disabled={isFinalizing}
            className="flex items-center gap-2 px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isFinalizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Finalizando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Finalizar Documento</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default SignatureSection;
