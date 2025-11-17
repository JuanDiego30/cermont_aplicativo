#!/bin/bash

# ??????????????????????????????????????????????????????
# ?  CERMONT ATG - Script de Desarrollo               ?
# ?  Inicia Backend y Frontend en paralelo            ?
# ??????????????????????????????????????????????????????

set -e

# Colores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Funciones
log_info() {
    echo -e "${CYAN}?${NC} $1"
}

log_success() {
    echo -e "${GREEN}?${NC} $1"
}

log_error() {
    echo -e "${RED}?${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}?${NC} $1"
}

# Banner
echo ""
echo -e "${CYAN}??????????????????????????????????????????????????????${NC}"
echo -e "${CYAN}?  ?? CERMONT ATG - DESARROLLO LOCAL                ?${NC}"
echo -e "${CYAN}??????????????????????????????????????????????????????${NC}"
echo ""

# Verificar Node.js
log_info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    log_error "Node.js no está instalado"
    exit 1
fi
NODE_VERSION=$(node -v)
log_success "Node.js $NODE_VERSION encontrado"
echo ""

# Verificar archivos .env
log_info "Verificando configuración..."
if [ ! -f "backend/.env" ]; then
    log_warning "backend/.env no existe"
    log_info "Creando desde .env.example..."
    cp backend/.env.example backend/.env
fi

if [ ! -f "frontend/.env.local" ]; then
    log_warning "frontend/.env.local no existe"
    log_info "Creando plantilla..."
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_APP_NAME=CERMONT ATG
EOF
fi
log_success "Configuración lista"
echo ""

# URLs
log_info "URLs disponibles:"
echo "   ?? Frontend:  http://localhost:3000"
echo "   ?? Backend:   http://localhost:5000"
echo "   ?? API:       http://localhost:5000/api"
echo ""

# Inicio
log_info "Iniciando servicios..."
echo ""

# Backend
log_info "Backend (puerto 5000)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Esperar a que backend esté listo
sleep 2

# Frontend
log_info "Frontend (puerto 3000)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

log_success "Servicios iniciados"
echo ""
log_info "PIDs: Backend=$BACKEND_PID, Frontend=$FRONTEND_PID"
log_warning "Presiona Ctrl+C para detener"
echo ""

# Manejo de signals
trap "
    echo ''
    log_info 'Deteniendo servicios...'
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    log_success 'Servicios detenidos'
    exit 0
" SIGINT SIGTERM

# Esperar
wait
