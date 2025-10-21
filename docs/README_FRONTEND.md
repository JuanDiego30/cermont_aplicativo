# README – Frontend Documentation

**Version:** 1.0.0  
**Date:** October 20, 2025  
**Framework:** Next.js 15.5.6  
**Status:** Stable

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Authentication Flow](#authentication-flow)
3. [Main Routes](#main-routes)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Styling](#styling)
8. [Development](#development)

---

## Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── api/                       # API routes
│   │   ├── hello/route.ts
│   │   ├── assistant/route.ts
│   │   └── ...
│   ├── autenticacion/             # Auth pages
│   │   ├── login/page.tsx
│   │   └── registro/page.tsx
│   ├── admin/                     # Admin dashboard
│   │   ├── dashboard/
│   │   └── fallas/
│   ├── tecnico/                   # Technician dashboard
│   ├── cliente/                   # Client dashboard
│   ├── coordinador/               # Coordinator dashboard
│   ├── gerente/                   # Manager dashboard
│   ├── ordenes/                   # Work orders
│   │   ├── page.tsx              # Orders list
│   │   ├── [id]/page.tsx         # Order detail
│   │   └── nueva/page.tsx        # Create order
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
├── components/                    # Reusable components
│   ├── layout/                    # Layout components
│   ├── forms/                     # Form components
│   ├── orders/                    # Order-specific components
│   ├── ui/                        # Basic UI components
│   ├── shared/                    # Shared components
│   └── assistant/                 # AI assistant widget
├── lib/                           # Utilities & hooks
│   ├── api/                       # API clients
│   ├── auth/                      # Auth utilities
│   ├── hooks/                     # Custom hooks
│   ├── types/                     # TypeScript types
│   └── constants/                 # Constants & config
└── styles/                        # Global styles
```

---

## Authentication Flow

### 1. Registration

```
User inputs credentials
     ↓
POST /api/users/register
     ↓
JWT token received
     ↓
Token stored in localStorage
     ↓
Redirect to dashboard
```

**File:** `src/components/forms/RegisterForm.tsx`

### 2. Login

```
User enters email/password
     ↓
POST /api/users/login
     ↓
Verify credentials
     ↓
Generate JWT token
     ↓
Store in localStorage
     ↓
Redirect to dashboard
```

**File:** `src/components/forms/LoginForm.tsx`

### 3. Protected Routes

```
User accesses route
     ↓
ProtectedRoute checks token
     ↓
If valid: render component
If invalid: redirect to login
```

**File:** `src/lib/auth/ProtectedRoute.tsx`

### 4. Token Management

Tokens are stored in `localStorage`:

```javascript
// Get token
const token = localStorage.getItem('token');

// Store token
localStorage.setItem('token', token);

// Clear token (logout)
localStorage.removeItem('token');
```

---

## Main Routes

### Public Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Landing page | Homepage |
| `/autenticacion/login` | Login form | User login |
| `/autenticacion/registro` | Register form | User registration |
| `/acceso-denegado` | Access denied | Permission denied page |

### Protected Routes (Role-based)

| Route | Roles | Purpose |
|-------|-------|---------|
| `/admin/dashboard` | admin | Admin overview |
| `/admin/fallas` | admin | Failure catalog |
| `/coordinador/dashboard` | coordinador | Coordinator dashboard |
| `/tecnico/dashboard` | tecnico | Technician workspace |
| `/cliente/dashboard` | cliente | Client portal |
| `/gerente/dashboard` | gerente | Manager reports |
| `/ordenes` | all | Orders list |
| `/ordenes/[id]` | all | Order detail |
| `/ordenes/nueva` | admin, coordinador | Create order |
| `/reportes` | admin, gerente | Analytics |
| `/usuarios` | admin | User management |

---

## Component Architecture

### UI Components

Located in `src/components/ui/`:

```typescript
// Button.tsx
<Button variant="primary" onClick={handleClick}>
  Click me
</Button>

// Input.tsx
<Input
  label="Email"
  type="email"
  placeholder="user@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
/>

// Select.tsx
<Select
  label="Role"
  value={role}
  onChange={(e) => setRole(e.target.value)}
  options={[
    { value: 'admin', label: 'Administrator' },
    { value: 'tecnico', label: 'Technician' },
  ]}
/>

// Modal.tsx
<Modal isOpen={open} onClose={handleClose}>
  <h2>Confirm Action</h2>
  <Button onClick={handleConfirm}>Confirm</Button>
</Modal>
```

### Form Components

Located in `src/components/forms/`:

- `LoginForm.tsx` - User login form
- `RegisterForm.tsx` - User registration form
- `OrderForm.tsx` - Create/edit orders
- `CctvForm.tsx` - CCTV-specific form
- `WorkPlanForm.tsx` - Work plan creation

### Layout Components

Located in `src/components/layout/`:

- `Header.tsx` - Top navigation bar
- `Footer.tsx` - Bottom footer
- `PageContainer.tsx` - Page wrapper

### Order Components

Located in `src/components/orders/`:

- `OrdersList.tsx` - Table of orders
- `OrderDetail.tsx` - Full order information
- `OrderForm.tsx` - Order creation/editing
- `ChecklistManager.tsx` - Task checklist
- `CostTracker.tsx` - Budget tracking

---

## State Management

### AuthContext

Global authentication state:

```typescript
// src/lib/auth/AuthContext.tsx
export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterInput) => Promise<void>;
}

// Usage in components:
const { user, token, login, logout } = useAuth();
```

### Custom Hooks

```typescript
// useAuth() - Access authentication context
const { user } = useAuth();

// useLocalStorage() - Persist data to localStorage
const [value, setValue] = useLocalStorage('key', defaultValue);

// useBoolean() - Toggle boolean state
const [isOpen, setOpen, toggle] = useBoolean(false);

// useFetch() - Fetch data with loading/error states
const { data, loading, error } = useFetch('/api/endpoint');
```

---

## API Integration

### API Client

Located in `src/lib/api/client.ts`:

```typescript
// GET request
const { data, error } = await api.get<Order>('/orders/123');

// POST request
const { data, error } = await api.post<Order>('/orders', {
  titulo: 'New Order',
  descripcion: 'Description',
});

// PATCH request
const { data, error } = await api.patch<Order>('/orders/123', {
  estado: 'completada',
});

// DELETE request
const { data, error } = await api.delete('/orders/123');
```

### API Modules

- `src/lib/api/orders.ts` - Order operations
- `src/lib/api/failures.ts` - Failure catalog
- `src/lib/api/equipment.ts` - Equipment management
- `src/lib/api/evidence.ts` - Evidence uploads
- `src/lib/api/users.ts` - User management
- `src/lib/api/tools.ts` - Tools & materials

---

## Styling

### CSS Strategy

**Tailwind CSS** for utility classes + custom CSS modules:

```typescript
// Utility classes
<div className="flex justify-between items-center p-4">
  <h1 className="text-2xl font-bold">Title</h1>
</div>

// CSS Modules
import styles from './Header.module.css';

export function Header() {
  return <header className={styles.header}>...</header>;
}
```

### Global Styles

Located in `src/styles/`:

- `globals.css` - Global resets & utilities
- `base/` - Base element styles
- `components/` - Component-specific styles
- `pages/` - Page-specific styles

### Theme

**Dark/Light mode toggle** in `src/components/shared/ThemeToggle.tsx`:

```typescript
// Toggle stored in localStorage
localStorage.setItem('theme', 'dark' | 'light');
```

---

## Development

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/v1
NEXT_PUBLIC_USE_MOCKS=false
```

### Testing

```bash
# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Run linter
npm run lint
```

### Component Development

```typescript
// src/components/MyComponent.tsx
'use client'; // Mark as client component

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function MyComponent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
    </div>
  );
}
```

### Form Implementation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
    </form>
  );
}
```

---

## Troubleshooting

### Common Issues

**Token not persisting:**
- Check localStorage is not disabled
- Verify token format (should start with `eyJ`)

**API requests failing:**
- Ensure backend is running on correct port (4000)
- Check `NEXT_PUBLIC_API_BASE_URL` is correct
- Verify CORS settings in backend

**Styling not applied:**
- Clear cache: `rm -rf .next`
- Rebuild: `npm run build`

### Debug Mode

Enable debug logging:

```typescript
// In development
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}
```

---

## See Also

- [API Reference](./README_API.md)
- [Deployment Guide](./README_DEPLOY.md)
- [Monitoring Guide](./README_MONITORING.md)
