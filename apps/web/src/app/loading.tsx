/**
 * 📁 app/loading.tsx
 *
 * ✨ Global Loading State - Server Component
 * Loading UI mientras se carga la página principal
 */

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
          {/* Spinning arc */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
          {/* Inner content */}
          <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
            <span className="text-xl font-bold text-brand-500">C</span>
          </div>
        </div>

        {/* Loading text */}
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">
          Cargando...
        </p>
      </div>
    </div>
  );
}
