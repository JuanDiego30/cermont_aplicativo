import { createClient } from '@supabase/supabase-js';
import { ENV, validateEnv } from './env';

// Validar variables de entorno
validateEnv();

export const supabaseAdmin = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const supabasePublic = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY || ENV.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
