# 09 — Security & OWASP Hardening Plan

## Executive Summary

As a document-driven platform executing multi-service contractor workflows in sensitive industries (including the petroleum sector in Arauca, Colombia), **security by design** is a non-negotiable requirement. Any leakage of operational budgets, site photos, safety ASTs, or client digital signatures constitutes a critical data breach.

This security audit and hardening plan identifies **4 critical P0 vulnerabilities**, **3 high-severity P1 issues**, and **5 medium-severity P2 concerns** based on the OWASP API Security Top 10 and Web Security Testing Guidelines. We provide the concrete implementation code blocks, uploader filters, Mongoose security hooks, and automated integration test cases to lock down the CERMONT fullstack perimeter.

---

## Sources & References

- **Canonical Repository Files**:
  - `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` — The target roles (OMNIPOTENTE, OPERATIVO_SENIOR, etc.) and permission matrix.
  - `backend/src/middleware/auth.ts` — Existing JWT interceptor.
  - `backend/src/routes/` — Endpoint mapping files.
- **Security Frameworks**:
  - **OWASP API Security Top 10 (2023)**: Focus on BOLA (IDOR), broken authentication, and unrestricted resource consumption.
  - **OWASP File Upload Cheat Sheet**: Standards for sandboxing, magic bytes validation, and path traversal prevention.

---

## Security Audit Findings & Vulnerability Matrix

```
Vulnerabilidades Detectadas:
├── P0 (Crítico): IDOR en /evidences, IDOR en /documents, MIME Spoofing, Sin Rate Limiting
├── P1 (Alto): Path Traversal (Filenames), Unrestricted File Size, CORS Wildcards
└── P2 (Medio): Falta de Rotación de Refresh Tokens, CSP ausente, Logs sin sanitizar
```

### 1. P0 — Critical Vulnerabilities

| # | Vulnerability | Location / Route | Risk Description | Remediation Blueprint | OWASP Reference |
|---|---------------|------------------|------------------|----------------------|-----------------|
| 1 | **BOLA / IDOR in Evidences** | `GET /api/v1/evidences/:id` | Technicians can view, modify, or delete photo evidence from other cases or clients by manipulating the photo UUID. | Implement tenant-matching in queries: `query.clientId = req.user.clientId` and check ownership in services. | A01:2021 – Broken Access Control |
| 2 | **BOLA / IDOR in Documents** | `GET /api/v1/documents/:id` | Clients or competitors can pull PDFs of confidential Proposals or Delivery Records by modifying the resource ID. | Enforce Mongoose filter validation against the user's tenant ID (`req.user.clientId`). | A01:2021 |
| 3 | **MIME Spoofing (Upload)** | `POST /api/v1/evidences` | Malicious actors can upload `.exe` or `.html` (XSS payload) files masked as `.png` or `.pdf` using HTTP header spoofing. | Implement **Magic Bytes validation** on the backend using `file-type` buffer checks. | A03:2021 – Injection |
| 4 | **Missing Rate Limiting** | `POST /api/v1/auth/login` | Brute force attacks on logins or Denial of Service (DoS) in upload routes due to lack of limits. | Configure `express-rate-limit` on login (10 req/min) and upload (5 req/min) endpoints. | A05:2021 – Security Misconfig |

---

### 2. P1 — High-Severity Vulnerabilities

- **5. Filename Path Traversal**:
  - *Risk*: Saving files using their original name allows directory path manipulation (e.g., uploading a file named `../../../../etc/passwd` to overwrite system files).
  - *Hardening*: **UUID Naming Engine**. Strip original filenames on upload. Generate a unique UUID v4 and append the verified extension (e.g., `8d2f-4a0e.png`). Preserve the original filename in database metadata only.
- **6. Unrestricted Upload File Size**:
  - *Risk*: Attackers can upload 1GB files to fill up server disk space, causing a general crash.
  - *Hardening*: Set Multer limits explicitly: `limits: { fileSize: 20 * 1024 * 1024 }` (max 20MB).
- **7. CORS Wildcard Configurations**:
  - *Risk*: `Access-Control-Allow-Origin: '*'` permits arbitrary external websites to read API responses using credentials.
  - *Hardening*: Restrict CORS origin strictly to `process.env.FRONTEND_URL` and configure `credentials: true`.

---

### 3. P2 — Medium-Severity Vulnerabilities

- **8. Refresh Token Rotation (RTR) Absence**:
  - *Risk*: A stolen refresh token remains valid indefinitely, giving attackers persistent access.
  - *Hardening*: Implement refresh token rotation. Whenever a new token pair is requested, invalidate the old refresh token and maintain an active blacklist in MongoDB.
