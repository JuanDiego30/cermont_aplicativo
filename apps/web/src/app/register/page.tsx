import { RegisterForm } from '@/components/forms/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">CERMONT</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sistema de Gestión de Órdenes
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-center mb-6">Crear Cuenta</h2>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
