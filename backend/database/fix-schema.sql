-- =====================================================
-- CERMONT WEB - SCRIPT DE CORRECCIÓN
-- Ejecuta este script DESPUÉS del schema principal
-- =====================================================

-- Eliminar la política problemática si existe
DROP POLICY IF EXISTS "Cliente ve solo su información" ON clientes;

-- Recrear la política correcta
CREATE POLICY "Cliente ve solo su información"
  ON clientes FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'cliente'
    AND id IN (
      SELECT cliente_id FROM equipos
      WHERE id IN (
        SELECT equipo_id FROM ordenes_trabajo
        WHERE cliente_id IN (
          SELECT id FROM clientes WHERE id = clientes.id
        )
      )
    )
  );

-- Verificación
SELECT 'Política corregida exitosamente' as mensaje;
