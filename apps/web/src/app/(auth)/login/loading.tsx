/**
 * ARCHIVO: loading.tsx (login)
 * FUNCION: Estado de carga (skeleton) para la página de login
 * IMPLEMENTACION: Componente estático con animación pulse de Tailwind
 * DEPENDENCIAS: Tailwind CSS
 * EXPORTS: LoginLoading (default)
 */
export default function LoginLoading() {
  return (
    <div className="animate-pulse space-y-5">
      {/* Title skeleton */}
      <div className="mb-5 sm:mb-8">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Form skeleton */}
      <div className="space-y-5">
        {/* Email field */}
        <div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>

        {/* Password field */}
        <div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>

        {/* Remember & Forgot */}
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Button */}
        <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}
