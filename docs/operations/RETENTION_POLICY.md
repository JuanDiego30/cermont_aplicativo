# RETENTION POLICY — Cermont S.A.S.

## 1. Purpose

Define data retention periods, archiving procedures, and restoration verification for the Cermont operational platform.

---

## 2. Data Classification and Retention Periods

| Category | Retention | Storage | Deletion Action |
|---|---|---|---|
| **Operational data** (work requests, orders, invoices, payments, service sheets, evidence metadata) | 12 months after closure | Main MongoDB (`cermont`) | Monthly archive job moves to cold storage |
| **Historical data** (closed > 12 months) | Indefinite (cold) | Backup/archive MongoDB (`cermont_archive`) | Never deleted from archive |
| **Evidence files** (photos, PDFs, uploads) | 24 months | Filesystem (`./uploads/`) | `find -mtime +730 -delete` |
| **Audit logs** | Never deleted (immutable) | Main MongoDB (`auditlogs` collection) | No deletion — capped by TTL only if configured |
| **Config / settings** (`systemconfig`, `customfields`, `documenttemplates`) | Indefinite | Main MongoDB | Never deleted |
| **Sessions / tokens** (`tokenblacklists`) | 7 days | Main MongoDB | TTL index auto-cleanup |

---

## 3. Monthly Archiving Process

### 3.1. Trigger
- Runs on the **1st of every month** at 02:00 UTC via cron/systemd timer.

### 3.2. Steps
1. **Identify closable records**: query all collections for `status: "closed"` and `closedAt < now() - 12 months`.
2. **Export to archive**: use `mongodump` with query filter per collection, output to `/data/archive/YYYY-MM/`.
3. **Verify archive**: compute SHA-256 checksums of archive files; store in `manifest.json`.
4. **Remove from main DB**: delete exported documents from operational collections.
5. **Prune evidence**: delete files from `uploads/` with `mtime > 730 days`.
6. **Log**: record the archiving run in `auditlogs` with action `ARCHIVE_RUN`.

### 3.3. Archive Manifest Format
```json
{
  "archiveId": "YYYY-MM",
  "generatedAt": "2026-07-01T02:00:00.000Z",
  "version": "1.0.0",
  "collections": [
    {
      "name": "orders",
      "documentCount": 142,
      "checksum": "sha256:abc123..."
    }
  ],
  "totalDocuments": 142,
  "archiveSizeBytes": 5242880
}
```

---

## 4. Backup strategy

### 4.1. Daily
- Full `mongodump` via `scripts/backup.sh` to `/data/backups/`.
- Retention: 7 days (automatically rotated by backup.sh).
- Includes `manifest.json` with collection counts and SHA-256 checksums.

### 4.2. Weekly
- Full backup copied to off-site/cloud storage (e.g., S3, rsync to remote host).

### 4.3. Monthly
- Archive backup (section 3) moved to cold storage. Retained indefinitely.

---

## 5. Restore Procedure

### 5.1. Prerequisites
- Access to the backup file (`cermont_backup_YYYYMMDD_HHMMSS.tar.gz`).
- MongoDB target instance (can be same or different).
- `mongorestore` CLI tool installed.

### 5.2. Restore Steps
```bash
# 1. Extract backup
tar -xzf cermont_backup_20260701_020000.tar.gz

# 2. Verify manifest checksums
sha256sum -c manifest.json --ignore-missing 2>&1 | grep -v ": OK$"
# If any line is printed, checksum verification FAILED — DO NOT RESTORE

# 3. Restore to target database
mongorestore --uri="mongodb://target:27017/cermont" \
  --dir="./cermont_backup_20260701_020000/cermont" \
  --drop

# 4. Verify document counts match manifest
# Run after restore — compare counts
```

### 5.3. Verification After Restore
```bash
# Compare current document counts against manifest
BACKUP_DIR="./cermont_backup_20260701_020000"
TARGET_URI="mongodb://127.0.0.1:27017/cermont"

# Read manifest and check each collection
node -e "
const m = require('${BACKUP_DIR}/manifest.json');
m.collections.forEach(async (c) => {
  const { MongoClient } = require('mongodb');
  const client = new MongoClient('${TARGET_URI}');
  await client.connect();
  const db = client.db();
  const count = await db.collection(c.name).countDocuments();
  console.log(c.count === count
    ? 'OK ' + c.name + ': ' + count
    : 'MISMATCH ' + c.name + ': expected ' + c.count + ' got ' + count);
  await client.close();
});
"
```

### 5.4. Rollback
If verification fails:
1. Drop the restored database.
2. Investigate the checksum mismatch (corrupted backup, wrong backup version).
3. Use the previous known-good backup.
4. Repeat restore and verification.

---

## 6. Responsibility

- **Operations team**: runs monthly archiving, monitors backup health, performs restore drills.
- **Development team**: maintains `scripts/backup.sh`, admin-backup API routes, and this document.

---

## 7. Compliance

This policy satisfies:
- Document retention requirements per Colombian commercial code (Código de Comercio, Libro I, Título IV).
- Audit trail immutability (ISO 9001:2015 clause 7.5.3.2).
- Personal data retention limits (Ley 1581 de 2012, Decreto 1377 de 2013).

---

*Last updated: 2026-07-15*
