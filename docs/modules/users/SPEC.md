# Module: Users, Roles & Permissions

## Business Problem

Administrators need to manage user accounts — create, read, update, and deactivate users. Each user has a specific role that determines their access level across the entire platform. Role changes must be audited. Deactivated users must be blocked from login without losing their history. Personnel certifications and skills must be tracked for field resource planning.

## Roles

- **Create / List / Update users**: `MANAGEMENT_ROLES` (`gerente`, `residente`)
- **Deactivate users**: `gerente` only
- **View users by role**: `SUPERVISORY_ROLES` (`gerente`, `residente`, `supervisor`)
- **View own profile via `/me`**: Any authenticated user (via auth module)
- **IDOR protection**: Normal users cannot access other user records directly (only `gerente`/`residente` have user CRUD routes)

15 canonical roles defined in `@cermont/domain` SSOT (see `packages/domain/src/roles.ts`).

## Use Cases

1. `gerente`/`residente` creates a new user with name, email, password, role (validated against canonical roles), optional phone
2. `gerente`/`residente` lists all users (paginated) with optional role/isActive filters
3. `gerente`/`residente` views a single user's details
4. `gerente`/`residente` updates user fields (name, email, role, phone, avatarUrl) — email uniqueness is enforced
5. `gerente` deactivates a user (soft delete — `isActive: false`)
6. `gerente`/`residente`/`supervisor` fetches all active users by role (for assignment dropdowns)
7. `gerente`/`residente` adds/removes certifications to a user (alturas, espacios confinados, eléctrico, etc.)
8. `gerente`/`residente` updates user skills matrix (replaces skill list)
9. `gerente`/`residente` queries personnel certifications expiring within N days
10. Password hashing occurs automatically via Mongoose pre-save hook (not manual)

## Entities

- **User** (Mongoose model `IUserDocument`): `_id`, `name`, `email`, `password` (hashed, selected: false), `role` (enum validated against `USER_ROLES`), `isActive`, `phone`, `avatarUrl`, `certifications[]` (name, issuedAt, expiresAt, certificationNumber, issuingBody), `skills[]`, `tokenVersion`, `webauthnCredentials`, `webauthnChallenge`, `createdAt`, `updatedAt`

## States

User status: `active` (`isActive: true`) ↔ `inactive` (`isActive: false`)

- `active` → `inactive`: `gerente` deactivates the user
- `inactive` → `active`: No current endpoint (manual DB operation)
- Deactivated users cannot log in (checked in `auth.service.ts` login)
- Deactivated users remain in database (soft delete)

## Transitions

| From | To | Action | By |
|------|----|--------|----|
| `active` | `inactive` | `PATCH /:id/deactivate` | `gerente` only |
| `inactive` | `active` | N/A (no endpoint) | DB-only |

## Preconditions

- Actor must be authenticated with valid bearer token
- Actor must have required role: `MANAGEMENT_ROLES` for CRUD, `gerente` for deactivation
- Email must be unique across all users (enforced on create and update)
- Role string must be one of the 15 canonical roles (validated via `validateRole()`)
- Password must meet complexity requirements (8-72 chars, uppercase+lowercase+digit)

## Blockers

- **Email conflict** (409): Trying to create/update with an email already in use
- **Invalid role** (400): Role not in canonical set
- **User not found** (404): ID doesn't match any user
- **Forbidden** (403): Actor lacks `MANAGEMENT_ROLES` or `gerente` for deactivation
- **Duplicate certification** (409): Same name + certificationNumber already exists
- **Certification not found** (404): Attempting to remove a non-existent certification

## Permissions

| Action | Endpoint | Required Role |
|--------|----------|---------------|
| List users | `GET /api/users` | `MANAGEMENT_ROLES` |
| Create user | `POST /api/users` | `MANAGEMENT_ROLES` |
| View user by ID | `GET /api/users/:id` | `MANAGEMENT_ROLES` |
| Update user | `PUT /api/users/:id` | `MANAGEMENT_ROLES` |
| Deactivate user | `PATCH /api/users/:id/deactivate` | `gerente` only |
| View by role | `GET /api/users/role/:role` | `SUPERVISORY_ROLES` |
| Add certification | `POST /api/users/:id/certifications` | `MANAGEMENT_ROLES` |
| Remove certification | `DELETE /api/users/:id/certifications/:name` | `MANAGEMENT_ROLES` |
| Update skills | `PUT /api/users/:id/skills` | `MANAGEMENT_ROLES` |
| Expiring certifications | `GET /api/users/expiring-certifications` | `MANAGEMENT_ROLES` |

## Contracts

Schemas in `@cermont/shared-types` (`packages/shared-types/src/schemas/user.schema.ts`):

