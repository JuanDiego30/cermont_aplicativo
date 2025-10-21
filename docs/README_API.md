# README – API Reference

**Version:** 1.0.0  
**Date:** October 20, 2025  
**Base URL:** `https://your-domain.com/v1`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Health Endpoints](#health-endpoints)
3. [Users](#users)
4. [Orders (Órdenes)](#orders-órdenes)
5. [Failures (Fallas)](#failures-fallas)
6. [Equipment](#equipment)
7. [Evidence](#evidence)
8. [Error Handling](#error-handling)

---

## Authentication

All endpoints (except `/health`) require a valid JWT token in the `Authorization` header.

```
Authorization: Bearer <JWT_TOKEN>
```

### JWT Claims

```json
{
  "sub": "user-id",
  "rol": "admin|coordinador|tecnico|cliente|gerente",
  "iat": 1697776000,
  "exp": 1697862400
}
```

### Roles

- **admin**: Full access
- **coordinador**: Order management
- **tecnico**: Technical work, evidence submission
- **cliente**: View own orders & evidence
- **gerente**: Reports & analytics

---

## Health Endpoints

### GET /health

**Description:** Basic health check

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-20T15:30:00.000Z"
}
```

### GET /health/version

**Description:** Version info with commit hash

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "commit": "abc123d",
  "date": "2025-10-20T15:30:00.000Z"
}
```

---

## Users

### POST /users/register

**Description:** Register new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "nombre": "John Doe",
  "rol": "cliente"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "nombre": "John Doe",
    "rol": "cliente",
    "activo": true,
    "created_at": "2025-10-20T15:30:00Z"
  }
}
```

### POST /users/login

**Description:** Authenticate user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "rol": "cliente"
    }
  }
}
```

### GET /users/:id

**Description:** Get user profile

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "nombre": "John Doe",
    "rol": "cliente",
    "activo": true
  }
}
```

### PATCH /users/:id

**Description:** Update user (admin/coordinador only for role changes)

**Request:**
```json
{
  "nombre": "Jane Doe",
  "email": "jane@example.com",
  "rol": "tecnico"
}
```

**Response (200):**
```json
{
  "data": { ...updated user... },
  "message": "Usuario actualizado exitosamente"
}
```

---

## Orders (Órdenes)

### GET /orders

**Description:** List orders with filters

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 10)
- `estado` (string): Filter by status
- `prioridad` (string): Filter by priority
- `cliente_id` (uuid): Filter by client
- `search` (string): Search by title/description

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "numero_orden": "ORD-001",
      "cliente_id": "uuid",
      "tipo_orden": "Mantenimiento Preventivo",
      "estado": "pendiente",
      "prioridad": "normal",
      "titulo": "Mantenimiento CCTV Torre 1",
      "descripcion": "Revisión periódica",
      "created_at": "2025-10-20T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### POST /orders

**Description:** Create new order

**Request:**
```json
{
  "cliente_id": "uuid",
  "tipo_orden": "Mantenimiento Correctivo",
  "tipo_equipo": "CCTV",
  "titulo": "Reparación CCTV",
  "descripcion": "Cámara no funciona",
  "prioridad": "alta",
  "ubicacion": "Torre Central",
  "fecha_programada": "2025-10-25T09:00:00Z"
}
```

**Response (201):**
```json
{
  "data": { ...created order... },
  "message": "Orden creada exitosamente"
}
```

### GET /orders/:id

**Description:** Get order details

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "numero_orden": "ORD-001",
    "cliente_id": "uuid",
    "estado": "en_progreso",
    "evidencias": [ ...array of evidence items... ],
    "historial": [ ...activity log... ]
  }
}
```

### PATCH /orders/:id

**Description:** Update order

**Request:**
```json
{
  "estado": "completada",
  "notas": "Completed successfully"
}
```

### PATCH /orders/:id/status

**Description:** Change order status

**Request:**
```json
{
  "estado": "completada",
  "notas": "All tasks completed"
}
```

### DELETE /orders/:id

**Description:** Delete order (admin only)

---

## Failures (Fallas)

### GET /failures

**Description:** List failures

**Query Parameters:**
- `tipo_equipo` (string): Filter by equipment type
- `severidad` (string): Filter by severity (baja/media/alta)
- `activo` (boolean): Filter by status
- `search` (string): Search term

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "codigo": "CCTV-001",
      "nombre": "Cámara sin señal",
      "tipo_equipo": "CCTV",
      "severidad": "media",
      "descripcion": "La cámara no transmite video",
      "causas_probables": "Desconexión de cable",
      "acciones_sugeridas": "Revisar conexiones",
      "activo": true
    }
  ]
}
```

### POST /failures

**Description:** Create failure (admin/coordinador only)

**Request:**
```json
{
  "codigo": "CCTV-002",
  "nombre": "Enfoque perdido",
  "tipo_equipo": "CCTV",
  "severidad": "baja",
  "descripcion": "La cámara pierde el enfoque",
  "causas_probables": "Suciedad en lente",
  "acciones_sugeridas": "Limpiar lente"
}
```

### PATCH /failures/:id

**Description:** Update failure

### DELETE /failures/:id

**Description:** Deactivate failure

---

## Equipment

### GET /equipment

**Description:** List equipment

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "cliente_id": "uuid",
      "tipo": "CCTV",
      "modelo": "Hikvision DS-2CD2143G0-I",
      "serial": "SN123456",
      "ubicacion": "Torre 1",
      "estado": "operativo",
      "fecha_instalacion": "2024-01-15"
    }
  ]
}
```

---

## Evidence

### POST /evidence

**Description:** Upload evidence file

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `orden_id` (uuid): Related order
- `tipo` (string): photo|video|document
- `titulo` (string): Evidence title
- `descripcion` (string): Description
- `file` (file): Binary file

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "orden_id": "uuid",
    "tipo": "photo",
    "titulo": "Foto del daño",
    "url": "/data/evidence/file123.jpg",
    "created_at": "2025-10-20T15:30:00Z"
  }
}
```

### GET /evidence/:id

**Description:** Get evidence details

### DELETE /evidence/:id

**Description:** Delete evidence

---

## Error Handling

### Error Response Format

```json
{
  "error": "User not found",
  "code": "NOT_FOUND",
  "details": null
}
```

### HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limited
- `500 Internal Server Error` - Server error

### Rate Limiting

- 100 requests per 15 minutes per IP
- Returns `X-RateLimit-*` headers

---

## Example cURL Commands

```bash
# Health check
curl https://your-domain.com/v1/health

# Version info
curl https://your-domain.com/v1/health/version

# Login
curl -X POST https://your-domain.com/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'

# List orders with token
curl https://your-domain.com/v1/orders \
  -H "Authorization: Bearer $TOKEN"

# Create order
curl -X POST https://your-domain.com/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cliente_id":"...","titulo":"..."}'
```

---

## See Also

- [Frontend Documentation](./README_FRONTEND.md)
- [Deployment Guide](./README_DEPLOY.md)
- [Monitoring Guide](./README_MONITORING.md)
