#!/bin/bash
# ================================================
# Cermont - Script de Deploy para VPS
# ================================================
# Uso: ./scripts/deploy.sh [staging|production]
#
# Requisitos en el servidor:
# - Docker y Docker Compose instalados
# - Acceso SSH configurado
# - Dominio apuntando al servidor

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
ENVIRONMENT=${1:-production}
REMOTE_USER=${DEPLOY_USER:-root}
REMOTE_HOST=${DEPLOY_HOST:-"tu-servidor.contabo.com"}
REMOTE_DIR=${DEPLOY_DIR:-"/opt/cermont"}

echo -e "${GREEN}🚀 Iniciando deploy a ${ENVIRONMENT}...${NC}"

# Verificar variables requeridas
if [ -z "$DEPLOY_HOST" ]; then
    echo -e "${RED}❌ Error: DEPLOY_HOST no está configurado${NC}"
    echo "Uso: DEPLOY_HOST=tu-servidor.com ./scripts/deploy.sh"
    exit 1
fi

# Build de imágenes Docker
echo -e "${YELLOW}📦 Construyendo imágenes Docker...${NC}"
docker compose -f docker-compose.prod.yml build

# Tag de imágenes
TAG=$(git rev-parse --short HEAD)
echo -e "${YELLOW}🏷️  Tag: ${TAG}${NC}"

# Copiar archivos necesarios al servidor
echo -e "${YELLOW}📤 Copiando archivos al servidor...${NC}"
ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_DIR}"

rsync -avz --progress \
    docker-compose.prod.yml \
    .env.production \
    ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

# Renombrar .env en servidor
ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && mv .env.production .env"

# Exportar imágenes y copiar (alternativa a registry)
echo -e "${YELLOW}📤 Exportando imágenes Docker...${NC}"
docker save cermont-api:latest | gzip | ssh ${REMOTE_USER}@${REMOTE_HOST} "gunzip | docker load"
docker save cermont-web:latest | gzip | ssh ${REMOTE_USER}@${REMOTE_HOST} "gunzip | docker load"

# Ejecutar deploy en servidor
echo -e "${YELLOW}🔄 Ejecutando deploy en servidor...${NC}"
ssh ${REMOTE_USER}@${REMOTE_HOST} << EOF
    cd ${REMOTE_DIR}
    
    # Detener servicios existentes
    docker compose -f docker-compose.prod.yml down --remove-orphans || true
    
    # Iniciar nuevos servicios
    docker compose -f docker-compose.prod.yml up -d
    
    # Esperar a que los servicios estén listos
    echo "Esperando a que los servicios inicien..."
    sleep 30
    
    # Verificar estado
    docker compose -f docker-compose.prod.yml ps
    
    # Health check
    curl -s http://localhost:3001/api/health || echo "API health check pendiente"
EOF

echo -e "${GREEN}✅ Deploy completado exitosamente!${NC}"
echo -e "${GREEN}🌐 API: https://api.${DOMAIN}${NC}"
echo -e "${GREEN}🌐 Dashboard: https://dashboard.${DOMAIN}${NC}"
