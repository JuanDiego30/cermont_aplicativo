/**
 * ARCHIVO: page.tsx (privacy)
 * FUNCION: Página de Política de Privacidad conforme a Ley 1581/2012 y RGPD
 * IMPLEMENTACION: Server Component con contenido estático estructurado en secciones
 * DEPENDENCIAS: next/Metadata, lucide-react
 * EXPORTS: PrivacyPage (default), metadata
 */
import type { Metadata } from 'next';
import { Shield, Eye, Lock, Database, UserCheck, Globe, Clock, Mail, AlertCircle } from 'lucide-react';
export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y protección de datos personales del sistema Cermont.',
  robots: {
    index: true,
    follow: true,
  },
};
export default function PrivacyPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      {/* Encabezado */}
      <header className="not-prose mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
          <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Política de Privacidad
        </h1>
        <p className="text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          Última actualización: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* Aviso de cumplimiento */}
      <section className="not-prose bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 mb-8 border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              Esta política cumple con la <strong>Ley 1581 de 2012</strong> de Colombia sobre 
              Protección de Datos Personales y el <strong>Reglamento General de Protección 
              de Datos (RGPD)</strong> de la Unión Europea.
            </p>
          </div>
        </div>
      </section>

      {/* Introducción */}
      <section className="not-prose bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          En Cermont, nos comprometemos a proteger su privacidad. Esta Política de Privacidad 
          explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando 
          utiliza nuestro sistema de gestión de servicios de aire acondicionado.
        </p>
      </section>

      {/* Secciones principales */}
      <div className="space-y-8">
        {/* Información que recopilamos */}
        <section className="not-prose bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                1. Información que Recopilamos
              </h2>
              <div className="text-gray-600 dark:text-gray-300 space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Información proporcionada directamente:
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Datos de identificación: nombre completo, documento de identidad.</li>
                    <li>Datos de contacto: correo electrónico, teléfono, dirección.</li>
                    <li>Datos de cuenta: nombre de usuario, contraseña cifrada.</li>
                    <li>Datos de clientes: información de contacto y equipos registrados.</li>
                    <li>Datos de servicios: órdenes de trabajo, diagnósticos, fotografías.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Información recopilada automáticamente:
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Datos de uso: páginas visitadas, funciones utilizadas, tiempo de sesión.</li>
                    <li>Datos del dispositivo: tipo de navegador, sistema operativo, dirección IP.</li>
                    <li>Datos de ubicación: coordenadas GPS para asignación de servicios técnicos.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Uso de la información */}
        <section className="not-prose bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2. Cómo Usamos su Información
              </h2>
              <div className="text-gray-600 dark:text-gray-300 space-y-3">
                <p>Utilizamos la información recopilada para:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Proporcionar, operar y mantener el Servicio.</li>
                  <li>Gestionar órdenes de servicio y asignar técnicos.</li>
                  <li>Procesar transacciones y enviar confirmaciones.</li>
                  <li>Enviar notificaciones sobre el estado de los servicios.</li>
                  <li>Mejorar la experiencia del usuario y personalizar el contenido.</li>
                  <li>Analizar el uso del sistema para mejoras continuas.</li>
                  <li>Cumplir con obligaciones legales y fiscales.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Compartir información */}
        <section className="not-prose bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Globe className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3. Compartir Información
              </h2>
              <div className="text-gray-600 dark:text-gray-300 space-y-3">
                <p>
                  No vendemos ni alquilamos su información personal a terceros. 
                  Podemos compartir información en las siguientes circunstancias:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Proveedores de servicios:</strong> Compartimos datos con terceros 
                    que nos ayudan a operar el sistema (hosting, procesamiento de pagos).
                  </li>
                  <li>
                    <strong>Requisitos legales:</strong> Cuando sea requerido por ley, 
                    proceso legal o autoridades gubernamentales.
                  </li>
                  <li>
                    <strong>Protección de derechos:</strong> Para proteger los derechos, 
                    propiedad o seguridad de Cermont o usuarios.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Seguridad de datos */}
        <section className="not-prose bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4. Seguridad de los Datos
              </h2>
              <div className="text-gray-600 dark:text-gray-300 space-y-3">
                <p>
                  Implementamos medidas de seguridad técnicas y organizativas para 
                  proteger su información:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Medidas Técnicas
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Cifrado SSL/TLS en tránsito</li>
                      <li>• Contraseñas con hash bcrypt</li>
                      <li>• Tokens JWT con expiración</li>
                      <li>• Copias de seguridad regulares</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Medidas Organizativas
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Acceso basado en roles (RBAC)</li>
                      <li>• Capacitación del personal</li>
                      <li>• Auditorías de seguridad</li>
                      <li>• Políticas de acceso estrictas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Derechos del usuario */}
        <section className="not-prose bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                5. Sus Derechos (ARCO)
              </h2>
              <div className="text-gray-600 dark:text-gray-300 space-y-3">
                <p>
                  De acuerdo con la Ley 1581 de 2012, usted tiene los siguientes derechos:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-bold text-blue-600">A</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Acceso</p>
                      <p className="text-xs">Conocer sus datos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-sm font-bold text-green-600">R</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Rectificación</p>
                      <p className="text-xs">Corregir datos inexactos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-sm font-bold text-red-600">C</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Cancelación</p>
                      <p className="text-xs">Solicitar eliminación</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-sm font-bold text-amber-600">O</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Oposición</p>
                      <p className="text-xs">Oponerse al tratamiento</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Retención de datos */}
        <section className="not-prose bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            6. Retención de Datos
          </h2>
          <div className="text-gray-600 dark:text-gray-300 space-y-3">
            <p>
              Conservamos su información personal durante el tiempo que sea necesario para:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Cumplir con los propósitos descritos en esta política.</li>
              <li>Cumplir con obligaciones legales, contables o de informes.</li>
              <li>Resolver disputas y hacer cumplir nuestros acuerdos.</li>
            </ul>
            <p>
              Los datos de órdenes de servicio se conservan por un mínimo de 5 años 
              conforme a la normativa fiscal colombiana.
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="not-prose bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            7. Cookies y Tecnologías Similares
          </h2>
          <div className="text-gray-600 dark:text-gray-300 space-y-3">
            <p>
              Utilizamos cookies y tecnologías de almacenamiento local para:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Mantener su sesión activa.</li>
              <li>Recordar sus preferencias (tema oscuro/claro, idioma).</li>
              <li>Almacenar datos para funcionamiento offline.</li>
              <li>Analizar patrones de uso para mejorar el servicio.</li>
            </ul>
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
                Contacto del Responsable de Datos
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Para ejercer sus derechos ARCO o cualquier consulta sobre esta política:
              </p>
              <div className="space-y-2">
                <a 
                  href="mailto:privacidad@cermont.com" 
                  className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:underline font-medium"
                >
                  <Mail className="h-4 w-4" />
                  privacidad@cermont.com
                </a>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tiempo de respuesta: máximo 15 días hábiles conforme a la ley.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
