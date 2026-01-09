#!/bin/bash

# ===========================================
# CERMONT - Script de Despliegue para VPS
# ===========================================
# Uso: ./deploy.sh [comando]
# Comandos: setup, start, stop, restart, logs, backup

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
check_directory() {
    if [ ! -f "docker-compose.prod.yml" ]; then
        log_error "No se encontró docker-compose.prod.yml"
        log_error "Asegúrate de ejecutar este script desde el directorio raíz del proyecto"
        exit 1
    fi
}

# Verificar que Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado"
        log_info "Instala Docker con: curl -fsSL https://get.docker.com | sh"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose no está instalado"
        exit 1
    fi
    
    log_success "Docker está instalado"
}

# Verificar archivo .env
check_env() {
    if [ ! -f ".env" ]; then
        log_warning "No se encontró archivo .env"
        log_info "Copiando .env.example a .env..."
        cp .env.example .env
        log_warning "¡IMPORTANTE! Edita el archivo .env con tus valores antes de continuar"
        log_info "Especialmente: DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET"
        exit 1
    fi
    
    # Verificar que las variables críticas no estén vacías
    source .env
    
    if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" = "tu_contraseña_segura_aqui" ]; then
        log_error "DB_PASSWORD no está configurado correctamente en .env"
        exit 1
    fi
    
    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "genera_una_clave_secreta_de_al_menos_32_caracteres" ]; then
        log_error "JWT_SECRET no está configurado correctamente en .env"
        exit 1
    fi
    
    log_success "Archivo .env configurado"
}

# Generar claves aleatorias
generate_secrets() {
    log_info "Generando claves secretas..."
    
    JWT_SECRET=$(openssl rand -hex 32)
    JWT_REFRESH_SECRET=$(openssl rand -hex 32)
    DB_PASSWORD=$(openssl rand -hex 16)
    
    echo ""
    echo "=== CLAVES GENERADAS ==="
    echo "JWT_SECRET=$JWT_SECRET"
    echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
    echo "DB_PASSWORD=$DB_PASSWORD"
    echo "========================"
    echo ""
    log_warning "Copia estas claves a tu archivo .env"
}

# Setup inicial
setup() {
    log_info "Iniciando configuración inicial..."
    
    check_docker
    check_env
    
    # Crear directorios necesarios
    mkdir -p nginx/ssl
    
    # Construir imágenes
    log_info "Construyendo imágenes Docker..."
    docker compose -f docker-compose.prod.yml build
    
    # Iniciar servicios
    log_info "Iniciando servicios..."
    docker compose -f docker-compose.prod.yml up -d
    
    # Esperar a que la base de datos esté lista
    log_info "Esperando a que la base de datos esté lista..."
    sleep 10
    
    # Ejecutar migraciones de Prisma
    log_info "Ejecutando migraciones de base de datos..."
    docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
    
    log_success "¡Configuración completada!"
    log_info "La aplicación está disponible en http://localhost (o tu IP del VPS)"
}

# Iniciar servicios
start() {
    check_directory
    log_info "Iniciando servicios..."
    docker compose -f docker-compose.prod.yml up -d
    log_success "Servicios iniciados"
}

# Detener servicios
stop() {
    check_directory
    log_info "Deteniendo servicios..."
    docker compose -f docker-compose.prod.yml down
    log_success "Servicios detenidos"
}

# Reiniciar servicios
restart() {
    check_directory
    log_info "Reiniciando servicios..."
    docker compose -f docker-compose.prod.yml restart
    log_success "Servicios reiniciados"
}

# Ver logs
logs() {
    check_directory
    SERVICE=${2:-""}
    if [ -z "$SERVICE" ]; then
        docker compose -f docker-compose.prod.yml logs -f
    else
        docker compose -f docker-compose.prod.yml logs -f "$SERVICE"
    fi
}

# Backup de base de datos
backup() {
    check_directory
    log_info "Creando backup de la base de datos..."
    
    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/cermont_backup_$TIMESTAMP.sql"
    
    docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U cermont_user cermont > "$BACKUP_FILE"
    
    # Comprimir
    gzip "$BACKUP_FILE"
    
    log_success "Backup creado: ${BACKUP_FILE}.gz"
}

# Restaurar base de datos
restore() {
    check_directory
    BACKUP_FILE=$2
    
    if [ -z "$BACKUP_FILE" ]; then
        log_error "Especifica el archivo de backup"
        log_info "Uso: ./deploy.sh restore ./backups/cermont_backup_xxx.sql.gz"
        exit 1
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "Archivo de backup no encontrado: $BACKUP_FILE"
        exit 1
    fi
    
    log_warning "¡ATENCIÓN! Esto sobrescribirá todos los datos actuales"
    read -p "¿Estás seguro? (y/n): " confirm
    
    if [ "$confirm" = "y" ]; then
        log_info "Restaurando backup..."
        
        if [[ "$BACKUP_FILE" == *.gz ]]; then
            gunzip -c "$BACKUP_FILE" | docker compose -f docker-compose.prod.yml exec -T postgres psql -U cermont_user cermont
        else
            cat "$BACKUP_FILE" | docker compose -f docker-compose.prod.yml exec -T postgres psql -U cermont_user cermont
        fi
        
        log_success "Backup restaurado"
    else
        log_info "Operación cancelada"
    fi
}

# Status de servicios
status() {
    check_directory
    log_info "Estado de los servicios:"
    docker compose -f docker-compose.prod.yml ps
}

# Actualizar aplicación
update() {
    check_directory
    log_info "Actualizando aplicación..."
    
    # Pull cambios
    git pull origin main
    
    # Reconstruir imágenes
    docker compose -f docker-compose.prod.yml build
    
    # Reiniciar servicios
    docker compose -f docker-compose.prod.yml up -d
    
    # Ejecutar migraciones
    log_info "Ejecutando migraciones..."
    docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
    
    log_success "Actualización completada"
}

# Mostrar ayuda
show_help() {
    echo ""
    echo "CERMONT - Script de Despliegue"
    echo ""
    echo "Uso: ./deploy.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  setup       - Configuración inicial (primera vez)"
    echo "  start       - Iniciar servicios"
    echo "  stop        - Detener servicios"
    echo "  restart     - Reiniciar servicios"
    echo "  status      - Ver estado de servicios"
    echo "  logs [srv]  - Ver logs (opcional: especificar servicio)"
    echo "  backup      - Crear backup de la base de datos"
    echo "  restore     - Restaurar backup"
    echo "  update      - Actualizar aplicación"
    echo "  secrets     - Generar claves secretas aleatorias"
    echo "  help        - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./deploy.sh setup"
    echo "  ./deploy.sh logs api"
    echo "  ./deploy.sh backup"
    echo ""
}

# Main
case "$1" in
    setup)
        setup
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs "$@"
        ;;
    backup)
        backup
        ;;
    restore)
        restore "$@"
        ;;
    update)
        update
        ;;
    secrets)
        generate_secrets
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Comando no reconocido: $1"
        show_help
        exit 1
        ;;
esac
