# Language Policy

## Objetivo
Estandarizar el idioma del código para mejorar consistencia y mantenibilidad sin un “big bang”.

## Reglas
- **Código (nombres de clases, métodos, variables, archivos, carpetas):** Inglés.
- **UI / textos de negocio visibles al usuario:** Español (o el idioma de producto).
- **Comentarios:** Inglés cuando explican implementación; Español permitido en contexto de negocio si es necesario.

## Estrategia de migración (incremental)
1. Seleccionar un bounded-context o feature por PR.
2. Renombrar archivos/clases/variables del módulo elegido.
3. Actualizar imports, rutas y tests relacionados.
4. Mantener build/lint/tests verdes antes de pasar al siguiente módulo.

## Fuera de alcance inicial
- No se renombrarán mensajes de UI existentes a menos que formen parte del módulo elegido.
- No se renombrarán APIs públicas sin versión/compatibilidad.

## Criterio de éxito
- Cada PR deja el módulo completamente en Inglés y con validaciones pasando.
