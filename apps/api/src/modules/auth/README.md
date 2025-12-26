# 🔐 Módulo de Autenticación y Administración

## Descripción

Módulo completo de autenticación JWT con refresh tokens, gestión de usuarios, roles y permisos (RBAC), auditoría de seguridad y protección contra ataques.

## Características

### Autenticación
- ✅ Login con email/contraseña
- ✅ Registro de usuarios
- ✅ JWT access tokens (configurable, 15min por defecto)
- ✅ Refresh tokens con rotación automática
- ✅ Detección de reutilización de tokens (token theft detection)
- ✅ Rate limiting específico para login (5 intentos/minuto)
- ✅ Bloqueo automático por intentos fallidos (5 intentos = 30 min bloqueado)
- ✅ Validación de fuerza de contraseña (OWASP)
- ✅ Hash bcrypt con 12 rounds
- ✅ Auditoría completa de accesos

### Administración de Usuarios
- ✅ CRUD completo de usuarios
- ✅ Paginación y filtros avanzados
- ✅ Búsqueda por nombre/email
- ✅ Activar/desactivar usuarios
- ✅ Cambio de roles
- ✅ Reseteo de contraseña por admin
- ✅ Revocación de tokens
- ✅ Estadísticas de usuarios
- ✅ Logs de auditoría

### Seguridad
- ✅ Protección contra brute force
- ✅ Detección de robo de tokens
- ✅ Rate limiting
- ✅ Validación de datos con class-validator
- ✅ Headers de seguridad (Helmet)
- ✅ CORS configurado
- ✅ Auditoría de todas las acciones

## Endpoints

### Autenticación (`/auth`)

#### POST /auth/login
Login con credenciales.

**Request:**
```json
{
  "email": "admin@cermont.com",
  "password": "Admin@2025!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "550e8400-e29b-41d4-a716...",
  "user": {
    "id": "uuid",
    "email": "admin@cermont.com",
    "name": "Admin User",
    "role": "admin",
    "active": true
  }
}
```

#### POST /auth/register
Registro de nuevo usuario.

#### POST /auth/refresh
Renovar access token usando refresh token.

#### POST /auth/logout
Cerrar sesión y revocar tokens.

### Administración (`/admin/users`)

#### GET /admin/users
Listar usuarios con filtros y paginación.

**Query Params:**
- `role`: admin | supervisor | tecnico
- `active`: true | false
- `search`: string
- `page`: number
- `limit`: number
- `sortBy`: name | email | role | createdAt | lastLogin
- `sortOrder`: asc | desc
- `locked`: true | false

#### POST /admin/users
Crear nuevo usuario (solo admin).

#### GET /admin/users/:id
Obtener usuario por ID.

#### PATCH /admin/users/:id
Actualizar información de usuario.

#### PATCH /admin/users/:id/role
Cambiar rol de usuario.

#### PATCH /admin/users/:id/activate
Activar usuario.

#### PATCH /admin/users/:id/deactivate
Desactivar usuario.

#### POST /admin/users/:id/reset-password
Resetear contraseña de usuario.

#### POST /admin/users/:id/revoke-tokens
Revocar todos los tokens activos.

#### GET /admin/users/stats/overview
Estadísticas de usuarios.

#### GET /admin/users/stats/activity
Actividad reciente.

#### GET /admin/users/audit-logs
Logs de auditoría.

## Roles y Permisos

### Admin
- ✅ Acceso completo al sistema
- ✅ Gestión de usuarios
- ✅ Configuración del sistema
- ✅ Acceso a logs de auditoría

### Supervisor
- ✅ Supervisión de órdenes
- ✅ Revisión de trabajo
- ✅ Gestión de equipos
- ⛔ No puede gestionar usuarios

### Técnico
- ✅ Ejecución de órdenes
- ✅ Reportes de campo
- ⛔ No puede supervisar
- ⛔ No puede gestionar usuarios

## Seguridad

### Validación de Contraseña
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 carácter especial

### Rate Limiting
- Login: 5 intentos por minuto por IP
- Bloqueo: 30 minutos después de 5 intentos fallidos
- Reset automático en login exitoso

### Tokens
- Access token: 15 minutos (configurable)
- Refresh token: 7 días
- Rotación automática de refresh tokens
- Detección de reutilización

## Variables de Entorno

```env
# JWT
JWT_SECRET=tu-super-secreto-seguro-aqui
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Bcrypt
BCRYPT_ROUNDS=12

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=5
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Ejemplos de Uso

### Login
```typescript
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@cermont.com',
    password: 'Admin@2025!'
  })
});

const { token, refreshToken, user } = await response.json();
```

### Crear Usuario
```typescript
const response = await fetch('http://localhost:3000/admin/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    email: 'tecnico@cermont.com',
    password: 'Tecnico@2025!',
    name: 'Juan Técnico',
    role: 'tecnico',
    phone: '+573001234567'
  })
});
```

## Auditoría

Todas las acciones críticas se registran en la tabla `audit_logs`:

- LOGIN / LOGOUT
- USER_CREATED / USER_UPDATED / USER_DELETED
- ROLE_UPDATED
- PASSWORD_RESET_BY_ADMIN
- ACCOUNT_LOCKED / ACCOUNT_UNLOCKED
- TOKENS_REVOKED

## Mejoras Futuras

- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth 2.0 (Google, Microsoft)
- [ ] Recuperación de contraseña por email
- [ ] Historial de contraseñas
- [ ] Políticas de expiración de contraseñas
- [ ] SSO (Single Sign-On)
