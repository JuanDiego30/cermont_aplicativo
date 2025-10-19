import { config } from 'dotenv';
import { resolve } from 'path';

// Intentar cargar desde múltiples ubicaciones
const envPath = resolve(__dirname, '../../.env');
console.log('Intentando cargar .env desde:', envPath);

const result = config({ path: envPath });

if (result.error) {
  console.error('Error cargando .env:', result.error);
} else {
  console.log('.env cargado exitosamente');
}

// Exportar configuración
export const ENV = {
  PORT: process.env.PORT || '4000',
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

// Validar variables críticas
export function validateEnv() {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter(key => !ENV[key as keyof typeof ENV]);
  
  if (missing.length > 0) {
    console.error('Variables de entorno faltantes:', missing);
    console.error('ENV actual:', ENV);
    throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
  }
  
  console.log('✓ Variables de entorno validadas correctamente');
}
