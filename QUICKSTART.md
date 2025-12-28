# 🚀 QUICKSTART - INICIA EN 5 MINUTOS

**Título:** Cómo ejecutar Cermont en tu máquina en 5 minutos

---

## 💫 OPCIÓN 1: CON MAKE (RECOMENDADO)

### Requisitos
- Docker Desktop instalado (Windows/Mac) o Docker + Docker Compose (Linux)
- Git
- **Eso es todo**

### Pasos

```bash
# 1. Clonar (30 segundos)
git clone https://github.com/JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo

# 2. Copiar .env (10 segundos)
cp .env.example .env

# 3. Iniciar (30 segundos)
make dev

# 4. Esperar... (2-3 minutos)
# Ver los logs
make logs
```

### Listo ✅
- **Backend:** http://localhost:3000
- **Frontend:** http://localhost:4200
- **Database:** localhost:5432

---

## 💫 OPCIÓN 2: CON DOCKER COMPOSE

### Si no tienes Make (Windows sin WSL2, etc.)

```bash
# 1. Clonar
git clone https://github.com/JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo

# 2. Copiar .env
cp .env.example .env

# 3. Build
docker-compose build

# 4. Up
docker-compose up -d

# 5. Ver logs
docker-compose logs -f
```

### Listo ✅
Mismo resultado que Option 1

---

## 💫 OPCIÓN 3: DESARROLLO LOCAL (SIN DOCKER)

### Requisitos
- Node.js 18+
- PostgreSQL 15 instalado y corriendo
- NPM o Yarn

### Pasos

```bash
# 1. Clonar
git clone https://github.com/JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo

# 2. Copiar .env
cp .env.example .env

# 3. Editar .env
# Cambiar: DB_HOST=localhost (en lugar de postgres)

# 4. Instalar dependencias
cd apps/api
npm install
cd ../web
npm install
cd ../..

# 5. Backend (Terminal 1)
cd apps/api
npm run start:dev

# 6. Frontend (Terminal 2)
cd apps/web
npm start

# 7. Database (Terminal 3 o background)
postgres  # Tu comando para iniciar PostgreSQL
```

### Listo ✅
Same ports as above

---

## ✅ VERIFICACIÓN RÁPIDA

### Backend Health
```bash
curl http://localhost:3000/api/health
# Response: {"status": "ok"}
```

### Frontend
```bash
# Abrir en navegador
http://localhost:4200
# Debería ver login page
```

### Database
```bash
# Si tienes psql
psql -h localhost -U postgres -d cermont
```

---

## 💫 PROBLEMAS COMUNES

### ❌ "Docker daemon not running"
**Solución:**
- Mac/Windows: Abre Docker Desktop
- Linux: `sudo systemctl start docker`

### ❌ "Port 3000/4200 already in use"
**Solución:**
```bash
# Kill proceso
lsof -i :3000
kill -9 <PID>
```

### ❌ "Database connection refused"
**Solución:**
```bash
# Esperar más (PostgreSQL inicia lento)
sleep 10
make up
```

### ❌ "No such file or directory: .env"
**Solución:**
```bash
cp .env.example .env
```

---

## 📋 CREDENCIALES DE PRUEBA

Al usar `.env.example`, puedes probar con:

### Usuario Admin
```
Email: admin@cermont.com
Password: Admin123!@#
```

### Usuario Regular
```
Email: user@cermont.com
Password: User123!@#
```

*Nota: Estos son ejemplos. Crear usuarios nuevos es más seguro.*

---

## 🎆 PRÓXIMOS PASOS

### 1. Explore la Aplicación
- Login con credenciales
- Navega por dashboard
- Crea una orden de prueba
- Accede a admin panel

### 2. Revisa la Documentación
- `README_COMPLETE.md` - Guía general
- `FASE_5_DEVOPS_DEPLOYMENT.md` - DevOps
- `FASE_4_TESTING_CHECKLIST.md` - Testing

### 3. Modifica el Código
```bash
# Ver cambios en vivo
make logs

# Backend se recompila automáticamente
# Frontend también (HMR en Angular)
```

### 4. Run Tests
```bash
make test
```

### 5. Deploy (Cuando estés listo)
```bash
git push origin main
# CI/CD se ejecuta automáticamente
```

---

## 🏗️ COMANDOS ÚTILES

```bash
# Development
make dev              # Iniciar todo
make logs             # Ver logs
make test             # Tests
make lint             # Verificar código
make format           # Formatear código

# Database
make migrate          # Ejecutar migraciones
make seed             # Cargar datos de prueba
make db-reset         # Reset completo

# Docker
make build            # Compilar imágenes
make up               # Iniciar servicios
make down             # Detener servicios
make clean            # Limpiar volumen

# Help
make help             # Ver todos los comandos
```

---

## 📄 MÁS INFORMACIÓN

| Documento | Para... | Tiempo |
|-----------|---------|--------|
| `README_COMPLETE.md` | Resumen general | 10 min |
| `FASE_5_DEVOPS_DEPLOYMENT.md` | DevOps & Deployment | 20 min |
| `FASE_4_TESTING_CHECKLIST.md` | Testing & QA | 15 min |
| `README_FASE_4.md` | API Endpoints | 10 min |

---

## 🈟 TIPS

1. **Usa Make** - Más rápido y fácil
2. **Ver logs** - `make logs` para diagnosticar problemas
3. **Docker Desktop** - Muy recomendado para simplicidad
4. **Espera el startup** - Primera vez toma 2-3 minutos
5. **Revisa .env** - Personaliza si necesitas

---

## 🈀 ¿Preguntas?

**GitHub Issues:** [JuanDiego30/cermont_aplicativo/issues](https://github.com/JuanDiego30/cermont_aplicativo/issues)

**Email:** 101435926+JuanDiego30@users.noreply.github.com

---

**¡Ya está! Tu Cermont está corriendo. 🚀**

> Siguiente paso: Abre http://localhost:4200 en tu navegador

