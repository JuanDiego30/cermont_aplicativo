# Runbook: Authentication Incident Response

## Overview
Login failures, token issues, brute force attempts.

## Check Auth Logs
Query AuditLog collection for auth events:
```bash
mongosh mongodb://127.0.0.1:27017/cermont --eval '
  db.auditlogs.find({ entityType: "auth" })
    .sort({ createdAt: -1 }).limit(20).pretty()
'
```

## Rate Limiting
Check RateLimitBucket collection for key hits:
```bash
mongosh mongodb://127.0.0.1:27017/cermont --eval '
  db.ratelimitentries.find({ prefix: "auth:" }).sort({ expiration: -1 }).limit(10).pretty()
'
```

## Token Issues
Check RefreshToken collection for status counts:
```bash
mongosh mongodb://127.0.0.1:27017/cermont --eval '
  db.refreshtokens.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ])
'
```

## Common Incident Types

| Type | Symptom | Action |
|---|---|---|
| Brute force | Multiple failed logins from same IP | Block IP, clear rate limit entries |
| Token replay | Same jti used multiple times | Increment tokenVersion, force re-login |
| Account lockout | User.isActive set to false | Reactivate account via admin panel |

## Recovery
Force password reset via admin panel or direct DB:
```bash
mongosh mongodb://127.0.0.1:27017/cermont --eval '
  const bcrypt = require("bcryptjs");
  const hash = bcrypt.hashSync("NewPassword2026!", 12);
  db.users.updateOne(
    { email: "user@example.com" },
    { $set: { password: hash, tokenVersion: 0 } }
  );
'
```

## Escalation
If JWT secrets compromised, rotate immediately and invalidate all tokens:
```bash
# Update JWT_SECRET in .env, then
pm2 restart cermont-backend
```
