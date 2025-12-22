# Archivado Module

## Description
Automatic archiving system for completed orders and historical data management.

## Features
- Monthly archiving of completed orders
- Archive file generation (ZIP)
- Historical data retrieval
- Storage optimization

## Structure
```
archivado/
├── application/      # Use cases and DTOs
├── domain/          # Business logic
├── infrastructure/  # File system operations
└── archivado.module.ts
```

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/archivado` | List archives |
| POST | `/archivado/generar` | Generate archive |
| GET | `/archivado/:id/download` | Download archive |

## Dependencies
- `PrismaService`
- `archiver` library
