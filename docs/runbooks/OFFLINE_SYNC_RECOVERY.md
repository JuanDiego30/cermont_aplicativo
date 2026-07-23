# Runbook: Offline Sync Recovery

## Overview
Offline queue stores mutations in IndexedDB, syncs on reconnect.

## Sync Status
Check `/offline-sync` page for pending/failed/conflict counts.

## Dead Letter Queue
Failed mutations stored in DlqEntry collection:
```bash
mongosh mongodb://127.0.0.1:27017/cermont --eval '
  db.dlqentries.find().sort({ createdAt: -1 }).limit(20).pretty()
'
```

## Recovery Steps

1. **Check connectivity**: Use `navigator.onLine` + backend ping
2. **Force sync**: Navigate to `/offline-sync` and trigger manual sync
3. **Resolve conflicts**: Review conflict entries in DLQ
4. **Clear stuck mutations**: Admin can clear DLQ entries via admin panel:
```bash
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  https://<domain>/api/erp-connectors/dlq/DLQ_ID/resolve
```

## Common Issues
| Issue | Cause | Fix |
|---|---|---|
| Duplicate mutations | Same clientMutationId | Check idempotency key |
| Blob upload failures | Network or size limit | Compress file, retry |

## Prevention
Ensure service worker is registered, cache is populated.
