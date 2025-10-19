-- =====================================================
-- CERMONT WEB - ESQUEMA DE BASE DE DATOS
-- PostgreSQL con Supabase
-- =====================================================

-- ===== EXTENSIONES =====
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsqueda full-text

-- ===== TABLA: usuarios =====
CREATE TABLE usuarios (
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

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- ===== TABLA: clientes =====
CREATE TABLE clientes (
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

-- Índices para clientes
CREATE INDEX idx_clientes_nit ON clientes(nit);
CREATE INDEX idx_clientes_activo ON clientes(activo);
CREATE INDEX idx_clientes_nombre_trgm ON clientes USING gin(nombre gin_trgm_ops);

-- ===== TABLA: equipos =====
CREATE TABLE equipos (
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

-- Índices para equipos
CREATE INDEX idx_equipos_cliente ON equipos(cliente_id);
CREATE INDEX idx_equipos_tipo ON equipos(tipo);
CREATE INDEX idx_equipos_estado ON equipos(estado);
CREATE INDEX idx_equipos_serial ON equipos(serial);

-- ===== TABLA: ordenes_trabajo =====
CREATE TABLE ordenes_trabajo (
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

-- Índices para ordenes_trabajo
CREATE INDEX idx_ordenes_numero ON ordenes_trabajo(numero_orden);
CREATE INDEX idx_ordenes_cliente ON ordenes_trabajo(cliente_id);
CREATE INDEX idx_ordenes_tecnico ON ordenes_trabajo(tecnico_asignado_id);
CREATE INDEX idx_ordenes_estado ON ordenes_trabajo(estado);
CREATE INDEX idx_ordenes_prioridad ON ordenes_trabajo(prioridad);
CREATE INDEX idx_ordenes_fecha_programada ON ordenes_trabajo(fecha_programada);
CREATE INDEX idx_ordenes_tipo_orden ON ordenes_trabajo(tipo_orden);
CREATE INDEX idx_ordenes_titulo_trgm ON ordenes_trabajo USING gin(titulo gin_trgm_ops);

-- ===== TABLA: evidencias =====
CREATE TABLE evidencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
  tipo VARCHAR(100) CHECK (tipo IN ('antes', 'durante', 'despues', 'camara', 'equipo', 'otro')),
  url TEXT NOT NULL,
  descripcion TEXT,
  tomada_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_captura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para evidencias
CREATE INDEX idx_evidencias_orden ON evidencias(orden_id);
CREATE INDEX idx_evidencias_tipo ON evidencias(tipo);
CREATE INDEX idx_evidencias_usuario ON evidencias(tomada_por);

-- ===== TABLA: historial_ordenes =====
CREATE TABLE historial_ordenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
  accion VARCHAR(100) NOT NULL CHECK (accion IN ('creada', 'asignada', 'reasignada', 'actualizada', 'completada', 'aprobada', 'rechazada', 'cancelada')),
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50),
  cambios JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para historial
CREATE INDEX idx_historial_orden ON historial_ordenes(orden_id);
CREATE INDEX idx_historial_usuario ON historial_ordenes(usuario_id);
CREATE INDEX idx_historial_timestamp ON historial_ordenes(timestamp DESC);

-- ===== TABLA: plantillas_mantenimiento =====
CREATE TABLE plantillas_mantenimiento (
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

-- Índices para plantillas
CREATE INDEX idx_plantillas_tipo ON plantillas_mantenimiento(tipo_equipo);
CREATE INDEX idx_plantillas_creador ON plantillas_mantenimiento(created_by);

-- ===== FUNCIONES Y TRIGGERS =====

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipos_updated_at BEFORE UPDATE ON equipos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordenes_updated_at BEFORE UPDATE ON ordenes_trabajo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plantillas_updated_at BEFORE UPDATE ON plantillas_mantenimiento
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de orden automático
CREATE OR REPLACE FUNCTION generar_numero_orden()
RETURNS TRIGGER AS $$
DECLARE
  anio VARCHAR(4);
  mes VARCHAR(2);
  consecutivo INTEGER;
  nuevo_numero VARCHAR(50);
BEGIN
  -- Si ya tiene número, no hacer nada
  IF NEW.numero_orden IS NOT NULL AND NEW.numero_orden != '' THEN
    RETURN NEW;
  END IF;
  
  -- Obtener año y mes actual
  anio := TO_CHAR(NOW(), 'YYYY');
  mes := TO_CHAR(NOW(), 'MM');
  
  -- Obtener el consecutivo del mes
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero_orden FROM 10) AS INTEGER)), 0) + 1
  INTO consecutivo
  FROM ordenes_trabajo
  WHERE numero_orden LIKE 'OT-' || anio || '-' || mes || '-%';
  
  -- Generar el número: OT-YYYY-MM-NNNN
  nuevo_numero := 'OT-' || anio || '-' || mes || '-' || LPAD(consecutivo::TEXT, 4, '0');
  
  NEW.numero_orden := nuevo_numero;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar número de orden
