// docker/mongo-init.js
// Se ejecuta automáticamente al crear el contenedor MongoDB por primera vez.
// Solo crea colecciones e índices. Los usuarios se crean vía seed.ts (con bcrypt real).

db = db.getSiblingDB("cermont");

// ─── Crear colecciones ─────────────────────────────────────────────────────────
db.createCollection("users");
db.createCollection("orders");
db.createCollection("proposals");
db.createCollection("resources");
db.createCollection("evidences");
db.createCollection("checklists");
db.createCollection("reports");
db.createCollection("costs");
db.createCollection("costcontrols");
db.createCollection("documents");
db.createCollection("inspections");
db.createCollection("maintenancekits");
db.createCollection("counters");
db.createCollection("auditlogs");
db.createCollection("tokenblacklists");

// ─── Índices ───────────────────────────────────────────────────────────────────
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });

db.orders.createIndex({ status: 1 });
db.orders.createIndex({ assignedTo: 1 });
db.orders.createIndex({ createdAt: -1 });

db.proposals.createIndex({ clientId: 1 });
db.proposals.createIndex({ status: 1 });

db.evidences.createIndex({ orderId: 1 });

db.auditlogs.createIndex({ userId: 1 });
db.auditlogs.createIndex({ action: 1 });
db.auditlogs.createIndex({ createdAt: -1 });

db.tokenblacklists.createIndex({ jti: 1 });
db.tokenblacklists.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

print("✅ cermont DB inicializada — colecciones e índices creados");
print("📋 Ejecutar seed para crear usuarios: npm run db:seed");
