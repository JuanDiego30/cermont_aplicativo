-- =====================================================
-- CERMONT WEB - ESQUEMA SIMPLIFICADO Y FUNCIONAL
-- PostgreSQL con Supabase
-- Sin RLS para facilitar el inicio
-- =====================================================

-- ===== EXTENSIONES =====
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== TABLA: usuarios =====
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('cliente', 'tecnico', 'coordinador', 'gerente', 'admin')),
  empresa VARCHAR(255),
  telefono VARCHAR(50),
  avatar_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA: clientes =====
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  nit VARCHAR(50) UNIQUE NOT NULL,
  direccion TEXT,
  telefono VARCHAR(50),
  email VARCHAR(255),
  contacto_principal VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA: equipos =====
CREATE TABLE IF NOT EXISTS equipos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo VARCHAR(100) NOT NULL CHECK (tipo IN ('CCTV', 'Radio Enlace', 'Torre', 'Otro')),
  modelo VARCHAR(255),
  serial VARCHAR(255),
  ubicacion TEXT,
  fecha_instalacion DATE,
  estado VARCHAR(50) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'en_mantenimiento', 'retirado')),
  especificaciones JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA: ordenes_trabajo =====
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_orden VARCHAR(50) UNIQUE NOT NULL,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  equipo_id UUID REFERENCES equipos(id) ON DELETE SET NULL,
  tecnico_asignado_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  coordinador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  
  tipo_orden VARCHAR(100) NOT NULL CHECK (tipo_orden IN ('Mantenimiento Preventivo', 'Mantenimiento Correctivo', 'Instalación', 'Diagnóstico')),
  tipo_equipo VARCHAR(100) NOT NULL CHECK (tipo_equipo IN ('CCTV', 'Radio Enlace', 'Torre', 'Otro')),
  
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  ubicacion TEXT,
  fecha_programada DATE,
  fecha_inicio TIMESTAMP WITH TIME ZONE,
  fecha_finalizacion TIMESTAMP WITH TIME ZONE,
  
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'asignada', 'en_progreso', 'completada', 'cancelada', 'aprobada')),
  prioridad VARCHAR(20) DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),
  
  datos_tecnicos JSONB,
  observaciones TEXT,
  recomendaciones TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA: evidencias =====
CREATE TABLE IF NOT EXISTS evidencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
  tipo VARCHAR(100) CHECK (tipo IN ('antes', 'durante', 'despues', 'camara', 'equipo', 'otro')),
  url TEXT NOT NULL,
  descripcion TEXT,
  tomada_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_captura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA: historial_ordenes =====
CREATE TABLE IF NOT EXISTS historial_ordenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
  accion VARCHAR(100) NOT NULL CHECK (accion IN ('creada', 'asignada', 'reasignada', 'actualizada', 'completada', 'aprobada', 'rechazada', 'cancelada')),
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50),
  cambios JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA: plantillas_mantenimiento =====
CREATE TABLE IF NOT EXISTS plantillas_mantenimiento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  tipo_equipo VARCHAR(100) NOT NULL CHECK (tipo_equipo IN ('CCTV', 'Radio Enlace', 'Torre', 'Otro')),
  descripcion TEXT,
  checklist JSONB,
  campos_requeridos JSONB,
  created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== ÍNDICES =====

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_nit ON clientes(nit);

-- Índices para equipos
CREATE INDEX IF NOT EXISTS idx_equipos_cliente ON equipos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_equipos_tipo ON equipos(tipo);

-- Índices para ordenes_trabajo
CREATE INDEX IF NOT EXISTS idx_ordenes_numero ON ordenes_trabajo(numero_orden);
CREATE INDEX IF NOT EXISTS idx_ordenes_cliente ON ordenes_trabajo(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_tecnico ON ordenes_trabajo(tecnico_asignado_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes_trabajo(estado);

-- Índices para evidencias
CREATE INDEX IF NOT EXISTS idx_evidencias_orden ON evidencias(orden_id);

-- Índices para historial
CREATE INDEX IF NOT EXISTS idx_historial_orden ON historial_ordenes(orden_id);

-- ===== FUNCIÓN: Generar número de orden automático =====
CREATE OR REPLACE FUNCTION generar_numero_orden()
RETURNS TRIGGER AS $$
DECLARE
  anio VARCHAR(4);
  mes VARCHAR(2);
  consecutivo INTEGER;
  nuevo_numero VARCHAR(50);
BEGIN
  IF NEW.numero_orden IS NOT NULL AND NEW.numero_orden != '' THEN
    RETURN NEW;
  END IF;
  
  anio := TO_CHAR(NOW(), 'YYYY');
  mes := TO_CHAR(NOW(), 'MM');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero_orden FROM 10) AS INTEGER)), 0) + 1
  INTO consecutivo
  FROM ordenes_trabajo
  WHERE numero_orden LIKE 'OT-' || anio || '-' || mes || '-%';
  
  nuevo_numero := 'OT-' || anio || '-' || mes || '-' || LPAD(consecutivo::TEXT, 4, '0');
  
  NEW.numero_orden := nuevo_numero;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== TRIGGER: Generar número de orden =====
DROP TRIGGER IF EXISTS trigger_generar_numero_orden ON ordenes_trabajo;
CREATE TRIGGER trigger_generar_numero_orden
  BEFORE INSERT ON ordenes_trabajo
  FOR EACH ROW EXECUTE FUNCTION generar_numero_orden();

-- ===== DATOS INICIALES =====

-- Insertar usuario admin
INSERT INTO usuarios (email, nombre, rol) 
VALUES ('admin@cermont.com', 'Administrador', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Mensaje de éxito
SELECT 'Schema creado exitosamente' as mensaje;
