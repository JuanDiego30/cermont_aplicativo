.PHONY: help build up down logs shell test lint format clean migrate

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[0;33m
NC=\033[0m # No Color

help:
	@echo "$(GREEN)Cermont Application Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@echo "  make dev              Start development environment"
	@echo "  make build            Build Docker images"
	@echo "  make up               Start all containers"
	@echo "  make down             Stop all containers"
	@echo "  make logs             View container logs"
	@echo ""
	@echo "$(YELLOW)Testing:$(NC)"
	@echo "  make test             Run all tests"
	@echo "  make test-backend     Run backend tests only"
	@echo "  make test-frontend    Run frontend tests only"
	@echo "  make lint             Run linters"
	@echo "  make format           Format code"
	@echo ""
	@echo "$(YELLOW)Database:$(NC)"
	@echo "  make migrate          Run database migrations"
	@echo "  make seed             Seed database with test data"
	@echo "  make db-reset         Reset database completely"
	@echo ""
	@echo "$(YELLOW)Cleanup:$(NC)"
	@echo "  make clean            Remove containers and volumes"
	@echo "  make clean-all        Remove everything including images"

env:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN).env file created from .env.example$(NC)"; \
	else \
		echo "$(YELLOW).env file already exists$(NC)"; \
	fi

dev: env
	@echo "$(GREEN)Starting development environment...$(NC)"
	docker-compose up -d postgres api web
	@echo "$(GREEN)✓ Backend: http://localhost:3000$(NC)"
	@echo "$(GREEN)✓ Frontend: http://localhost:4200$(NC)"

up: build
	@echo "$(GREEN)Starting all services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ All services started$(NC)"

down:
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ All services stopped$(NC)"

build: env
	@echo "$(GREEN)Building Docker images...$(NC)"
	docker-compose build --no-cache
	@echo "$(GREEN)✓ Images built successfully$(NC)"

build-prod: env
	@echo "$(GREEN)Building production images...$(NC)"
	docker build -f apps/api/Dockerfile -t cermont-api:prod apps/api
	docker build -f apps/web/Dockerfile -t cermont-web:prod apps/web
	@echo "$(GREEN)✓ Production images built$(NC)"

logs:
	docker-compose logs -f

logs-api:
	docker-compose logs -f api

logs-web:
	docker-compose logs -f web

logs-db:
	docker-compose logs -f postgres

test: test-backend test-frontend
	@echo "$(GREEN)✓ All tests passed$(NC)"

test-backend:
	@echo "$(GREEN)Running backend tests...$(NC)"
	cd apps/api && npm test -- --coverage

test-frontend:
	@echo "$(GREEN)Running frontend tests...$(NC)"
	cd apps/web && npm test -- --watch=false --code-coverage

lint: lint-backend lint-frontend
	@echo "$(GREEN)✓ Linting complete$(NC)"

lint-backend:
	@echo "$(GREEN)Linting backend...$(NC)"
	cd apps/api && npm run lint

lint-frontend:
	@echo "$(GREEN)Linting frontend...$(NC)"
	cd apps/web && npm run lint

format:
	@echo "$(GREEN)Formatting code...$(NC)"
	cd apps/api && npm run format
	cd apps/web && npm run format
	@echo "$(GREEN)✓ Code formatted$(NC)"

migrate:
	@echo "$(GREEN)Running database migrations...$(NC)"
	docker-compose exec -T api npm run migrate
	@echo "$(GREEN)✓ Migrations complete$(NC)"

seed:
	@echo "$(GREEN)Seeding database...$(NC)"
	docker-compose exec -T api npm run seed
	@echo "$(GREEN)✓ Database seeded$(NC)"

db-reset: down env
	@echo "$(YELLOW)Resetting database...$(NC)"
	docker volume rm cermont_aplicativo_postgres_data 2>/dev/null || true
	docker-compose up -d postgres
	@sleep 10
	docker-compose exec -T api npm run migrate
	@echo "$(GREEN)✓ Database reset complete$(NC)"

shell-api:
	docker-compose exec api sh

shell-web:
	docker-compose exec web sh

shell-db:
	docker-compose exec postgres psql -U postgres -d cermont

clean:
	@echo "$(YELLOW)Cleaning containers and volumes...$(NC)"
	docker-compose down -v
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

clean-all: clean
	@echo "$(YELLOW)Removing all images...$(NC)"
	docker rmi cermont-api cermont-web 2>/dev/null || true
	docker image prune -f
	@echo "$(GREEN)✓ Full cleanup complete$(NC)"

install:
	@echo "$(GREEN)Installing dependencies...$(NC)"
	cd apps/api && npm install
	cd apps/web && npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

version:
	@echo "$(GREEN)Cermont Application Versions:$(NC)"
	@echo "Docker: $$(docker --version)"
	@echo "Docker Compose: $$(docker-compose --version)"
	@echo "Node: $$(node --version)"
	@echo "NPM: $$(npm --version)"

.DEFAULT_GOAL := help
