# Runbook: Backup & Restore

## Automated Backup
Via admin-backup service or mongodump cron:
```bash
# Daily cron: mongodump at 03:00 UTC
mongodump --uri="$MONGODB_URI" --archive=/opt/cermont/backups/cermont-$(date +%F).gz --gzip
```

## Manual Backup
```bash
mongodump --uri="$MONGODB_URI" --archive=cermont-$(date +%F).gz --gzip
```

## Restore
```bash
mongorestore --uri="$MONGODB_URI" --archive=backup-file.gz --gzip --drop
```

## Verification
After restore, query critical collections:
```bash
mongosh mongodb://127.0.0.1:27017/cermont --eval '
  ["users", "servicecases", "orders"].forEach(c => {
    print(c + ": " + db[c].countDocuments() + " docs");
  });
'
```
Check backup integrity via admin/backups verify endpoint.

## Retention
| Frequency | Retention |
|---|---|
| Daily | 7 days |
| Weekly | 4 weeks |
| Monthly | 6 months |