CREATE TRIGGER trigger_generar_numero_orden
  BEFORE INSERT ON ordenes_trabajo
  FOR EACH ROW EXECUTE FUNCTION generar_numero_orden();

-- Función para registrar cambios en historial
CREATE OR REPLACE FUNCTION registrar_historial_orden()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo registrar si cambió el estado
  IF TG_OP = 'UPDATE' AND OLD.estado != NEW.estado THEN
    INSERT INTO historial_ordenes (
      orden_id,
      usuario_id,
      accion,
      estado_anterior,
      estado_nuevo,
      cambios
    ) VALUES (
      NEW.id,
      COALESCE(NEW.tecnico_asignado_id, NEW.coordinador_id),
      'actualizada',
      OLD.estado,
      NEW.estado,
      jsonb_build_object(
        'estado_anterior', OLD.estado,
        'estado_nuevo', NEW.estado
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para historial automático
CREATE TRIGGER trigger_historial_orden_update
  AFTER UPDATE ON ordenes_trabajo
  FOR EACH ROW EXECUTE FUNCTION registrar_historial_orden();

-- ===== ROW LEVEL SECURITY (RLS) =====

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_ordenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas_mantenimiento ENABLE ROW LEVEL SECURITY;

-- ===== POLÍTICAS RLS PARA USUARIOS =====

-- Admin puede ver todo
CREATE POLICY "Admin puede ver todos los usuarios"
  ON usuarios FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

-- Gerente/Coordinador pueden ver usuarios
CREATE POLICY "Gerente/Coordinador pueden ver usuarios"
  ON usuarios FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('gerente', 'coordinador')
  );

-- Usuarios pueden ver su propio perfil
CREATE POLICY "Usuario puede ver su perfil"
  ON usuarios FOR SELECT
  USING (id = auth.uid());

-- ===== POLÍTICAS RLS PARA CLIENTES =====

-- Cliente solo ve su propia información
CREATE POLICY "Cliente ve solo su información"
  ON clientes FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'cliente'
    AND id IN (
      SELECT cliente_id FROM equipos
      WHERE id IN (
        SELECT equipo_id FROM ordenes_trabajo
        WHERE tecnico_asignado_id = auth.uid()
      )
    )
  );

-- Técnicos/Coordinadores/Gerentes/Admin ven todos los clientes
CREATE POLICY "Staff ve todos los clientes"
  ON clientes FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('tecnico', 'coordinador', 'gerente', 'admin')
  );

-- ===== POLÍTICAS RLS PARA EQUIPOS =====

-- Cliente ve solo sus equipos
CREATE POLICY "Cliente ve solo sus equipos"
  ON equipos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clientes c
      WHERE c.id = equipos.cliente_id
      AND (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'cliente'
    )
  );

