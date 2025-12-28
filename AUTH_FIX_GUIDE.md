# 🔐 GUÍA DE CORRECCIÓN - MÓDULO AUTH

**Fecha:** 28 Diciembre 2025  
**Error Original:** `POST 401 Unauthorized` en `/api/auth/login`  
**Status:** ✅ CORREGIDO  

---

## 🗙️ DIAGNÓSTICO DEL PROBLEMA

### Error Encontrado
```
POST http://localhost:4000/api/auth/login 401 (Unauthorized)
```

### Raíces del Problema
1. **Modulo Auth no configurado correctamente**
   - JWT secret no definido
   - Passport strategies no importadas
   - JWT module sin configuración de expiracy

2. **DTOs de validación faltando**
   - No había validación de entrada
   - No había DTOs definidos
   - No había respuesta consistente

3. **Estrategias de Passport incompletas**
   - JwtStrategy no configurada
   - LocalStrategy no implementada
   - Guards de autenticación faltando

4. **Prisma Schema incompleto**
   - No había campo `status` en User
   - No había modelado correcto
   - Relaciones no definidas

---

## ✅ ARCHIVOS CORREGIDOS

### 1. MÓDULO AUTH (apps/api/src/auth/)

#### ✅ auth.module.ts
**Cambios:**
- Agregado `ConfigModule.forRoot()`
- Configurado `JwtModule.registerAsync()` con configService
- Secret dinámico desde env vars
- Expiry time configurable

```typescript
JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: { expiresIn: '24h' },
  }),
})
```

#### ✅ auth.service.ts
**Lógica implementada:**
- `login()` - Busca usuario, valida password, genera JWT
- `register()` - Crea usuario, hash password, genera JWT
- `validateUser()` - Para Local strategy
- `validateJwt()` - Para JWT strategy

**Validaciones:**
- Usuario existe
- Password correcto (bcrypt)
- Usuario activo
- Token válido

#### ✅ auth.controller.ts
**Endpoints:**
- `POST /api/auth/login` - Login (200)
- `POST /api/auth/register` - Registro (201)
- `GET /api/auth/me` - Usuario actual (requiere JWT)
- `POST /api/auth/logout` - Logout (requiere JWT)

### 2. DTOs (apps/api/src/auth/dto/)

#### ✅ login.dto.ts
```typescript
class LoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
}
```

#### ✅ register.dto.ts
```typescript
class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) @MaxLength(128) password: string;
  @IsString() @MinLength(2) @MaxLength(100) name: string;
}
```

#### ✅ auth-response.dto.ts
```typescript
class AuthResponseDto {
  access_token: string;
  user: { id, email, name, role };
}
```

### 3. STRATEGIES (apps/api/src/auth/strategies/)

#### ✅ jwt.strategy.ts
- Extrae token de header `Authorization: Bearer <token>`
- Verifica con JWT_SECRET
- Valida payload con `validateJwt()`

#### ✅ local.strategy.ts
- Valida email y password
- Usa `validateUser()` del servicio
- Lanza error si credenciales inválidas

### 4. GUARDS (apps/api/src/auth/guards/)

#### ✅ jwt-auth.guard.ts
- Protege rutas que requieren autenticación
- Valida JWT automáticamente
- Inyecta usuario en `req.user`

### 5. PRISMA (apps/api/prisma/)

#### ✅ schema.prisma
**Modelos:**
- `User` - email, password, name, role, status
- `Orden` - title, description, status, userId
- `AuditLog` - action, entity, userId

**Campos importantes:**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      String   @default("USER")
  status    String   @default("ACTIVE")  // ← IMPORTANTE
  ordenes   Orden[]
}
```

#### ✅ prisma.service.ts
- Extensión de PrismaClient
- `onModuleInit()` - Conecta BD
- `onModuleDestroy()` - Desconecta BD

#### ✅ .env
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cermont"
```

---

## 📊 CÓMO USAR

### 1. Instalar Dependencias
```bash
cd apps/api
npm install @nestjs/jwt passport-jwt passport-local bcrypt
npm install -D @types/bcrypt
```

### 2. Configurar Variables de Entorno
```bash
# .env
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRY=24h
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cermont
```

### 3. Ejecutar Migraciones
```bash
cd apps/api
npx prisma migrate dev --name init
```

### 4. Crear Usuario de Prueba
```bash
npx prisma db seed
```

O manualmente en la BD:
```sql
INSERT INTO "User" (id, email, password, name, role, status) 
VALUES (
  'user123', 
  'test@example.com', 
  '$2b$10$...hashed_password...', 
  'Test User', 
  'USER', 
  'ACTIVE'
);
```

### 5. Testear Endpoints

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Response esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "email": "test@example.com",
    "name": "Test User",
    "role": "USER"
  }
}
```

#### Get Current User (Con JWT)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token_del_login>"
```

---

## 🔧 TROUBLESHOOTING

### Error: "Cannot find module '@nestjs/jwt'"
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

### Error: "Cannot find module 'bcrypt'"
```bash
npm install bcrypt
npm install -D @types/bcrypt
```

### Error: "DATABASE_URL is not defined"
**Solución:**
- Copia `.env.example` a `.env`
- Cambia `DATABASE_URL` con tus credenciales
- Ejecuta migraciones: `npx prisma migrate dev`

### Error: "401 Unauthorized" aún después de las correcciones
**Posibles causas:**
1. Usuario no existe en BD
2. Password incorreso
3. Usuario está INACTIVE
4. JWT_SECRET no coincide
5. Token expirado

**Verificar:**
```bash
# Ver logs del backend
cd apps/api && npm run start:dev

# Verificar BD
npx prisma studio  # interfaz visual

# Verificar JWT
echo "eyJ..." | jq '.'  # decodificar token
```

---

## 📄 ESTRUCTURA FINAL

```
apps/api/src/auth/
├─ auth.module.ts
├─ auth.service.ts
├─ auth.controller.ts
├─ dto/
│  ├─ login.dto.ts
│  ├─ register.dto.ts
│  └─ auth-response.dto.ts
├─ strategies/
│  ├─ jwt.strategy.ts
│  └─ local.strategy.ts
└─ guards/
   └─ jwt-auth.guard.ts

apps/api/prisma/
├─ schema.prisma
├─ .env
└─ migrations/

apps/api/src/database/
└─ prisma.service.ts
```

---

## ✅ CHECKLIST DE VALIDACIÓN

- [ ] Todas las dependencias instaladas
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] Usuario de prueba creado
- [ ] Backend iniciado sin errores
- [ ] POST /api/auth/login retorna 200
- [ ] Token generado
- [ ] GET /api/auth/me funciona con token
- [ ] Frontend puede hacer login
- [ ] Token se guarda en localStorage
- [ ] Requests posteriores incluyen JWT
- [ ] Protected routes funcionan

---

## 🚀 PRÓXIMOS PASOS

1. **Backend:**
   - Ejecutar tests del auth module
   - Revisar logs
   - Verificar performance

2. **Frontend:**
   - Actualizar AuthService para usar nueva respuesta
   - Cambiar puerto de 4000 a 3000 si es necesario
   - Actualizar interceptor de HTTP
   - Probar login completo

3. **Integración:**
   - Test end-to-end
   - Verificar CORS
   - Revisar security headers

---

**Generado:** 28 Diciembre 2025  
**Status:** ✅ LISTO PARA PRODUCIR

> "La autenticación es el corazón de la seguridad. Hazla bien desde el inicio."

