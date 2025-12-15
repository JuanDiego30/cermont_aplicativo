/**
 * ARCHIVO: page.tsx (contact)
 * FUNCION: Página de contacto con información y formulario de mensajes
 * IMPLEMENTACION: Server Component con grid de info de contacto y Client Component para form
 * DEPENDENCIAS: next/Metadata, react/Suspense, lucide-react, ContactFormClient
 * EXPORTS: ContactPage (default), metadata
 */
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Headphones, Building2 } from 'lucide-react';
import ContactFormClient from './contact-form-client';
export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contáctanos para soporte técnico, consultas comerciales o información sobre el sistema Cermont.',
  robots: {
    index: true,
    follow: true,
  },
};
export default function ContactPage() {
  return (
    <div className="not-prose">
      {/* Encabezado */}
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 mb-6">
          <MessageSquare className="h-8 w-8 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Contáctanos
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          ¿Tienes preguntas sobre Cermont? Estamos aquí para ayudarte. 
          Completa el formulario o utiliza nuestros canales de contacto directo.
        </p>
      </header>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información de contacto - Columna izquierda */}
        <div className="space-y-6">
          {/* Tarjetas de contacto */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Teléfono
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                  Línea directa de atención
                </p>
                <a 
                  href="tel:+573001234567"
                  className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
                >
                  +57 300 123 4567
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Correo Electrónico
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                  Respuesta en 24-48 horas
                </p>
                <a 
                  href="mailto:soporte@cermont.com"
                  className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
                >
                  soporte@cermont.com
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Oficina Principal
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Pamplona, Norte de Santander<br />
                  Colombia
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Horario de Atención
                </h3>
                <div className="text-gray-600 dark:text-gray-300 text-sm space-y-1">
                  <p>Lunes a Viernes: 8:00 AM - 6:00 PM</p>
                  <p>Sábados: 8:00 AM - 12:00 PM</p>
                  <p className="text-gray-500 dark:text-gray-400">
                    Hora Colombia (GMT-5)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de contacto - Columna derecha (2 cols) */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Envíanos un mensaje
            </h2>
            
            <Suspense fallback={<FormSkeleton />}>
              <ContactFormClient />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Sección de departamentos */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Departamentos Específicos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
              <Headphones className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Soporte Técnico
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Problemas con el sistema o asistencia técnica
            </p>
            <a 
              href="mailto:soporte@cermont.com"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              soporte@cermont.com
            </a>
          </div>

          <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Ventas
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Cotizaciones y planes empresariales
            </p>
            <a 
              href="mailto:ventas@cermont.com"
              className="text-sm text-green-600 dark:text-green-400 hover:underline"
            >
              ventas@cermont.com
            </a>
          </div>

          <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Feedback
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Sugerencias y mejoras del producto
            </p>
            <a 
              href="mailto:feedback@cermont.com"
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              feedback@cermont.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Skeleton del formulario para Suspense
 */
function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
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
  );
}
