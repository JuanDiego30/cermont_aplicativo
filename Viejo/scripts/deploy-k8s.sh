#!/bin/bash
# ============================================================
# CERMONT - Script de Despliegue en Kubernetes
# ============================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
NAMESPACE="${NAMESPACE:-cermont}"
REGISTRY="${REGISTRY:-ghcr.io/cermont}"
ENVIRONMENT="${ENVIRONMENT:-staging}"
TIMEOUT="${TIMEOUT:-600}"

# Funciones de utilidad
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

# Verificar dependencias
check_dependencies() {
    log_info "Verificando dependencias..."
    
    local deps=("kubectl" "docker" "kustomize")
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "$dep no está instalado"
            exit 1
        fi
    done
    
    log_success "Todas las dependencias están instaladas"
}

# Verificar conexión a cluster
check_cluster() {
    log_info "Verificando conexión al cluster..."
    
    if ! kubectl cluster-info &> /dev/null; then
        log_error "No se puede conectar al cluster de Kubernetes"
        exit 1
    fi
    
    local context=$(kubectl config current-context)
    log_success "Conectado al cluster: $context"
}

# Crear namespace si no existe
create_namespace() {
    log_info "Verificando namespace $NAMESPACE..."
    
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_info "Creando namespace $NAMESPACE..."
        kubectl create namespace "$NAMESPACE"
        log_success "Namespace creado"
    else
        log_info "Namespace $NAMESPACE ya existe"
    fi
}

# Construir imágenes Docker
build_images() {
    log_info "Construyendo imágenes Docker..."
    
    local version="${VERSION:-$(date +%Y%m%d)-$(git rev-parse --short HEAD)}"
    
    # Build API
    log_info "Construyendo imagen API..."
    docker build -t "$REGISTRY/api:$version" -f backend/Dockerfile.prod backend/
    docker tag "$REGISTRY/api:$version" "$REGISTRY/api:latest"
    
    # Build Web
    log_info "Construyendo imagen Web..."
    docker build -t "$REGISTRY/web:$version" -f frontend/Dockerfile frontend/
    docker tag "$REGISTRY/web:$version" "$REGISTRY/web:latest"
    
    log_success "Imágenes construidas: $version"
    
    echo "$version"
}

# Push imágenes a registry
push_images() {
    local version="$1"
    
    log_info "Subiendo imágenes al registry..."
    
    docker push "$REGISTRY/api:$version"
    docker push "$REGISTRY/api:latest"
    docker push "$REGISTRY/web:$version"
    docker push "$REGISTRY/web:latest"
    
    log_success "Imágenes subidas al registry"
}

# Aplicar configuraciones de Kubernetes
apply_kubernetes() {
    local version="$1"
    
    log_info "Aplicando configuraciones de Kubernetes..."
    
    cd k8s
    
    # Actualizar tags de imágenes
    kustomize edit set image api="$REGISTRY/api:$version"
    kustomize edit set image web="$REGISTRY/web:$version"
    
    # Aplicar con kustomize
    kubectl apply -k . -n "$NAMESPACE"
    
    cd ..
    
    log_success "Configuraciones aplicadas"
}

# Esperar a que los deployments estén listos
wait_for_rollout() {
    log_info "Esperando a que los deployments estén listos..."
    
    kubectl rollout status deployment/api -n "$NAMESPACE" --timeout="${TIMEOUT}s"
    kubectl rollout status deployment/web -n "$NAMESPACE" --timeout="${TIMEOUT}s"
    
    log_success "Todos los deployments están listos"
}

