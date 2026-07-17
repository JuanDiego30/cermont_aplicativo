# Runtime Results — Plan v2 Audit

## Backend (Express 5.2.1)
- Status: ✅ RUNNING
- Port: 4000
- PID: 41620
- Mode: development

### Health Endpoints
- GET /api/health → {"status":"ok","check":"readiness","db":"connected","readyState":1}
- GET /api/health/live → {"status":"ok","check":"liveness","uptime":12.3}
- GET /api/health/ready → {"status":"ok","check":"readiness","db":"connected","readyState":1}

### Auth
- POST /api/auth/login (invalid creds) → {"success":false,"error":{"code":"UNAUTHORIZED"}}
- Auth properly rejects unauthorized requests

### Protected Endpoints
- GET /api/users (no auth) → {"success":false,"error":{"code":"UNAUTHORIZED"}}
- GET /api/dashboard/summary (no auth) → {"success":false,"error":{"code":"UNAUTHORIZED"}}

### Memory (idle)
- RSS: 231.0 MB
- Heap Used: 141.9 MB
- External: 21.9 MB

## Frontend (Next.js 16.2.9)
- Status: ✅ RUNNING
- Port: 3000
- Mode: development (Turbopack)
- Cold start: 779ms

### Route Verification
- GET /login → 200 (serves login page)
- GET /dashboard → 307 (redirects to login - expected)
- GET /api/backend/health → 200 (proxy forwards to backend)
- GET /api/backend/dashboard/summary → 401 (proxy passes auth requirement)

### Proxy
- /api/backend/* → rewrites to backend port 4000
- Auth redirect works correctly for protected routes
- Public paths served without auth

## MongoDB
- Status: ✅ CONNECTED
- readyState: 1
- Connection: 127.0.0.1:27017/cermont

## Service Worker
- Compiled by Serwist
- 245 precache entries
- 7310.67 KiB total cache size
- ~offline page available
