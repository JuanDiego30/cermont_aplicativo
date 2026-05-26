# Docker Compose Reset - Reinicia los servicios completamente
docker compose down -v --remove-orphans
docker compose up --build -d