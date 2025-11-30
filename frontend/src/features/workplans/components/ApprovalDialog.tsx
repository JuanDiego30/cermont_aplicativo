'use client';

import { useState } from 'react';
import Button from '@/components/ui/button/Button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ApprovalDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onApprove: (comments?: string) => Promise<void>;
    onReject: (reason: string) => Promise<void>;
    title: string;
    description?: string;
}

export function ApprovalDialog({
    isOpen,
    onClose,
    onApprove,
    onReject,
    title,
    description,
}: ApprovalDialogProps) {
    const [mode, setMode] = useState<'approve' | 'reject' | null>(null);
    const [comments, setComments] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleApprove = async () => {
        setIsSubmitting(true);
        try {
            await onApprove(comments || undefined);
            handleClose();
        } catch {
            // Error handled by parent
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!reason.trim()) {
            window.alert('Debes proporcionar una razón para rechazar');
            return;
        }
        setIsSubmitting(true);
        try {
            await onReject(reason);
            handleClose();
        } catch {
            // Error handled by parent
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setMode(null);
        setComments('');
        setReason('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
            <div className="w-full max-w-md rounded-3xl border-2 border-neutral-200 bg-white p-8 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 animate-slide-up">
                {/* Header */}
                <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    {title}
                </h2>
                {description && (
                    <p className="mb-6 text-neutral-600 dark:text-neutral-400">
                        {description}
                    </p>
                )}

                {/* Action Selection */}
                {!mode && (
                    <div className="space-y-3">
                        <Button
                            onClick={() => setMode('approve')}
                            className="w-full flex items-center justify-center gap-2 bg-success-600 hover:bg-success-700"
                        >
                            <CheckCircle className="h-5 w-5" />
                            Aprobar
                        </Button>
                        <Button
                            onClick={() => setMode('reject')}
                            variant="secondary"
                            className="w-full flex items-center justify-center gap-2 border-2 border-error-600 text-error-600 hover:bg-error-50 dark:border-error-500 dark:text-error-500 dark:hover:bg-error-950"
                        >
                            <XCircle className="h-5 w-5" />
                            Rechazar
                        </Button>
                        <Button
                            onClick={handleClose}
                            variant="secondary"
                            className="w-full"
                        >
                            Cancelar
                        </Button>
                    </div>
                )}

                {/* Approve Form */}
                {mode === 'approve' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Comentarios (opcional)
                            </label>
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Agrega comentarios sobre la aprobación..."
                                rows={4}
                                className="w-full rounded-lg border-2 border-neutral-200 bg-white px-4 py-3 text-neutral-900 transition-colors focus:border-primary-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setMode(null)}
                                variant="secondary"
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                Atrás
                            </Button>
                            <Button
                                onClick={handleApprove}
                                className="flex-1 bg-success-600 hover:bg-success-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Aprobando...
                                    </>
                                ) : (
                                    'Confirmar Aprobación'
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Reject Form */}
                {mode === 'reject' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Razón del rechazo <span className="text-error-600">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Explica por qué se rechaza..."
                                rows={4}
                                required
                                className="w-full rounded-lg border-2 border-error-200 bg-white px-4 py-3 text-neutral-900 transition-colors focus:border-error-500 focus:outline-none dark:border-error-800 dark:bg-neutral-900 dark:text-neutral-50"
                            />
                        </div>

                        <div className="rounded-lg bg-error-50 border-2 border-error-200 p-4 dark:bg-error-950 dark:border-error-800">
                            <p className="text-sm text-error-800 dark:text-error-200">
                                <strong>Advertencia:</strong> El plan de trabajo será marcado como rechazado y el creador será notificado.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setMode(null)}
                                variant="secondary"
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                Atrás
                            </Button>
                            <Button
                                onClick={handleReject}
                                className="flex-1 bg-error-600 hover:bg-error-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Rechazando...
                                    </>
                                ) : (
                                    'Confirmar Rechazo'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
