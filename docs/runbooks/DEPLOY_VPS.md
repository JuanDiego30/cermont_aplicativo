# Runbook: VPS Deployment

## Prerequisites
- Node.js 20+
- MongoDB 7+
- PM2
- nginx
- Certbot

## Steps

1. Pull latest code:
```bash
git pull origin main
```

2. Install dependencies:
```bash
npm ci
```

3. Build:
```bash
npm run build
```

4. Run typecheck + lint + tests:
```bash
npm run typecheck && npm run lint && npm run test
```

5. Restart backend:
```bash
pm2 restart cermont-backend
```

6. Restart frontend:
```bash
pm2 restart cermont-frontend
```

7. Verify health:
```bash
curl https://domain.com/api/health
```

## Rollback
```bash
pm2 restart cermont-backend --previous
```
Or redeploy previous build from git history.

## Environment
Copy and verify `.env.production`. Check `JWT_SECRET` length (32+ chars):
```bash
echo ${#JWT_SECRET}
```
