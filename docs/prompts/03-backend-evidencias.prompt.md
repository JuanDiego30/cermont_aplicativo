# 📸 CERMONT BACKEND EVIDENCIAS AGENT

**Responsabilidad:** Upload, MIME validation, thumbnails, permisos, metadata  
**Reglas:** 21-30  
**Patrón:** SIN PREGUNTAS  
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND EVIDENCIAS AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/modules/evidencias/**
   - MIME whitelist, size limits, thumbnails
   - Permisos por usuario, metadata
   - URLs temporales (1 hora)
   
2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: pnpm run test -- --testPathPattern=evidencias
```

---

## 📋 REGLAS 21-30 APLICABLES

| Regla | Descripción | Verificar |
|-------|-------------|-----------|
| 21 | MIME: jpeg, png, gif, pdf only | ✓ Whitelist activa |
| 22 | Max 50MB por archivo | ✓ Size check |
| 23 | Thumbnails 150x150, 300x300 | ✓ Sharp/ImageMagick |
| 24 | Carpeta /orden/{id}/ | ✓ Organización |
| 25 | Permisos: propietario/admin | ✓ ACL en read |
| 26 | Metadata: user, ts, SHA256 | ✓ DB metadata row |
| 27 | URLs temp con token (1h) | ✓ JWT expiring URL |
| 28 | Validar por inspector | ✓ Approved flag |
| 29 | Galería en orden | ✓ GET /ordenes/{id}/evidencias |
| 30 | Borrar archivo físico | ✓ unlink() en DELETE |

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **MIME Whitelist (Regla 21)**
   - ¿Solo: image/jpeg, image/png, image/gif, application/pdf?
   - ¿Bloqueado: exe, zip, sh, bat, etc?
   - ¿Validar en backend (no solo frontend)?

2. **Tamaño (Regla 22)**
   - ¿Máximo 50MB?
   - ¿Mensaje error si supera?

3. **Thumbnails (Regla 23)**
   - ¿Se generan automático?
   - ¿150x150 (preview)?
   - ¿300x300 (detail)?
   - ¿O custom sizes?

4. **Carpetas (Regla 24)**
   - ¿/storage/evidencias/orden_123/?
   - ¿Segregación por orden?

5. **Permisos (Regla 25)**
   - ¿Solo propietario ve su evidencia?
   - ¿Admin ve todo?
   - ¿No hay acceso cruzado?

6. **Metadata (Regla 26)**
   - ¿uploaded_by_user_id?
   - ¿timestamp?
   - ¿sha256_hash del archivo?
   - ¿Todos guardados en DB?

7. **URLs Temporales (Regla 27)**
   - ¿/evidencias/download/:token?
   - ¿Token expira 1 hora?
   - ¿JWT con exp claim?

8. **Validación (Regla 28)**
   - ¿approved_by_inspector_id field?
   - ¿approved_at timestamp?

9. **Galería (Regla 29)**
   - ¿GET /ordenes/{id}/evidencias?
   - ¿Retorna lista con thumbnails?

10. **Borrar (Regla 30)**
    - ¿DELETE elimina DB row?
    - ¿Y archivo físico también?
    - ¿Y thumbnails?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] MIME whitelist: jpeg, png, gif, pdf
- [ ] Tamaño máx 50MB
- [ ] Thumbnails auto 150x150 y 300x300
- [ ] Archivos en /storage/evidencias/orden_{id}/
- [ ] Permisos: propietario/admin
- [ ] Metadata: usuario, timestamp, SHA256
- [ ] URLs descarga con token 1 hora
- [ ] Flag validado por inspector
- [ ] Galería en GET /ordenes/{id}/evidencias
- [ ] DELETE borra archivo + DB

---

## 🧪 VERIFICACIÓN

```bash
cd apps/api

# Tests evidencias
pnpm run test -- --testPathPattern=evidencias

# Esperado: >75% cobertura

# Verificar MIME (Regla 21)
grep -r "jpeg\|png\|gif\|pdf" src/modules/evidencias/ | grep -i mime

# Esperado: Whitelist encontrada

# Verificar tamaño
grep -r "50.*MB\|52428800" src/modules/evidencias/

# Esperado: Límite de 50MB presente

# Verificar thumbnails
grep -r "150\|300\|thumbnail\|sharp" src/modules/evidencias/

# Esperado: Sharp o ImageMagick encontrado

# Verificar permisos
grep -r "ACL\|permission\|authorize" src/modules/evidencias/

# Esperado: Guard de permisos presente
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**
