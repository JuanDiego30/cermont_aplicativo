# 🏥 Health Checks - Cermont API

## Endpoints

### Basic Health Check
```
GET /api/health
```
Returns: `{ "status": "ok", "timestamp": "..." }`

### Ready Check (Database)
```
GET /api/health/ready
```
Verifies PostgreSQL connection.

### Live Check
```
GET /api/health/live
```
Verifies server is responding.

---

## Troubleshooting

### ❌ WARNING: Connectivity check: OFFLINE

**Symptom:**
```
[ConnectivityDetectorService] Connectivity check: OFFLINE
serverReachable: false
```

**Solutions:**
1. Verify server is running on correct port (default: 4000)
2. Check `API_URL` environment variable
3. Test endpoint: `curl http://localhost:4000/api/health`

### ⚠️ Optional Dependencies

| Warning | Solution |
|---------|----------|
| `web-push no instalado` | `pnpm add web-push @types/web-push` |
| `BullMQ no instalado` | `pnpm add bullmq ioredis` |

> **Note:** These are optional for development. The system uses mock implementations.

---

## Environment Variables

```env
PORT=4000
API_URL=http://localhost:4000
```