- `UserSchema` / `User` — full entity representation
- `CreateUserSchema` / `CreateUserInput` — name, email, password, role, phone?
- `UpdateUserSchema` / `UpdateUserInput` — partial fields (no password), plus avatarUrl
- `UserIdParamsSchema` — id (ObjectId)
- `UserRoleParamsSchema` — role (normalized)
- `ListUsersQuerySchema` / `ListUsersQuery` — page, limit, role?, isActive?
- `UserCertificationSchema` / `UserCertification` — name, issuedAt, expiresAt?, certificationNumber?, issuingBody?
- `AddUserCertificationSchema` / `AddUserCertificationInput` — strict version of certification
- `UpdateUserSkillsSchema` / `UpdateUserSkillsInput` — skills array (max 50)

Role constants in `@cermont/domain` (`packages/domain/src/roles.ts`):
- `USER_ROLES` array, `UserRole` type, `ROLE_LABELS`, `ROLE_HIERARCHY`, `CERMONT_ROLES`, `hasRole()`, `normalizeUserRole()`, `resolveUserRole()`

## Endpoints

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/api/users` | Bearer | GER, RES | List users (paginated, filtered by role/isActive) |
| POST | `/api/users` | Bearer | GER, RES | Create user (validates role, checks email uniqueness) |
| GET | `/api/users/role/:role` | Bearer | GER, RES, SUP | Get active users by role |
| GET | `/api/users/expiring-certifications` | Bearer | GER, RES | Certifications expiring within N days |
| GET | `/api/users/:id` | Bearer | GER, RES | Get user by ID |
| PUT | `/api/users/:id` | Bearer | GER, RES | Update user (validates email + role) |
| PATCH | `/api/users/:id/deactivate` | Bearer | GER | Soft delete (isActive = false) |
| POST | `/api/users/:id/certifications` | Bearer | GER, RES | Add certification |
| DELETE | `/api/users/:id/certifications/:name` | Bearer | GER, RES | Remove certification by name |
| PUT | `/api/users/:id/skills` | Bearer | GER, RES | Replace skills list |

## Screens

- **User List** (`/users`): Table with columns (name, email, role, isActive, certifications count), search/filter, create button
- **User Detail** (`/users/:id`): Profile view with certifications and skills display
- **User Create/Edit** (modal or page): Form with name, email, role dropdown, phone, optional avatar
- **Certification Management** (in user detail): Add/remove certifications with name, expiry date, issuing body
- **Skills Matrix** (in user detail): Tag/skills list editor

## UI States

| State | Behavior |
|-------|----------|
| **Loading** | Table skeleton for list, card skeleton for detail |
| **Error** | Error card with retry button (e.g., network failure, 404) |
| **Empty** | "No users found" illustration + CTA to create first user |
| **Offline** | TanStack Query handles offline gracefully (no offline snapshots for users yet) |
| **Forbidden** | 403 error card if non-GER/RES tries to access user management |
| **Success** | Toast on create/update/deactivate; table refetch |

## Audit Events

- `USER_CREATED`: Actor ID, entity ID, before/after (role, name, isActive)
- `USER_UPDATED`: Actor ID, entity ID, before/after (name, email, role)
- `USER_ROLE_CHANGED`: Special action when role field changes (separate from `USER_UPDATED`)
- `USER_DEACTIVATED`: Actor ID, entity ID, before/after (isActive)
- `USER_CERTIFICATION_ADDED`: Actor ID, entity ID, certification name
- `USER_CERTIFICATION_REMOVED`: Actor ID, entity ID, certification name
- `USER_SKILLS_UPDATED`: Actor ID, entity ID, before/after skills arrays

## Negative Cases

- Create user with existing email → `409 "User already exists"`
- Create user with invalid role string → `400 "Invalid role 'xyz'"`
- Create user with weak password → 400 Zod validation error
- Update user to an already-taken email → `409 "Email is already in use"`
- Update user with invalid role → `400 "Invalid role"`
- View user by ID that doesn't exist → `404 "User not found"`
- Deactivate already-deactivated user → returns data (idempotent, no error)
- Non-gerente tries to deactivate → `403 "FORBIDDEN"`
- Non-management role tries to list users → 403 from authorize middleware
- Remove certification that doesn't exist → `404 "Certification not found"`
- Add duplicate certification (same name + number) → `409 "La certificación ya está registrada"`

## E2E Tests

- Create user → returns user with hashed password (password not in response)
- Create user with duplicate email → 409 error
- List users → paginated results with total count
- List users filtered by role → only matching roles returned
- List users filtered by isActive → only active/inactive returned
- Update user → fields persisted, email uniqueness enforced
- Update user role → `USER_ROLE_CHANGED` audit event created
- Deactivate user → `isActive: false`, user cannot log in
- Deactivate by non-gerente → 403 error
- Add certification → appears in user's certifications array
- Remove certification → removed from array
- Expiring certifications query → returns correct list sorted by expiry

## Acceptance Evidence

- User CRUD works end-to-end with proper role validation
- Deactivated users are blocked from login (`auth.service.ts` checks `isActive`)
- Role changes are captured in the audit trail with before/after snapshots
- Email uniqueness is enforced across all mutations
- Only `gerente` can deactivate; only `MANAGEMENT_ROLES` can create/update
- Canonical role strings from `@cermont/domain` are the single source of truth
- Certifications and skills data is available for field resource planning
- Password is never returned in API responses (excluded via `select("-password")`)
