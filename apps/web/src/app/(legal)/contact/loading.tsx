/**
 * Loading skeleton para página de Contacto
 */
export default function ContactLoading() {
  return (
    <div className="animate-pulse">
      {/* Encabezado skeleton */}
      <div className="text-center mb-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-6" />
        <div className="h-10 w-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
        <div className="h-4 w-96 max-w-full mx-auto bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info de contacto */}
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Formulario skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
                <div>
                  <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
              </div>
              <div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
              <div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
              <div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Departamentos skeleton */}
      <div className="mt-12">
        <div className="h-7 w-56 mx-auto bg-gray-200 dark:bg-gray-700 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4" />
              <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
              <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-3" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