-- Staff ve todos los equipos
CREATE POLICY "Staff ve todos los equipos"
  ON equipos FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('tecnico', 'coordinador', 'gerente', 'admin')
  );

-- ===== POLÍTICAS RLS PARA ÓRDENES DE TRABAJO =====

-- Cliente ve solo órdenes de sus equipos
CREATE POLICY "Cliente ve solo sus órdenes"
  ON ordenes_trabajo FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'cliente'
    AND cliente_id IN (
      SELECT id FROM clientes WHERE id = cliente_id
    )
  );

-- Técnico ve solo órdenes asignadas
CREATE POLICY "Técnico ve órdenes asignadas"
  ON ordenes_trabajo FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'tecnico'
    AND tecnico_asignado_id = auth.uid()
  );

-- Técnico puede actualizar sus órdenes
CREATE POLICY "Técnico actualiza sus órdenes"
  ON ordenes_trabajo FOR UPDATE
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'tecnico'
    AND tecnico_asignado_id = auth.uid()
  );

-- Coordinador/Gerente/Admin ven todas las órdenes
CREATE POLICY "Coordinador+ ve todas las órdenes"
  ON ordenes_trabajo FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('coordinador', 'gerente', 'admin')
  );

-- Coordinador/Gerente/Admin pueden crear/actualizar órdenes
CREATE POLICY "Coordinador+ gestiona órdenes"
  ON ordenes_trabajo FOR ALL
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('coordinador', 'gerente', 'admin')
  );

-- ===== POLÍTICAS RLS PARA EVIDENCIAS =====

CREATE POLICY "Evidencias visibles según orden"
  ON evidencias FOR SELECT
  USING (
    orden_id IN (
      SELECT id FROM ordenes_trabajo
      -- Hereda permisos de la orden
    )
  );

-- ===== POLÍTICAS RLS PARA HISTORIAL =====

CREATE POLICY "Historial visible según orden"
  ON historial_ordenes FOR SELECT
  USING (
    orden_id IN (
      SELECT id FROM ordenes_trabajo
      -- Hereda permisos de la orden
    )
  );

-- ===== VISTAS ÚTILES =====

-- Vista de órdenes con información completa
CREATE OR REPLACE VIEW vista_ordenes_completas AS
SELECT 
  o.*,
  c.nombre AS cliente_nombre,
  c.nit AS cliente_nit,
  e.tipo AS equipo_tipo,
  e.modelo AS equipo_modelo,
  e.serial AS equipo_serial,
  t.nombre AS tecnico_nombre,
  t.email AS tecnico_email,
  coord.nombre AS coordinador_nombre,
  (SELECT COUNT(*) FROM evidencias WHERE orden_id = o.id) AS total_evidencias,
  (SELECT COUNT(*) FROM historial_ordenes WHERE orden_id = o.id) AS total_cambios
FROM ordenes_trabajo o
LEFT JOIN clientes c ON o.cliente_id = c.id
LEFT JOIN equipos e ON o.equipo_id = e.id
LEFT JOIN usuarios t ON o.tecnico_asignado_id = t.id
LEFT JOIN usuarios coord ON o.coordinador_id = coord.id;

-- ===== DATOS DE PRUEBA (OPCIONAL) =====

-- Insertar usuario admin por defecto
INSERT INTO usuarios (email, nombre, rol) VALUES
  ('admin@cermont.com', 'Administrador', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Comentar estas líneas en producción
/*
INSERT INTO usuarios (email, nombre, rol) VALUES
  ('gerente@cermont.com', 'Juan Gerente', 'gerente'),
  ('coordinador@cermont.com', 'María Coordinadora', 'coordinador'),
  ('tecnico1@cermont.com', 'Carlos Técnico', 'tecnico'),
  ('cliente1@cermont.com', 'Empresa Cliente', 'cliente')
ON CONFLICT (email) DO NOTHING;
*/
