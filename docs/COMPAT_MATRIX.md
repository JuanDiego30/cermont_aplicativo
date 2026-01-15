# Compatibility Matrix

## Frontend Stack (Angular 17.3.x)

| Component | Current | Compatible Range |
|-----------|---------|-----------------|
| @angular/core | 17.3.10 | 17.3.x (max stable) |
| @angular/cli | 17.3.10 | Must match core |
| @angular-devkit/build-angular | 17.3.10 | Must match CLI |
| @angular/compiler-cli | 17.3.10 | Must match core |
| @angular-eslint/* | 17.3.0 | 17.x for Angular 17 |
| TypeScript | 5.4.5 | >=5.4.0 <5.6.0 for Angular 17 |
| RxJS | 7.8.2 | ^7.0.0 |
| zone.js | 0.14.10 | ^0.14.0 for Angular 17 |

### Angular 17 → 18 Upgrade Notes
- TypeScript 5.4+ required
- New build system (esbuild) default
- Signals API changes
- defer blocks

---

## Backend Stack (NestJS 11.x)

| Component | Current | Compatible Range |
|-----------|---------|-----------------|
| @nestjs/common | 11.0.14 | 11.x |
| @nestjs/core | 11.0.14 | Must match common |
| @nestjs/platform-express | 11.0.14 | Must match core |
| @nestjs/testing | 11.0.14 | Must match core |
| TypeScript | 5.9.3 | >=5.0.0 |
| @prisma/client | 6.2.1 | Must match prisma |
| prisma | 6.2.1 | Must match @prisma/client |
| jest | 30.0.0 | 29-30.x |
| ts-jest | 29.1.1 | Must match jest major |

---

## Upgrade Order (Recommended)

1. **Frontend Stage F1**: Angular 17 minor/patch alignment
2. **Backend Stage B1**: Jest/ts-jest alignment
3. **Backend Stage B2**: Prisma upgrade (if needed)
4. **Backend Stage B3**: NestJS 11.x minor upgrades
5. **Heavy deps (puppeteer/sharp)**: Last, one at a time
