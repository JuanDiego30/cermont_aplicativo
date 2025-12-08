## Pre-Deployment

- [ ] Todos los tests pasando
- [ ] Code review completado
- [ ] Variables de entorno configuradas
- [ ] Backup de BD realizado
- [ ] Certificados SSL validados
- [ ] DNS apuntando correctamente
- [ ] Capacidad de storage suficiente

## Deployment Steps

```bash
# 1. SSH al VPS
ssh root@your-vps-ip

# 2. Clonar repositorio
git clone https://github.com/JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo

# 3. Crear archivo .env
cat > .env.production << EOF
DB_USER=cermont
DB_PASSWORD=your-secure-password
JWT_SECRET=your-secret-key-min-32-chars
FRONTEND_URL=https://app.cermont.com
API_URL=https://api.cermont.com
EOF

# 4. Iniciar servicios
docker-compose -f docker-compose.prod.yml up -d

# 5. Ejecutar migraciones
docker-compose -f docker-compose.prod.yml exec api npm run db:migrate

# 6. Verificar logs
docker-compose -f docker-compose.prod.yml logs -f api web
```

## Post-Deployment

- [ ] Verificar `/health` endpoints
- [ ] Probar login
- [ ] Crear orden de prueba
- [ ] Verificar uploads
- [ ] Revisar logs de errores
- [ ] Monitoreo activado
- [ ] Backups automáticos configurados

## Rollback Plan

```bash
# Si hay problemas
docker-compose -f docker-compose.prod.yml down
git checkout <previous-commit>
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoreo

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Ver uso de recursos
docker stats

# Revisar estado de containers
docker-compose -f docker-compose.prod.yml ps
```
