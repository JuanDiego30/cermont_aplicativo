"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General" },
    { id: "notifications", label: "Notificaciones" },
    { id: "security", label: "Seguridad" },
    { id: "integrations", label: "Integraciones" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra la configuración del sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-2 px-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-brand-500 text-brand-600 dark:text-brand-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configuración General
              </h3>
              
              {/* Company Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la Empresa
                  </label>
                  <input
                    type="text"
                    defaultValue="Cermont S.A."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    RUC
                  </label>
                  <input
                    type="text"
                    defaultValue="20123456789"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    defaultValue="Av. Principal 123, Lima"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Time Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zona Horaria
                </label>
                <select className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                  <option value="America/Lima">America/Lima (GMT-5)</option>
                  <option value="America/Bogota">America/Bogota (GMT-5)</option>
                  <option value="America/Guayaquil">America/Guayaquil (GMT-5)</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Idioma del Sistema
                </label>
                <select className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="flex justify-end pt-4">
                <button className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
                  Guardar Cambios
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Preferencias de Notificaciones
              </h3>

              <div className="space-y-4">
                {[
                  { id: "new_orders", label: "Nuevas órdenes de trabajo", description: "Recibe notificaciones cuando se cree una nueva OT" },
                  { id: "status_changes", label: "Cambios de estado", description: "Notificaciones cuando una OT cambie de estado" },
                  { id: "comments", label: "Comentarios", description: "Notificaciones de nuevos comentarios en OTs" },
                  { id: "due_date", label: "Fechas de vencimiento", description: "Alertas de OTs próximas a vencer" },
                  { id: "reports", label: "Reportes semanales", description: "Resumen semanal de actividad" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
                  Guardar Preferencias
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configuración de Seguridad
              </h3>

              {/* Password Policy */}
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Política de Contraseñas</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:bg-gray-700 dark:border-gray-600" />
                    <span className="text-gray-700 dark:text-gray-300">Mínimo 8 caracteres</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:bg-gray-700 dark:border-gray-600" />
                    <span className="text-gray-700 dark:text-gray-300">Requiere mayúsculas y minúsculas</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:bg-gray-700 dark:border-gray-600" />
                    <span className="text-gray-700 dark:text-gray-300">Requiere números</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:bg-gray-700 dark:border-gray-600" />
                    <span className="text-gray-700 dark:text-gray-300">Requiere caracteres especiales</span>
                  </label>
                </div>
              </div>

              {/* Session Settings */}
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Configuración de Sesión</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Tiempo de expiración de sesión (minutos)
                    </label>
                    <input
                      type="number"
                      defaultValue={60}
                      className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:bg-gray-700 dark:border-gray-600" />
                    <span className="text-gray-700 dark:text-gray-300">Cerrar sesión al cerrar el navegador</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
                  Guardar Configuración
                </button>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Integraciones
              </h3>

              <div className="space-y-4">
                {/* Email Integration */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Email (SMTP)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Configuración del servidor de correo</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded">
                      Conectado
                    </span>
                  </div>
                  <button className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
                    Configurar →
                  </button>
                </div>

                {/* Storage Integration */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Almacenamiento Cloud</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">AWS S3 / Google Cloud Storage</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400 rounded">
                      No configurado
                    </span>
                  </div>
                  <button className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
                    Configurar →
                  </button>
                </div>

                {/* Calendar Integration */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Calendario</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Google Calendar / Outlook</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400 rounded">
                      No configurado
                    </span>
                  </div>
                  <button className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
                    Configurar →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
