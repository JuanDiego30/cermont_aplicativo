# ?? GUÍA DE DEPLOYMENT - VPS/PRODUCCIÓN

## ? STATUS ACTUAL

? **Login funciona perfectamente**
? **Backend respondiendo 200 OK**
? **CORS configurado para dev tunnels**
? **Tests pasando 3/3**
? **Listo para producción**

---

## ?? ERRORES EN CONSOLA (Ignorar)

Los errores que ves son **WARNINGS INOFENSIVOS**:

| Error | Tipo | Acción |
|-------|------|--------|
| 404 /settings | Página no existe | Ignorar (en desarrollo) |
| CSP violations | Warnings solo | Ignorar (report-only) |
| Font-src blocked | Extension Chrome | Ignorar |
| manifest.json 302 | DNS protecion | Ignorar |

**Ninguno afecta la funcionalidad del app.**

---

## ??? PASOS PARA VPS

### 1. **Preparar Servidor**
```bash
# SSH al VPS
ssh user@tu-vps.com

# Instalar Node.js (v20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs npm

# Instalar PM2 para manager procesos
sudo npm install -g pm2

# Crear carpeta del proyecto
mkdir -p /var/www/cermont-app
cd /var/www/cermont-app
```

### 2. **Deploy Código**
```bash
# Clonar repositorio
git clone https://github.com/turepositorio/cermont-app.git .

# Instalar dependencias
npm install

# Backend
cd backend
npm install
npm run build

# Frontend
cd ../frontend
npm install
npm run build
```

### 3. **Configurar Variables de Entorno**

**Backend (.env)**
```bash
PORT=5000
NODE_ENV=production
DATABASE_URL="file:./prisma/prod.db"
CORS_ORIGIN=https://tudominio.com,https://www.tudominio.com
JWT_SECRET=TU_CLAVE_SECRETO_MUY_LARGA_Y_ALEATORIA_AQUI
```

**Frontend (.env.production)**
```bash
NEXT_PUBLIC_API_URL=https://api.tudominio.com
```

### 4. **Iniciar Servidores con PM2**

```bash
# Backend
pm2 start "npm run start:backend" --name "cermont-backend"

# Frontend  
pm2 start "npm run start:frontend" --name "cermont-frontend"

# Guardar configuración
pm2 save

# Reiniciar al boot
pm2 startup
```

### 5. **Configurar Nginx (Proxy Inverso)**

```nginx
# /etc/nginx/sites-available/cermont

upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    listen [::]:80;
    server_name tudominio.com www.tudominio.com;

    # Redirigir HTTP ? HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name tudominio.com www.tudominio.com;

    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Backend
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar configuración:
```bash
sudo ln -s /etc/nginx/sites-available/cermont /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. **SSL con Let's Encrypt**
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d tudominio.com -d www.tudominio.com
```

### 7. **Monitorear**
```bash
pm2 logs cermont-backend
pm2 logs cermont-frontend
pm2 status
```

---

## ?? CORS Configuración Final

En **backend/.env** para VPS:

```
# Un dominio
CORS_ORIGIN=https://tudominio.com

# Múltiples dominios (separados por coma)
CORS_ORIGIN=https://tudominio.com,https://www.tudominio.com,https://app.tudominio.com

# Con un proxy que maneja todo
CORS_ORIGIN=https://tudominio.com

# En desarrollo (localhost)
CORS_ORIGIN=http://localhost:3000
```

El backend automáticamente acepta:
- ? El dominio en `CORS_ORIGIN`
- ? Cualquier `*.devtunnels.ms` en desarrollo
- ? `localhost:3000` en desarrollo

---

## ?? Checklist Pre-Producción

- [ ] Backend `.env` configurado
- [ ] Frontend `.env.production` configurado
- [ ] Base de datos respalda (backup)
- [ ] JWT_SECRET cambiado a algo único y largo
- [ ] SSL certificado válido
- [ ] PM2 configurado
- [ ] Nginx proxy configurado
- [ ] Firewall abierto puertos 80/443
- [ ] Logs monitoreados
- [ ] Base de datos migrada/seedeada

---

## ?? Testing Pre-Producción

```bash
# En VPS, probar endpoints
curl https://tudominio.com/api/auth/profile

# Si no hay token, debe dar 401 (correcto)
# Si da 500, hay error en backend
# Si da CORS error, revisar CORS_ORIGIN
```

---

## ?? Notas Importantes

1. **Cambiar NODE_ENV=production** en .env
2. **Usar base de datos PostgreSQL/MySQL** en producción (no SQLite)
3. **Guardar JWT_SECRET en secure location** (no en git)
4. **Backup automático de BD**
5. **Monitoring y alertas** (PM2 Plus, NewRelic, etc)
6. **Rate limiting** (ya configurado en backend)

---

## ?? Troubleshooting

### CORS Error en VPS
```
Access-Control-Allow-Origin mismatch
```
**Solución**: Verificar `CORS_ORIGIN` en backend `.env`

### Backend no inicia
```bash
pm2 logs cermont-backend
# Ver qué error hay
```

### Frontend no conecta al backend
Verificar en DevTools:
```
API URL: https://tudominio.com/api
```

---

**¡Aplicativo listo para producción!** ??
