-- ==============================================
-- CATALOGO DE FALLAS + RELACION ORDEN_FALLAS
-- Ejecutar después del schema base
-- ==============================================

CREATE TABLE IF NOT EXISTS fallas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  tipo_equipo VARCHAR(100) NOT NULL CHECK (tipo_equipo IN ('CCTV', 'Radio Enlace', 'Torre', 'Otro')),
  severidad VARCHAR(20) NOT NULL DEFAULT 'media' CHECK (severidad IN ('baja','media','alta')),
  descripcion TEXT,
  causas_probables TEXT,
  acciones_sugeridas TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orden_fallas (
  orden_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
  falla_id UUID NOT NULL REFERENCES fallas(id) ON DELETE RESTRICT,
  PRIMARY KEY (orden_id, falla_id),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_fallas_tipo_equipo ON fallas(tipo_equipo);
CREATE INDEX IF NOT EXISTS idx_fallas_severidad ON fallas(severidad);
CREATE INDEX IF NOT EXISTS idx_orden_fallas_orden ON orden_fallas(orden_id);

-- Trigger de updated_at
DO $$ BEGIN
  CREATE TRIGGER update_fallas_updated_at BEFORE UPDATE ON fallas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN undefined_function THEN
  -- La función se define en schema.sql; si no existe, omitir
  NULL;
END $$;

-- Semillas mínimas (opcionales)
INSERT INTO fallas (codigo, nombre, tipo_equipo, severidad, descripcion)
VALUES
  ('CCTV-001', 'Cámara sin señal', 'CCTV', 'alta', 'Pérdida total de video en cámara'),
  ('CCTV-002', 'Imagen borrosa', 'CCTV', 'media', 'Desenfoque o suciedad en lente'),
  ('RAD-001', 'Enlace caído', 'Radio Enlace', 'alta', 'Interrupción completa del enlace'),
  ('TOR-001', 'Estructura con corrosión', 'Torre', 'alta', 'Corrosión visible en elementos críticos')
ON CONFLICT (codigo) DO NOTHING;
