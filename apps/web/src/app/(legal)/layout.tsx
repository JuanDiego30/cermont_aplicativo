/**
 * ARCHIVO: layout.tsx (legal)
 * FUNCION: Layout compartido para páginas legales (términos, privacidad, contacto)
 * IMPLEMENTACION: Client Component con header sticky, navegación y footer
 * DEPENDENCIAS: next/link, lucide-react
 * EXPORTS: LegalLayout (default)
 */
'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header minimalista */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Volver al inicio</span>
            </Link>
            
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-brand-600 dark:text-brand-400"
            >
              <span>Cermont</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {children}
      </main>

      {/* Footer minimalista */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Cermont. Todos los derechos reservados.</p>
            <nav className="flex items-center gap-6">
              <Link href="/terms" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Términos de Servicio
              </Link>
              <Link href="/privacy" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/contact" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Contacto
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
