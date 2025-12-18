/**
 * ARCHIVO: maintenance/page.tsx
 * FUNCION: Página de mantenimiento del sistema
 * IMPLEMENTACION: Basado en vercel/examples/edge-middleware/maintenance-page
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mantenimiento | CERMONT S.A.S',
  description: 'El sistema está en mantenimiento programado',
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icono de mantenimiento */}
        <div className="mb-8">
          <svg
            className="w-24 h-24 mx-auto text-blue-400 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Sistema en Mantenimiento
        </h1>

        {/* Mensaje */}
        <p className="text-gray-300 mb-8 leading-relaxed">
          Estamos realizando mejoras para brindarte una mejor experiencia.
          El sistema estará disponible muy pronto.
        </p>

        {/* Información de contacto */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-400 mb-2">
            ¿Necesitas ayuda urgente?
          </p>
          <a
            href="mailto:soporte@cermont.com.co"
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            soporte@cermont.com.co
          </a>
        </div>

        {/* Footer con logo */}
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <span className="text-sm">CERMONT S.A.S</span>
          <span className="text-xs">•</span>
          <span className="text-sm">Refrigeración Industrial</span>
        </div>

        {/* Indicador de progreso animado */}
        <div className="mt-8">
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
