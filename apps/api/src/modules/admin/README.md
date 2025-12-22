# Admin Module

## Description
Module for administrative operations including user management, system configuration, and RBAC (Role-Based Access Control).

## Structure
```
admin/
├── application/      # Use cases and DTOs
├── domain/          # Business logic and entities
├── infrastructure/  # Persistence and external services
├── admin.module.ts  # NestJS module
└── README.md
```

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/users` | List all users |
| POST | `/admin/users` | Create user |
| PATCH | `/admin/users/:id` | Update user |
| DELETE | `/admin/users/:id` | Delete user |

## Dependencies
- `PrismaService`
- `AuthModule`
