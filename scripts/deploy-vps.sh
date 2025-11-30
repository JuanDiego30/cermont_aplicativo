#!/bin/bash

# ============================================================================
# CERMONT ATG - VPS DEPLOYMENT SCRIPT
# ============================================================================
# Este script automatiza el deploy completo en un VPS Ubuntu/Debian
# Requiere: Node.js 20+, PostgreSQL 15+, Nginx, PM2
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="cermont"
APP_DIR="/var/www/cermont"
REPO_URL="https://github.com/JuanDiego30/cermont_aplicativo.git"
BRANCH="main"
NODE_VERSION="20"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script debe ejecutarse como root (sudo)"
        exit 1
    fi
}

# Update system packages
update_system() {
    log_info "Actualizando sistema..."
    apt update && apt upgrade -y
    log_success "Sistema actualizado"
}

# Install Node.js
install_nodejs() {
    log_info "Instalando Node.js ${NODE_VERSION}..."
    
    if command -v node &> /dev/null; then
        local current_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ $current_version -ge $NODE_VERSION ]]; then
            log_info "Node.js ya instalado: $(node -v)"
            return
        fi
    fi
    
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
    
    # Install pnpm
    npm install -g pnpm
    
    log_success "Node.js $(node -v) y pnpm instalados"
}

# Install PostgreSQL
install_postgresql() {
    log_info "Instalando PostgreSQL..."
    
    if command -v psql &> /dev/null; then
        log_info "PostgreSQL ya instalado"
        return
    fi
    
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
    
    log_success "PostgreSQL instalado"
}

# Install Nginx
install_nginx() {
    log_info "Instalando Nginx..."
    
    if command -v nginx &> /dev/null; then
        log_info "Nginx ya instalado"
        return
    fi
    
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    
    log_success "Nginx instalado"
}

# Install PM2
install_pm2() {
    log_info "Instalando PM2..."
    
    if command -v pm2 &> /dev/null; then
        log_info "PM2 ya instalado"
        return
    fi
    
    npm install -g pm2
    pm2 startup systemd -u root --hp /root
    
    log_success "PM2 instalado"
}

# Clone or update repository
clone_repository() {
    log_info "Clonando/actualizando repositorio..."
    
    if [[ -d "$APP_DIR" ]]; then
        cd "$APP_DIR"
        git fetch origin
        git checkout $BRANCH
        git pull origin $BRANCH
        log_info "Repositorio actualizado"
    else
        mkdir -p /var/www
        git clone "$REPO_URL" "$APP_DIR"
        cd "$APP_DIR"
        git checkout $BRANCH
        log_info "Repositorio clonado"
    fi
    
    log_success "Código actualizado en $APP_DIR"
}

# Setup database
setup_database() {
    log_info "Configurando base de datos..."
    
    # Create database and user
    sudo -u postgres psql <<EOF
-- Create user if not exists
DO
\$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'cermont_user') THEN
      CREATE USER cermont_user WITH PASSWORD '${DB_PASSWORD:-CermontSecure2025!}';
   END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE cermont_db OWNER cermont_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cermont_db')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cermont_db TO cermont_user;
EOF
    
    log_success "Base de datos configurada"
}

# Setup environment files
setup_environment() {
    log_info "Configurando variables de entorno..."
    
    # Backend .env
    cat > "$APP_DIR/backend/.env" <<EOF
# ============================================================================
# BACKEND ENVIRONMENT - PRODUCTION
# ============================================================================
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL="postgresql://cermont_user:${DB_PASSWORD:-CermontSecure2025!}@localhost:5432/cermont_db"

# JWT Secrets (CAMBIAR ESTOS EN PRODUCCIÓN)
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-$(openssl rand -hex 32)}"
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=https://${DOMAIN:-localhost}
FRONTEND_URL=https://${DOMAIN:-localhost}

# File uploads
UPLOAD_DIR=/var/www/cermont/uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
EOF

    # Frontend .env.production
    cat > "$APP_DIR/frontend/.env.production" <<EOF
# ============================================================================
# FRONTEND ENVIRONMENT - PRODUCTION
# ============================================================================
NEXT_PUBLIC_API_URL=https://${DOMAIN:-localhost}/api
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_APP_NAME=Cermont ATG
EOF

    log_success "Variables de entorno configuradas"
}

# Build applications
build_applications() {
    log_info "Compilando aplicaciones..."
    
    cd "$APP_DIR"
    
    # Build backend
    log_info "Compilando backend..."
    cd backend
    pnpm install --frozen-lockfile
    pnpm run build
    
    # Run migrations
    log_info "Ejecutando migraciones..."
    npx prisma migrate deploy
    
    # Build frontend
    log_info "Compilando frontend..."
    cd ../frontend
    pnpm install --frozen-lockfile
    pnpm run build
    
    log_success "Aplicaciones compiladas"
}

