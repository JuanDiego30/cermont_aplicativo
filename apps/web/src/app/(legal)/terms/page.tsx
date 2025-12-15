/**
 * ARCHIVO: page.tsx (terms)
 * FUNCION: Página de Términos de Servicio del sistema Cermont
 * IMPLEMENTACION: Server Component con contenido legal estructurado en secciones
 * DEPENDENCIAS: next/Metadata, lucide-react
 * EXPORTS: TermsPage (default), metadata
 */
import type { Metadata } from 'next';
import { FileText, Scale, ShieldCheck, AlertTriangle, Clock, Mail } from 'lucide-react';
export const metadata: Metadata = {
  title: 'Términos de Servicio',
  description: 'Términos y condiciones de uso del sistema de gestión Cermont para servicios de aire acondicionado.',
  robots: {
    index: true,
    follow: true,
  },
};
export default function TermsPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      {/* Encabezado */}
      <header className="not-prose mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 mb-6">
          <FileText className="h-8 w-8 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Términos de Servicio
        </h1>
        <p className="text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          Última actualización: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* Introducción */}
      <section className="not-prose bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Bienvenido a Cermont. Estos Términos de Servicio (&quot;Términos&quot;) rigen su uso del sistema 
          de gestión de servicios de aire acondicionado de Cermont y todos los servicios relacionados 
          (colectivamente, el &quot;Servicio&quot;). Al acceder o utilizar el Servicio, usted acepta estar 
          sujeto a estos Términos.
        </p>
      </section>

      {/* Secciones principales */}
      <div className="space-y-8">
        {/* Aceptación de Términos */}
        <section className="not-prose bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                1. Aceptación de los Términos
              </h2>
              <div className="text-gray-600 dark:text-gray-300 space-y-3">
                <p>
                  Al crear una cuenta o utilizar cualquier parte de nuestro Servicio, usted declara que:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Tiene al menos 18 años de edad o la mayoría de edad en su jurisdicción.</li>
                  <li>Tiene la autoridad legal para aceptar estos Términos.</li>
                  <li>Proporcionará información precisa y actualizada durante el registro.</li>
                  <li>No utilizará el Servicio para fines ilegales o no autorizados.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Uso del Servicio */}
        <section className="not-prose bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2. Uso del Servicio
              </h2>
              <div className="text-gray-600 dark:text-gray-300 space-y-3">
                <p>
                  El Servicio está diseñado para gestionar órdenes de servicio, clientes, técnicos 
                  y equipos de aire acondicionado. Usted se compromete a:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
                  <li>No compartir su cuenta con terceros no autorizados.</li>
                  <li>Reportar inmediatamente cualquier uso no autorizado de su cuenta.</li>
                  <li>No intentar acceder a áreas del sistema sin autorización.</li>
                  <li>No realizar ingeniería inversa o intentar extraer el código fuente.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Responsabilidades del Usuario */}
        <section className="not-prose bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3. Responsabilidades y Limitaciones
              </h2>
              <div className="text-gray-600 dark:text-gray-300 space-y-3">
                <p>
                  Cermont proporciona el Servicio &quot;tal cual&quot; y &quot;según disponibilidad&quot;. 
                  No garantizamos que el Servicio estará libre de errores o interrupciones.
                </p>
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded-r-lg">
                  <p className="text-sm">
                    <strong>Importante:</strong> No somos responsables de pérdidas directas, 
                    indirectas, incidentales o consecuentes derivadas del uso del Servicio.
                  </p>
                </div>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Usted es responsable de mantener copias de seguridad de sus datos.</li>
                  <li>Las decisiones basadas en la información del sistema son su responsabilidad.</li>
                  <li>Cermont puede modificar o descontinuar funciones sin previo aviso.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Propiedad Intelectual */}
        <section className="not-prose bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            4. Propiedad Intelectual
          </h2>
          <div className="text-gray-600 dark:text-gray-300 space-y-3">
            <p>
              Todo el contenido, características y funcionalidad del Servicio, incluyendo pero no 
              limitado a diseño, código, gráficos y logos, son propiedad exclusiva de Cermont y 
              están protegidos por las leyes de propiedad intelectual colombianas e internacionales.
            </p>
          </div>
        </section>

        {/* Terminación */}
        <section className="not-prose bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            5. Terminación
          </h2>
          <div className="text-gray-600 dark:text-gray-300 space-y-3">
            <p>
              Podemos suspender o terminar su acceso al Servicio en cualquier momento, 
              con o sin causa, con o sin previo aviso. Usted puede terminar su cuenta 
              contactando al soporte técnico.
            </p>
          </div>
        </section>

        {/* Modificaciones */}
        <section className="not-prose bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            6. Modificaciones a los Términos
          </h2>
          <div className="text-gray-600 dark:text-gray-300 space-y-3">
            <p>
              Nos reservamos el derecho de modificar estos Términos en cualquier momento. 
              Los cambios entrarán en vigor inmediatamente después de su publicación. 
              El uso continuado del Servicio después de cualquier cambio constituye 
              su aceptación de los nuevos Términos.
            </p>
          </div>
        </section>

        {/* Contacto */}
        <section className="not-prose bg-linear-to-r from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-brand-200 dark:border-brand-800">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <Mail className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Contacto
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos en:
              </p>
              <a 
                href="mailto:legal@cermont.com" 
                className="inline-flex items-center gap-2 mt-3 text-brand-600 dark:text-brand-400 hover:underline font-medium"
              >
                <Mail className="h-4 w-4" />
                legal@cermont.com
              </a>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
