'use client';

/**
 * ARCHIVO: offline/client.tsx
 * FUNCION: Componente cliente para página offline
 */

export default function OfflineClient() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full text-center">
                {/* Icono de sin conexión */}
                <div className="mx-auto w-24 h-24 mb-6">
                    <svg
                        className="w-full h-full text-gray-400 dark:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a5 5 0 01-1.414-3.536c0-1.333.513-2.54 1.357-3.43l-2.829-2.829m0 0a9 9 0 0112.728 0M3 3l18 18"
                        />
                    </svg>
                </div>

                {/* Título */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Sin conexión a internet
                </h1>

                {/* Descripción */}
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Parece que no tienes conexión a internet. Algunas funciones pueden no
                    estar disponibles hasta que te reconectes.
                </p>

                {/* Funcionalidades disponibles */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Mientras tanto puedes:
                    </h2>
                    <ul className="text-left text-gray-600 dark:text-gray-400 space-y-3">
                        <li className="flex items-center">
                            <span className="mr-3 text-green-500">✓</span>
                            Ver órdenes guardadas localmente
                        </li>
                        <li className="flex items-center">
                            <span className="mr-3 text-green-500">✓</span>
                            Crear borradores de nuevas órdenes
                        </li>
                        <li className="flex items-center">
                            <span className="mr-3 text-green-500">✓</span>
                            Consultar datos de clientes cacheados
                        </li>
                    </ul>
                </div>

                {/* Botones de acción */}
                <div className="space-y-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        Reintentar conexión
                    </button>

                    <button
                        onClick={() => window.history.back()}
                        className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        Volver atrás
                    </button>
                </div>

                {/* Estado de conexión */}
                <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
                    CERMONT S.A.S - Sistema de Gestión de Órdenes
                </p>
            </div>
        </div>
    );
}