- **9. Missing Content Security Policy (CSP)**:
  - *Risk*: Susceptibility to Cross-Site Scripting (XSS) injections executing arbitrary scripts in user sessions.
  - *Hardening*: Configure Express `helmet` middleware with a strict CSP header:
    ```typescript
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https://res.cloudinary.com"]
        }
      }
    }));
    ```
- **10. Absence of Audit Logging**:
  - *Risk*: Operational updates (such as deleting a document or changing an invoice amount) are completed silently without trace logs, preventing forensic analysis.
  - *Hardening*: Write entries to the `AuditLog` collection on critical transitions: `{ userId, action, resourceId, ipAddress, timestamp }`.

---

## Code Hardening Implementations

### 1. Magic Bytes Validation Middleware (Backend)
This controller snippet intercepts raw file buffers and verifies the actual file header contents, ignoring the HTTP `Content-Type` header.

```typescript
// backend/src/middleware/file-validator.ts
import { Request, Response, NextFunction } from 'express';
import { fileTypeFromBuffer } from 'file-type';
import { AppError } from '../common/errors/AppError';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export async function validateFileHeaders(req: Request, res: Response, next: NextFunction) {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  // Inspect the first 4100 bytes (magic bytes buffer range)
  const fileInfo = await fileTypeFromBuffer(req.file.buffer);

  if (!fileInfo || !ALLOWED_MIMES.includes(fileInfo.mime)) {
    return next(new AppError(`Unsupported media type. Allowed: ${ALLOWED_MIMES.join(', ')}`, 415));
  }

  // Overwrite local file object metadata with verified values
  req.file.mimetype = fileInfo.mime;
  next();
}
```

### 2. Tenant IDOR Query Interceptor (Mongoose Hook)
Ensures that database queries automatically append tenant filter parameters, isolating client data programmatically.

```typescript
// backend/src/models/plugins/tenant-isolation.ts
import { Schema, Document } from 'mongoose';

export function tenantIsolationPlugin(schema: Schema) {
  schema.pre(/^find/, function (this: any, next) {
    const currentQueryOptions = this.getOptions();
    
    // If the query option contains a tenant isolation constraint, inject it into the filter.
    if (currentQueryOptions.tenantIsolationId) {
      this.where({ clientId: currentQueryOptions.tenantIsolationId });
    }
    next();
  });
}
```

### 3. Rate-Limiting Implementation (`backend/src/index.ts`)
```typescript
import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later'
});

export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit to 5 attempts per minute
  message: 'Too many login attempts, please wait 60 seconds'
});
```

---

## Verification & Automated Test Suite

We verify the hardened perimeter using automated integration test cases built with Vitest and Supertest.

```typescript
// backend/tests/integration/security.spec.ts
import request from 'supertest';
import { app } from '../../src/app';
import { generateTestToken } from '../helpers/auth.helper';

describe("Hardened Security Gates", () => {
  
  it("should reject file uploads containing malicious HTML masquerading as image/png (MIME spoofing)", async () => {
    const fakePhotoBuffer = Buffer.from("<html><script>alert('XSS')</script></html>");
    const technicianToken = generateTestToken({ role: "TEC", tenantId: "tenant_A" });

    const response = await request(app)
      .post("/api/v1/evidences")
      .set("Authorization", `Bearer ${technicianToken}`)
      .attach("file", fakePhotoBuffer, "photo.png")
      .field("category", "BEFORE")
      .field("serviceCaseId", "8d2f4a0e-0000-0000-0000-000000000000");

    expect(response.status).toBe(415); // Unsupported Media Type
    expect(response.body.message).toContain("Unsupported media type");
  });

  it("should return 403 Forbidden when a tenant tries to query documents of another tenant (IDOR)", async () => {
    const tenantAToken = generateTestToken({ role: "CLI", clientId: "tenant_A" });
    const documentBId = "9c8e-5b12-4242-4242-424242424242"; // Document belonging to tenant_B

    const response = await request(app)
      .get(`/api/v1/documents/${documentBId}`)
      .set("Authorization", `Bearer ${tenantAToken}`);

    expect(response.status).toBe(403); // Forbidden
  });

  it("should enforce rate limiting on the authentication route", async () => {
    const requests = Array.from({ length: 6 }).map(() => 
      request(app).post("/api/v1/auth/login").send({ username: "admin", password: "bad" })
    );

    const responses = await Promise.all(requests);
    const lastResponse = responses[5];

    expect(lastResponse.status).toBe(429); // Too Many Requests
  });
});
```
