'use client';

import { useAribaConfig } from '../hooks/useAriba';
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react';

interface AribaConfigStatusProps {
  showDetails?: boolean;
}

export function AribaConfigStatus({ showDetails = false }: AribaConfigStatusProps) {
  const {
    configStatus,
    isLoading,
    isConfigured,
    testConnection,
    isTesting,
    testResult,
    syncAll,
    isSyncing,
    syncResult,
  } = useAribaConfig();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm">Verificando conexión...</span>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm">Ariba no configurado</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {testResult?.connected ? (
            <>
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 dark:text-green-400">
                Conectado a Ariba
              </span>
            </>
          ) : testResult ? (
            <>
              <WifiOff className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600 dark:text-red-400">
                Sin conexión
              </span>
            </>
          ) : (
            <>
              <Settings className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Realm: {configStatus?.realm}
              </span>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => testConnection()}
            disabled={isTesting}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isTesting ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Wifi className="w-3 h-3" />
            )}
            Test
          </button>

          <button
            onClick={() => syncAll()}
            disabled={isSyncing}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-lg hover:bg-brand-200 dark:hover:bg-brand-900/50 transition-colors disabled:opacity-50"
          >
            {isSyncing ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            Sincronizar
          </button>
        </div>
      </div>

      {/* Sync result */}
      {syncResult && (
        <div className="text-xs bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2">
          <span className="text-green-600">{syncResult.synced} sincronizados</span>
          {syncResult.failed > 0 && (
            <span className="text-red-600 ml-2">{syncResult.failed} fallidos</span>
          )}
        </div>
      )}

      {/* Details section */}
      {showDetails && configStatus && (
        <div className="text-sm space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Última sincronización</span>
            <span className="text-gray-900 dark:text-white">
              {configStatus.lastSync 
                ? new Date(configStatus.lastSync).toLocaleString('es-CO')
                : 'Nunca'
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AribaConfigStatus;