# Ejecutar health checks
run_health_checks() {
    log_info "Ejecutando health checks..."
    
    local api_pod=$(kubectl get pods -n "$NAMESPACE" -l app=api -o jsonpath='{.items[0].metadata.name}')
    
    # Check API health
    local api_health=$(kubectl exec -n "$NAMESPACE" "$api_pod" -- curl -s http://localhost:4000/health 2>/dev/null || echo "failed")
    
    if [[ "$api_health" == *"ok"* ]]; then
        log_success "API health check: OK"
    else
        log_warning "API health check: No responde correctamente"
    fi
    
    # Mostrar estado de pods
    log_info "Estado actual de pods:"
    kubectl get pods -n "$NAMESPACE" -o wide
}

# Rollback en caso de fallo
rollback() {
    log_warning "Iniciando rollback..."
    
    kubectl rollout undo deployment/api -n "$NAMESPACE"
    kubectl rollout undo deployment/web -n "$NAMESPACE"
    
    kubectl rollout status deployment/api -n "$NAMESPACE" --timeout="${TIMEOUT}s"
    kubectl rollout status deployment/web -n "$NAMESPACE" --timeout="${TIMEOUT}s"
    
    log_success "Rollback completado"
}

# Mostrar información del despliegue
show_deployment_info() {
    log_info "=== Información del Despliegue ==="
    
    echo ""
    echo "Namespace: $NAMESPACE"
    echo "Environment: $ENVIRONMENT"
    echo "Registry: $REGISTRY"
    echo ""
    
    log_info "Pods:"
    kubectl get pods -n "$NAMESPACE"
    
    echo ""
    log_info "Services:"
    kubectl get services -n "$NAMESPACE"
    
    echo ""
    log_info "Ingress:"
    kubectl get ingress -n "$NAMESPACE"
    
    echo ""
    log_info "HPA:"
    kubectl get hpa -n "$NAMESPACE"
}

# Limpiar recursos
cleanup() {
    log_info "Limpiando recursos..."
    
    read -p "¿Estás seguro de eliminar todos los recursos en $NAMESPACE? (y/N) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl delete namespace "$NAMESPACE"
        log_success "Recursos eliminados"
    else
        log_info "Operación cancelada"
    fi
}

# Mostrar logs
show_logs() {
    local component="${1:-api}"
    
    log_info "Mostrando logs de $component..."
    kubectl logs -f deployment/"$component" -n "$NAMESPACE" --tail=100
}

# Función principal
main() {
    case "${1:-deploy}" in
        deploy)
            check_dependencies
            check_cluster
            create_namespace
            
            local version=$(build_images)
            push_images "$version"
            apply_kubernetes "$version"
            wait_for_rollout
            run_health_checks
            show_deployment_info
            
            log_success "🚀 Despliegue completado exitosamente!"
            ;;
        
        apply)
            check_dependencies
            check_cluster
            create_namespace
            apply_kubernetes "${VERSION:-latest}"
            wait_for_rollout
            run_health_checks
            ;;
        
        rollback)
            check_dependencies
            check_cluster
            rollback
            ;;
        
        status)
            check_cluster
            show_deployment_info
            ;;
        
        logs)
            check_cluster
            show_logs "$2"
            ;;
        
        health)
            check_cluster
            run_health_checks
            ;;
        
        cleanup)
            check_cluster
            cleanup
            ;;
        
        *)
            echo "Uso: $0 {deploy|apply|rollback|status|logs|health|cleanup}"
            echo ""
            echo "Comandos:"
            echo "  deploy   - Build, push y deploy completo"
            echo "  apply    - Solo aplicar manifiestos (requiere VERSION)"
            echo "  rollback - Rollback al deployment anterior"
            echo "  status   - Mostrar estado del despliegue"
            echo "  logs     - Mostrar logs (ej: $0 logs api)"
            echo "  health   - Ejecutar health checks"
            echo "  cleanup  - Eliminar todos los recursos"
            echo ""
            echo "Variables de entorno:"
            echo "  NAMESPACE    - Namespace de Kubernetes (default: cermont)"
            echo "  REGISTRY     - Registry de Docker (default: ghcr.io/cermont)"
            echo "  ENVIRONMENT  - Ambiente (default: staging)"
            echo "  VERSION      - Versión de imagen (para apply)"
            echo "  TIMEOUT      - Timeout en segundos (default: 600)"
            exit 1
            ;;
    esac
}

main "$@"
