-- ==========================================
-- AGREGAR AUTENTICACIÓN GOOGLE
-- ==========================================

/*
  Warnings:
  - A unique constraint covering the columns `[googleId]` on the table `users` will be added. 
  - If there are existing duplicate values, this will fail.
*/

-- Agregar columna googleId (nullable para usuarios existentes)
ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "googleId" TEXT;

-- Agregar metadatos de OAuth (opcional pero recomendado)
ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "googleAccessToken" TEXT,
  ADD COLUMN IF NOT EXISTS "googleRefreshToken" TEXT,
  ADD COLUMN IF NOT EXISTS "googleTokenExpiry" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "googleProfile" JSONB,
  ADD COLUMN IF NOT EXISTS "lastGoogleSync" TIMESTAMP(3);

-- Agregar campos de auditoría OAuth
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "authProvider" TEXT DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);

-- ==========================================
-- ÍNDICES OPTIMIZADOS
-- ==========================================

-- Índice único para googleId
CREATE UNIQUE INDEX IF NOT EXISTS "users_googleId_key" 
  ON "users"("googleId") 
  WHERE "googleId" IS NOT NULL;

-- Índice para búsqueda por proveedor de auth
CREATE INDEX IF NOT EXISTS "users_authProvider_idx" 
  ON "users"("authProvider");

-- Índice compuesto para login con Google
CREATE INDEX IF NOT EXISTS "users_googleId_active_idx" 
  ON "users"("googleId", "active") 
  WHERE "googleId" IS NOT NULL;

-- Índice para verificación de email
CREATE INDEX IF NOT EXISTS "users_emailVerified_idx" 
  ON "users"("emailVerified");

-- ==========================================
-- VALIDACIONES Y CONSTRAINTS
-- ==========================================

-- Check: Si hay googleId, debe haber email
ALTER TABLE "users"
  ADD CONSTRAINT "users_google_requires_email"
  CHECK (
    ("googleId" IS NULL) OR 
    ("googleId" IS NOT NULL AND "email" IS NOT NULL)
  );

-- Check: authProvider debe ser válido
ALTER TABLE "users"
  ADD CONSTRAINT "users_authProvider_valid"
  CHECK (
    "authProvider" IN ('local', 'google', 'microsoft', 'apple', 'github')
  );

-- ==========================================
-- FUNCIÓN HELPER PARA SINCRONIZAR GOOGLE
-- ==========================================

CREATE OR REPLACE FUNCTION sync_google_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar timestamp de última sincronización
  IF NEW."googleProfile" IS DISTINCT FROM OLD."googleProfile" THEN
    NEW."lastGoogleSync" := CURRENT_TIMESTAMP;
  END IF;

  -- Si se verifica el email por Google, marcar como verificado
  IF NEW."googleId" IS NOT NULL AND NEW."emailVerified" = false THEN
    NEW."emailVerified" := true;
    NEW."emailVerifiedAt" := CURRENT_TIMESTAMP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar perfil de Google
CREATE TRIGGER users_sync_google_profile
  BEFORE INSERT OR UPDATE OF "googleProfile", "googleId" ON "users"
  FOR EACH ROW
  EXECUTE FUNCTION sync_google_user_profile();

-- ==========================================
-- MIGRACIÓN DE DATOS (OPCIONAL)
-- ==========================================

-- Actualizar usuarios existentes sin authProvider
UPDATE "users" 
SET "authProvider" = 'local' 
WHERE "authProvider" IS NULL;

-- Comentario: Si tienes usuarios con emails de Google existentes, 
-- puedes agregarles el authProvider manualmente:
-- UPDATE "users" 
-- SET "authProvider" = 'google', "emailVerified" = true 
-- WHERE "email" LIKE '%@gmail.com' AND "googleId" IS NULL;

