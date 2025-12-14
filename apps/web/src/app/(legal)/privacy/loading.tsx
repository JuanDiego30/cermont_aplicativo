/**
 * Loading skeleton para página de Política de Privacidad
 */
export default function PrivacyLoading() {
  return (
    <div className="animate-pulse">
      {/* Encabezado skeleton */}
      <div className="text-center mb-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-6" />
        <div className="h-10 w-72 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
        <div className="h-4 w-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Aviso skeleton */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 mb-8 border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-6 h-6 rounded bg-gray-200 dark:bg-gray-600" />
          <div className="flex-1">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-600 rounded mt-2" />
          </div>
        </div>
      </div>

      {/* Introducción skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>

      {/* Secciones skeleton */}
      <div className="space-y-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
