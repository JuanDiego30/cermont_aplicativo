# Verificar Migración de Fallas

Después de ejecutar `backend/database/migrations/20251018_add_fallas.sql` en Supabase SQL Editor, verifica:

## 1. Ejecutar en SQL Editor:
```sql
-- Ver las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('fallas', 'orden_fallas');

-- Ver las fallas de ejemplo insertadas
SELECT id, codigo, nombre, tipo_equipo, severidad 
FROM fallas 
ORDER BY codigo;

-- Verificar que hay 4 fallas de ejemplo (CCTV-001, CCTV-002, RAD-001, TOR-001)
SELECT COUNT(*) as total_fallas FROM fallas;
```

## 2. Resultado esperado:
- ✅ Tabla `fallas` existe
- ✅ Tabla `orden_fallas` existe  
- ✅ 4 registros de ejemplo en `fallas`
- ✅ Fallas: CCTV-001 (Pérdida de señal), CCTV-002 (Imagen borrosa), RAD-001 (Atenuación), TOR-001 (Corrosión)

Si ves estos resultados, ¡la migración fue exitosa! 🎉
