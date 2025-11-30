'use client';

import { useState } from 'react';
import { SignatureCanvas } from './SignatureCanvas';
import { useSignatures } from '../hooks/useSignatures';
import type { SignatureRequest } from '../types';
import { X, PenTool, CheckCircle, Clock, AlertCircle, User } from 'lucide-react';

interface SignaturePadProps {
  entityType: 'order' | 'workplan' | 'acta' | 'evidence';
  entityId: string;
  signatureType: 'technician' | 'supervisor' | 'client' | 'witness';
  signerName?: string;
  signerDocument?: string;
  signerRole?: string;
  onComplete?: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
}

export function SignaturePad({
  entityType,
  entityId,
  signatureType,
  signerName = '',
  signerDocument = '',
  signerRole,
  onComplete,
  onCancel,
  title,
  description,
}: SignaturePadProps) {
  const [name, setName] = useState(signerName);
  const [document, setDocument] = useState(signerDocument);
  const [showCanvas, setShowCanvas] = useState(false);

  const {
    uploadSignature,
    isUploading,
    hasSignature,
    getSignature,
  } = useSignatures(entityType, entityId);

  const existingSignature = getSignature(signatureType);
  const alreadySigned = hasSignature(signatureType);

  const getSignatureLabel = () => {
    const labels: Record<string, string> = {
      technician: 'Técnico',
      supervisor: 'Supervisor',
      client: 'Cliente',
      witness: 'Testigo',
    };
    return labels[signatureType] || signatureType;
  };

  const handleSaveSignature = (dataUrl: string) => {
    const request: SignatureRequest = {
      entityType,
      entityId,
      signatureType,
      signedBy: {
        name: name.trim(),
        document: document.trim() || undefined,
        role: signerRole || signatureType,
      },
    };

    uploadSignature(
      { request, signatureDataUrl: dataUrl },
      {
        onSuccess: () => {
          setShowCanvas(false);
          onComplete?.();
        },
      }
    );
  };

  // If already signed, show the signature
  if (alreadySigned && existingSignature) {
    return (
      <div className="border border-green-200 dark:border-green-800 rounded-xl p-4 bg-green-50 dark:bg-green-900/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Firmado por {getSignatureLabel()}</span>
          </div>
          <span className="text-xs text-green-600 dark:text-green-500">
            {new Date(existingSignature.signedAt).toLocaleString('es-CO')}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <img
            src={existingSignature.dataUrl}
            alt="Firma"
            className="h-16 border border-green-300 dark:border-green-700 rounded bg-white"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {existingSignature.signedBy.name}
            </p>
            {existingSignature.signedBy.document && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                CC: {existingSignature.signedBy.document}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PenTool className="w-5 h-5 text-brand-600" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {title || `Firma del ${getSignatureLabel()}`}
          </h3>
        </div>
        <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
          <Clock className="w-3 h-3" />
          Pendiente
        </span>
      </div>

      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {description}
        </p>
      )}

      {!showCanvas ? (
        <>
          {/* Signer info form */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del firmante"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cédula / Documento
              </label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="Número de identificación"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowCanvas(true)}
              disabled={!name.trim()}
              className="flex items-center gap-2 px-4 py-2 text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PenTool className="w-4 h-4" />
              Abrir Panel de Firma
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Signing info */}
          <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">{name}</p>
              {document && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  CC: {document}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowCanvas(false)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Canvas */}
          <SignatureCanvas
            width={450}
            height={180}
            onSave={handleSaveSignature}
            onCancel={() => setShowCanvas(false)}
            disabled={isUploading}
          />

          {isUploading && (
            <div className="flex items-center justify-center gap-2 mt-4 text-brand-600">
              <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Guardando firma...</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SignaturePad;
