# Auth Module

## Description
Authentication and authorization module with JWT tokens, refresh token rotation, and audit logging.

## Features
- JWT access tokens
- Secure refresh token rotation
- Password hashing (bcrypt)
- Login/Register/Logout
- Google OAuth integration
- Audit logging

## Structure
```
auth/
├── application/      # Use cases
├── domain/          # Entities, value objects
├── infrastructure/  # JWT strategies
├── guards/          # Auth guards
├── decorators/      # @CurrentUser, @Public
└── auth.module.ts
```

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| POST | `/auth/refresh` | Refresh tokens |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Current user info |

## Security
- Password rounds: 12 (configurable)
- Access token: 15m
- Refresh token: 7 days
