export default function ConfigPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h1>
        <p className="text-gray-500 dark:text-gray-400">Ajustes del sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Perfil</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Guardar Cambios
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Seguridad</h2>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cambiar Contraseña
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Accesos Rápidos</h2>
          <nav className="space-y-2">
            {['Usuarios', 'Roles', 'Clientes', 'Kits', 'Checklists'].map((item) => (
              <a key={item} href="#" className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                {item}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