# Configure Nginx
configure_nginx() {
    log_info "Configurando Nginx..."
    
    cat > /etc/nginx/sites-available/cermont <<EOF
# ============================================================================
# CERMONT ATG - NGINX CONFIGURATION
# ============================================================================

# Rate limiting
limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=general_limit:10m rate=30r/s;

# Upstream for backend
upstream cermont_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

# Upstream for frontend
upstream cermont_frontend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name ${DOMAIN:-localhost};
    
    # Redirect HTTP to HTTPS (uncomment when SSL is configured)
    # return 301 https://\$server_name\$request_uri;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # API Backend
    location /api {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://cermont_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://cermont_backend/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
    
    # Static files for uploads
    location /uploads {
        alias /var/www/cermont/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Frontend
    location / {
        limit_req zone=general_limit burst=50 nodelay;
        
        proxy_pass http://cermont_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static assets caching
    location /_next/static {
        proxy_pass http://cermont_frontend;
        proxy_cache_valid 60m;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Error pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}

# HTTPS Configuration (uncomment after SSL setup with Certbot)
# server {
#     listen 443 ssl http2;
#     server_name ${DOMAIN:-localhost};
#     
#     ssl_certificate /etc/letsencrypt/live/${DOMAIN:-localhost}/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/${DOMAIN:-localhost}/privkey.pem;
#     ssl_session_timeout 1d;
#     ssl_session_cache shared:SSL:50m;
#     ssl_session_tickets off;
#     
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
#     ssl_prefer_server_ciphers off;
#     
#     # ... (same location blocks as above)
# }
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/cermont /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload
    nginx -t
    systemctl reload nginx
    
    log_success "Nginx configurado"
}

# Start applications with PM2
start_applications() {
    log_info "Iniciando aplicaciones con PM2..."
    
    cd "$APP_DIR"
    
    # Copy PM2 ecosystem file
    cp scripts/ecosystem.config.js .
    
    # Start or restart applications
    pm2 delete all 2>/dev/null || true
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    log_success "Aplicaciones iniciadas"
}

# Setup SSL with Certbot
setup_ssl() {
    log_info "Configurando SSL con Let's Encrypt..."
    
    if [[ -z "${DOMAIN}" ]]; then
        log_warning "DOMAIN no configurado, saltando SSL"
        return
    fi
    
    apt install -y certbot python3-certbot-nginx
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "${EMAIL:-admin@$DOMAIN}"
    
    # Auto-renewal
    systemctl enable certbot.timer
    
    log_success "SSL configurado para $DOMAIN"
}

# Create uploads directory
setup_uploads() {
    log_info "Configurando directorio de uploads..."
    
    mkdir -p /var/www/cermont/uploads
    chown -R www-data:www-data /var/www/cermont/uploads
    chmod 755 /var/www/cermont/uploads
    
    log_success "Directorio de uploads configurado"
}

# Setup log rotation
setup_logrotate() {
    log_info "Configurando rotación de logs..."
    
    cat > /etc/logrotate.d/cermont <<EOF
/var/www/cermont/backend/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

    log_success "Rotación de logs configurada"
}

# Main deployment function
main() {
    echo ""
    echo "=============================================="
    echo "   CERMONT ATG - VPS DEPLOYMENT"
    echo "=============================================="
    echo ""
    
    check_root
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --domain)
                DOMAIN="$2"
                shift 2
                ;;
            --db-password)
                DB_PASSWORD="$2"
                shift 2
                ;;
            --jwt-secret)
                JWT_SECRET="$2"
                shift 2
                ;;
            --email)
                EMAIL="$2"
                shift 2
                ;;
            --skip-ssl)
                SKIP_SSL=true
                shift
                ;;
            *)
                log_error "Argumento desconocido: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    update_system
    install_nodejs
    install_postgresql
    install_nginx
    install_pm2
    clone_repository
    setup_database
    setup_environment
    setup_uploads
    build_applications
    configure_nginx
    start_applications
    setup_logrotate
    
    if [[ -z "${SKIP_SSL}" && -n "${DOMAIN}" ]]; then
        setup_ssl
    fi
    
    echo ""
    echo "=============================================="
    log_success "¡DEPLOYMENT COMPLETADO!"
    echo "=============================================="
    echo ""
    echo "URLs:"
    echo "  - Frontend: http://${DOMAIN:-localhost}"
    echo "  - API: http://${DOMAIN:-localhost}/api"
    echo "  - Health: http://${DOMAIN:-localhost}/health"
    echo ""
    echo "Comandos útiles:"
    echo "  - Ver logs: pm2 logs"
    echo "  - Estado: pm2 status"
    echo "  - Reiniciar: pm2 restart all"
    echo ""
}

# Run main function
main "$@"
