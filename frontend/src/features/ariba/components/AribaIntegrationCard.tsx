'use client';

import { useState } from 'react';
import { useOrderSES, useSESInvoice } from '../hooks/useAriba';
import type { AribaSES, AribaInvoice } from '../types';
import { 
  FileText, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertTriangle,
  Receipt,
  ExternalLink,
  Plus
} from 'lucide-react';

interface AribaIntegrationCardProps {
  orderId: string;
  orderNumber: string;
}

export function AribaIntegrationCard({ orderId, orderNumber }: AribaIntegrationCardProps) {
  const {
    ses,
    isLoading: sesLoading,
    hasSES,
    createSES,
    isCreating,
    submitSES,
    isSubmitting,
    syncStatus,
    isSyncing,
  } = useOrderSES(orderId);

  const {
    invoice,
    isLoading: invoiceLoading,
    hasInvoice,
    createInvoice,
    isCreating: isCreatingInvoice,
  } = useSESInvoice(ses?.id || '');

  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', icon: <FileText className="w-4 h-4" />, label: 'Borrador' },
      PENDING_APPROVAL: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" />, label: 'Pendiente' },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Aprobado' },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" />, label: 'Rechazado' },
      POSTED: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Contabilizado' },
      PAID: { color: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Pagado' },
      PARTIALLY_PAID: { color: 'bg-orange-100 text-orange-800', icon: <AlertTriangle className="w-4 h-4" />, label: 'Pago Parcial' },
      CANCELLED: { color: 'bg-gray-100 text-gray-500', icon: <XCircle className="w-4 h-4" />, label: 'Cancelado' },
    };
    return configs[status] || configs.DRAFT;
  };

  const formatCurrency = (amount: number, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleCreateInvoice = () => {
    if (ses && invoiceData.invoiceNumber && invoiceData.invoiceDate && invoiceData.dueDate) {
      createInvoice(invoiceData, {
        onSuccess: () => {
          setShowInvoiceForm(false);
          setInvoiceData({ invoiceNumber: '', invoiceDate: '', dueDate: '' });
        },
      });
    }
  };

  if (sesLoading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="/images/ariba-logo.svg" 
            alt="SAP Ariba" 
            className="h-6 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Integración Ariba
          </h3>
        </div>
        {hasSES && ses && (
          <button
            onClick={() => syncStatus(ses.id)}
            disabled={isSyncing}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>
        )}
      </div>

      {/* SES Section */}
      {!hasSES || !ses ? (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No hay SES creado para esta orden
          </p>
          <button
            onClick={() => createSES()}
            disabled={isCreating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {isCreating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Crear SES en Ariba
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* SES Info */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  SES: {ses.sesNumber}
                </span>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(ses.status).color}`}>
                {getStatusConfig(ses.status).icon}
                {getStatusConfig(ses.status).label}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">PO</p>
                <p className="font-medium text-gray-900 dark:text-white">{ses.purchaseOrderNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Monto Total</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(ses.totalAmount, ses.currency)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Periodo Servicio</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(ses.serviceStartDate)} - {formatDate(ses.serviceEndDate)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Proveedor</p>
                <p className="font-medium text-gray-900 dark:text-white">{ses.vendorName}</p>
              </div>
            </div>

            {/* SES Actions */}
            {ses.status === 'DRAFT' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => submitSES(ses.id)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar para Aprobación
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Invoice Section - Only show if SES is approved */}
          {ses.status === 'APPROVED' || ses.status === 'POSTED' ? (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Factura
              </h4>

              {invoiceLoading ? (
                <div className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded" />
              ) : !hasInvoice ? (
                showInvoiceForm ? (
                  <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Número de Factura *
                      </label>
                      <input
                        type="text"
                        value={invoiceData.invoiceNumber}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                        placeholder="FAC-001"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Fecha Factura *
                        </label>
                        <input
                          type="date"
                          value={invoiceData.invoiceDate}
                          onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Fecha Vencimiento *
                        </label>
                        <input
                          type="date"
                          value={invoiceData.dueDate}
                          onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateInvoice}
                        disabled={isCreatingInvoice || !invoiceData.invoiceNumber}
                        className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                      >
                        {isCreatingInvoice ? 'Creando...' : 'Crear Factura'}
                      </button>
                      <button
                        onClick={() => setShowInvoiceForm(false)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowInvoiceForm(true)}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-brand-500 hover:text-brand-600 transition-colors w-full justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Factura
                  </button>
                )
              ) : invoice ? (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </span>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(invoice.status).color}`}>
                      {getStatusConfig(invoice.status).icon}
                      {getStatusConfig(invoice.status).label}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Monto: </span>
                      <span className="font-medium">{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Vence: </span>
                      <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <a
          href="https://service.ariba.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 transition-colors"
        >
          Abrir SAP Ariba
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

export default AribaIntegrationCard;
