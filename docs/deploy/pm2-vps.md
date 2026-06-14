# PM2 Deployment — Cermont S.A.S. (VPS Linux)

> ⚠️ **PM2 es para producción/VPS únicamente.**  
> En desarrollo local usa `npm run dev` (turbo).  
> No ejecutes `pm2 startup` ni `pm2 save` en tu máquina local/Windows.

## Prerrequisitos

- Node.js >= 22.20.0, npm >= 10.9.4
- PM2 instalado globalmente: `npm install -g pm2`
- MongoDB (local o Atlas)
- Variables de entorno configuradas en `backend/.env`

## Scripts disponibles (root package.json)

| Comando | Descripción |
|---|---|
| `npm run build` | Compila todos los workspaces |
| `npm run deploy:pm2:start` | Inicia ambos procesos con PM2 |
| `npm run deploy:pm2:reload` | Recarga procesos con nuevas env vars |
| `npm run deploy:pm2:status` | Muestra estado de los procesos |
| `npm run deploy:pm2:logs` | Muestra logs en tiempo real |
| `npm run deploy:pm2:save` | Persiste la lista de procesos |
| `npm run deploy:pm2:startup` | Genera comando de autostart |

## Despliegue inicial

```bash
# 1. Clonar y entrar al repo
git clone <repo-url> /opt/cermont
cd /opt/cermont

# 2. Instalar dependencias
npm ci

# 3. Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con valores reales de producción

# 4. Compilar
npm run build

# 5. Iniciar con PM2
npm run deploy:pm2:start

# 6. Verificar estado
npm run deploy:pm2:status
# Deberías ver "online" para cermont-backend y cermont-frontend

# 7. Persistir procesos
npm run deploy:pm2:save

# 8. Configurar autostart al reinicio del sistema
npm run deploy:pm2:startup
# IMPORTANTE: pm2 startup imprime un comando específico del sistema.
# Ejecuta ESE comando con sudo (no el comando npm):
#   sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

## Actualización (rollback seguro)

```bash
# 1. Pull de nuevos cambios
git pull origin main

# 2. Reinstalar dependencias (si cambió package-lock.json)
npm ci

# 3. Recompilar
npm run build

# 4. Recargar procesos con nuevas variables
npm run deploy:pm2:reload

# 5. Verificar
npm run deploy:pm2:status
pm2 logs --lines 20
```

## Monitoreo

```bash
# Logs en tiempo real
pm2 logs

# Logs de una app específica
pm2 logs cermont-backend
pm2 logs cermont-frontend

# Dashboard en terminal
pm2 monit

# Métricas
pm2 show cermont-backend
pm2 show cermont-frontend
```

## Arquitectura PM2

```
ecosystem.config.cjs
├── cermont-backend
│   ├── script: dist/server.js
│   ├── port: 4000
│   ├── instances: 1 (fork)
│   ├── logs: ./logs/backend-{error,out}.log
│   └── max_memory_restart: 512M
│
└── cermont-frontend
    ├── script: next start -p 3000
    ├── port: 3000
    ├── instances: 1 (fork)
    ├── logs: ./logs/frontend-{error,out}.log
    └── max_memory_restart: 512M
```

## Solución de problemas

### Proceso se cae inmediatamente
```bash
pm2 logs cermont-backend --lines 50
# Buscar errores de:
# - Puerto en uso → cambiar PORT en ecosystem.config.cjs
# - MongoDB no disponible → verificar MONGODB_URI
# - JWT_SECRET faltante → verificar backend/.env
```

### Frontend no responde
```bash
pm2 logs cermont-frontend --lines 50
# Verificar que:
# - NEXT_PUBLIC_API_URL apunta al backend correcto
# - El build se completó sin errores
# - El puerto 3000 no está ocupado
```

### Reinicio automático no funciona
Si `pm2 startup` no funciona:
```bash
pm2 unstartup
pm2 startup systemd -u <tu-usuario> --hp /home/<tu-usuario>
# Copiar y ejecutar el comando impreso con sudo
pm2 save
```

## Notas importantes

- No usar `pm2 start` como root. Usa un usuario sin privilegios.
- Los logs rotan automáticamente con `pm2-logrotate`:
  ```bash
  pm2 install pm2-logrotate
  pm2 set pm2-logrotate:max_size 10M
  pm2 set pm2-logrotate:retain 7
  ```
- Para HTTPS, usa un reverse proxy (nginx, Caddy) apuntando a los puertos de PM2.
- Las env vars se cargan desde `backend/.env` y `frontend/.env.local` — PM2 no las sobreescribe.
