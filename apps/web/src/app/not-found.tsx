import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="text-9xl font-bold text-gray-200 dark:text-gray-800 select-none">
          404
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
          Página no encontrada
        </h1>
        
        <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Ir al inicio
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
