# 🔐 Auth Module - Debugging Guide

## Login Flow

### 1. Frontend Request

**URL:** `POST http://localhost:4000/api/auth/login`

**Payload:**

```json
{
  "email": "admin@cermont.com",
  "password": "admin123",
  "rememberMe": true
}
```

### 2. Backend Validation (Zod)

**Schema:** `apps/api/src/modules/auth/application/dto/auth.dto.ts`

```typescript
LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional().default(false),
});
```

### 3. Token Durations

| rememberMe | Refresh Token |
| ---------- | ------------- |
| `false`    | 7 días        |
| `true`     | 30 días       |

---

## Troubleshooting

### Error: 401 Unauthorized

**Causa 1: Validación Zod fallida**

```
[AuthController] ❌ Login validation failed: rememberMe: Expected boolean
```

**Solución:** Verificar que rememberMe sea boolean (no string "true").

**Causa 2: Credenciales incorrectas**

```
[LoginUseCase] Login attempt failed: Invalid password
```

**Solución:** Verificar usuario existe y password es correcta.

---

## Testing with cURL

```bash
# Login sin rememberMe
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cermont.com","password":"admin123"}'

# Login con rememberMe
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cermont.com","password":"admin123","rememberMe":true}'
```

---

## Expected Logs

```
[AuthController] Login request received: {"email":"admin@cermont.com","password":"***","rememberMe":true}
[AuthController] ✅ Login validation passed for: admin@cermont.com | rememberMe: true
[LoginUseCase] Login attempt for: admin@cermont.com | rememberMe: true
[LoginUseCase] ✅ User xyz logged in successfully | Token expires: 30 days
```
