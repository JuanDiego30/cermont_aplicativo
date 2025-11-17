# ?? SOLUCIÓN RÁPIDA - FRONTEND NO INICIA

## ?? El Problema

Frontend no estaba iniciando porque:
1. ? Turbopack tenía error
2. ? Faltaba `prom-client` en backend
3. ? BD no estaba seedeada

## ? Lo Que Hicimos

### 1. Instalamos prom-client
```bash
cd backend
npm install prom-client
```

### 2. Removimos --turbo del dev script
```bash
# Editado frontend/package.json
"dev": "next dev"  # Era: "next dev --turbo"
```

### 3. Seedeamos la BD
```bash
npm run db:seed
```

---

## ?? CÓMO INICIAR AHORA

### OPCIÓN 1: Separado (RECOMENDADO para debugging)

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# Output: ? Servidor escuchando en http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
# Output: Ready in X seconds
# ? Local: http://localhost:3000
```

### OPCIÓN 2: Juntos
```bash
npm run dev
# Inicia ambos en paralelo
```

---

## ?? Verificación

### Backend OK?
```bash
curl http://localhost:5000/api/auth/profile
# Debería retornar error 401 (sin token), no error de conexión
```

### Frontend OK?
```
Abre: http://localhost:3000/login
# Debería cargar sin errores
```

---

## ?? Credenciales Para Login

```
Email: admin@cermont.com
Password: Admin123!
```

---

## ?? Si Algo Falla

### Backend no arranca
```bash
# Instalar prom-client
cd backend && npm install prom-client && cd ..
```

### Frontend lento o falla
```bash
# Limpiar caché
rm -r frontend/.next
npm run dev:frontend
```

### Puerto en uso
```bash
# Matar procesos node
Get-Process node | Stop-Process -Force

# Limpiar puertos
netstat -ano | findstr ":5000\|:3000"
```

---

## ?? Resumen

**La aplicación está 100% lista, solo necesitaba:**
- ? prom-client instalado
- ? Turbopack deshabilitado
- ? BD seedeada

**Ahora ejecuta:**
```bash
npm run dev
```

**Y accede a:** http://localhost:3000/login

¡Listo! ??
