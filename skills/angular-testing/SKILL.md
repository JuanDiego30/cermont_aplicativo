---
name: angular-testing
description: Experto en testing de aplicaciones Angular. Usar para tests unitarios con Jasmine/Jest, tests de componentes, mocking de servicios, tests de integración y E2E.
triggers:
  - Angular test
  - Jasmine
  - Karma
  - Vitest
  - TestBed
  - component testing
  - service testing
  - E2E
  - Playwright
role: specialist
scope: testing
output-format: code
---

# Angular Testing Mastery

Especialista en testing de aplicaciones Angular con Jest, Vitest y Playwright.

## Rol

QA Engineer y desarrollador Angular con 6+ años de experiencia. Experto en testing unitario, de integración y E2E para aplicaciones Angular.

## Cuándo Usar Este Skill

- Escribir tests unitarios de componentes
- Testing de servicios HTTP
- Mocking de dependencias
- Testing de directivas y pipes
- Testing de formularios reactivos
- Tests de integración
- E2E con Playwright
- Migrar de Karma a Jest/Vitest

## Configuración con Jest

```javascript
// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.routes.ts',
    '!src/main.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
  },
};

export default config;
```

```typescript
// setup-jest.ts
import 'jest-preset-angular/setup-jest';
import '@angular/localize/init';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

## Testing de Componentes

### Componente Básico

```typescript
// user-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-card',
  standalone: true,
  template: `
    <div class="user-card" [class.active]="isActive">
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
      <button (click)="onSelect()">Select</button>
    </div>
  `,
})
export class UserCardComponent {
  @Input({ required: true }) user!: User;
  @Input() isActive = false;
  @Output() selected = new EventEmitter<User>();

  onSelect(): void {
    this.selected.emit(this.user);
  }
}

// user-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UserCardComponent } from './user-card.component';

describe('UserCardComponent', () => {
  let component: UserCardComponent;
  let fixture: ComponentFixture<UserCardComponent>;

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCardComponent);
    component = fixture.componentInstance;
    component.user = mockUser;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user name and email', () => {
    const nameEl = fixture.debugElement.query(By.css('h3'));
    const emailEl = fixture.debugElement.query(By.css('p'));

    expect(nameEl.nativeElement.textContent).toBe('John Doe');
    expect(emailEl.nativeElement.textContent).toBe('john@example.com');
  });

  it('should have active class when isActive is true', () => {
    component.isActive = true;
    fixture.detectChanges();

    const cardEl = fixture.debugElement.query(By.css('.user-card'));
    expect(cardEl.classes['active']).toBe(true);
  });

  it('should emit selected event when button clicked', () => {
    const spy = jest.spyOn(component.selected, 'emit');
    const button = fixture.debugElement.query(By.css('button'));

    button.triggerEventHandler('click');

    expect(spy).toHaveBeenCalledWith(mockUser);
  });
});
```

### Componente con Servicios

```typescript
// users-list.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  template: `
    @if (loading()) {
      <app-spinner />
    } @else if (error()) {
      <div class="error">{{ error() }}</div>
    } @else {
      <ul>
        @for (user of users(); track user.id) {
          <li>{{ user.name }}</li>
        }
      </ul>
    }
  `,
})
export class UsersListComponent implements OnInit {
  private readonly userService = inject(UserService);

  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: users => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: err => {
        this.error.set('Failed to load users');
        this.loading.set(false);
      },
    });
  }
}

// users-list.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError, delay } from 'rxjs';
import { UsersListComponent } from './users-list.component';
import { UserService } from '@core/services/user.service';

describe('UsersListComponent', () => {
  let component: UsersListComponent;
  let fixture: ComponentFixture<UsersListComponent>;
  let userServiceMock: jest.Mocked<UserService>;

  const mockUsers: User[] = [
    { id: 1, name: 'John', email: 'john@test.com' },
    { id: 2, name: 'Jane', email: 'jane@test.com' },
  ];

  beforeEach(async () => {
    userServiceMock = {
      getUsers: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    await TestBed.configureTestingModule({
      imports: [UsersListComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersListComponent);
    component = fixture.componentInstance;
  });

  it('should show loading state initially', () => {
    userServiceMock.getUsers.mockReturnValue(of(mockUsers).pipe(delay(100)));
    fixture.detectChanges();

    expect(component.loading()).toBe(true);
    expect(fixture.nativeElement.querySelector('app-spinner')).toBeTruthy();
  });

  it('should display users after loading', fakeAsync(() => {
    userServiceMock.getUsers.mockReturnValue(of(mockUsers));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.users()).toEqual(mockUsers);
    
    const listItems = fixture.nativeElement.querySelectorAll('li');
    expect(listItems.length).toBe(2);
    expect(listItems[0].textContent).toBe('John');
  }));

  it('should show error message on failure', fakeAsync(() => {
    userServiceMock.getUsers.mockReturnValue(throwError(() => new Error('API Error')));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.error()).toBe('Failed to load users');
    expect(fixture.nativeElement.querySelector('.error')).toBeTruthy();
  }));
});
```

## Testing de Servicios

### Servicio HTTP

```typescript
// user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/users';

  getUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Failed to fetch users', error);
        throw error;
      })
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }
}

// user.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verificar que no hay requests pendientes
  });

  describe('getUsers', () => {
    it('should return users from API', (done) => {
      const mockResponse = {
        data: [
          { id: 1, name: 'John', email: 'john@test.com' },
          { id: 2, name: 'Jane', email: 'jane@test.com' },
        ],
      };

      service.getUsers().subscribe(users => {
        expect(users.length).toBe(2);
        expect(users[0].name).toBe('John');
        done();
      });

      const req = httpMock.expectOne('/api/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should throw error on API failure', (done) => {
      service.getUsers().subscribe({
        error: error => {
          expect(error.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne('/api/users');
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('createUser', () => {
    it('should send POST request with user data', (done) => {
      const newUser: CreateUserDto = { name: 'New User', email: 'new@test.com' };
      const createdUser: User = { id: 3, ...newUser };

      service.createUser(newUser).subscribe(user => {
        expect(user).toEqual(createdUser);
        done();
      });

      const req = httpMock.expectOne('/api/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUser);
      req.flush(createdUser);
    });
  });
});
```

### Estado con Signals

```typescript
// cart.store.ts
import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly items = signal<CartItem[]>([]);

  readonly itemCount = computed(() => this.items().length);
  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  readonly isEmpty = computed(() => this.items().length === 0);

  addItem(product: Product, quantity = 1): void {
    this.items.update(items => {
      const existing = items.find(i => i.productId === product.id);
      if (existing) {
        return items.map(i =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...items, { productId: product.id, price: product.price, quantity }];
    });
  }

  removeItem(productId: number): void {
    this.items.update(items => items.filter(i => i.productId !== productId));
  }

  clear(): void {
    this.items.set([]);
  }
}

// cart.store.spec.ts
import { TestBed } from '@angular/core/testing';
import { CartStore } from './cart.store';

describe('CartStore', () => {
  let store: CartStore;

  const mockProduct: Product = { id: 1, name: 'Test Product', price: 100 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartStore],
    });
    store = TestBed.inject(CartStore);
  });

  it('should start with empty cart', () => {
    expect(store.isEmpty()).toBe(true);
    expect(store.itemCount()).toBe(0);
    expect(store.total()).toBe(0);
  });

  it('should add item to cart', () => {
    store.addItem(mockProduct, 2);

    expect(store.itemCount()).toBe(1);
    expect(store.total()).toBe(200);
    expect(store.isEmpty()).toBe(false);
  });

  it('should increase quantity for existing item', () => {
    store.addItem(mockProduct, 1);
    store.addItem(mockProduct, 2);

    expect(store.itemCount()).toBe(1);
    expect(store.total()).toBe(300);
  });

  it('should remove item from cart', () => {
    store.addItem(mockProduct);
    store.removeItem(mockProduct.id);

    expect(store.isEmpty()).toBe(true);
  });

  it('should clear all items', () => {
    store.addItem(mockProduct, 5);
    store.addItem({ id: 2, name: 'Product 2', price: 50 }, 3);
    
    store.clear();

    expect(store.isEmpty()).toBe(true);
    expect(store.total()).toBe(0);
  });
});
```

## Testing de Formularios

```typescript
// login-form.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have invalid form by default', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should validate email format', () => {
    const emailControl = component.form.get('email')!;
    
    emailControl.setValue('invalid');
    expect(emailControl.hasError('email')).toBe(true);
    
    emailControl.setValue('valid@email.com');
    expect(emailControl.hasError('email')).toBe(false);
  });

  it('should require password minimum length', () => {
    const passwordControl = component.form.get('password')!;
    
    passwordControl.setValue('123');
    expect(passwordControl.hasError('minlength')).toBe(true);
    
    passwordControl.setValue('12345678');
    expect(passwordControl.hasError('minlength')).toBe(false);
  });

  it('should disable submit button when form is invalid', () => {
    const submitBtn = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitBtn.nativeElement.disabled).toBe(true);
  });

  it('should emit form value on submit', () => {
    const spy = jest.spyOn(component.submitted, 'emit');
    
    component.form.setValue({
      email: 'test@example.com',
      password: 'password123',
    });
    fixture.detectChanges();

    component.onSubmit();

    expect(spy).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

## Testing E2E con Playwright

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit' }).click();
    
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should login successfully', async ({ page }) => {
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('wrong@email.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});

// e2e/fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';

export const test = base.extend<{ authenticatedPage: void }>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Login
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForURL('/dashboard');
    
    await use();
    
    // Teardown
    await page.evaluate(() => localStorage.clear());
  },
});
```

## Restricciones

### DEBE HACER
- Aislar componentes con mocks
- Usar TestBed correctamente
- Limpiar subscriptions en tests
- Testear estados de loading/error
- Usar fakeAsync para operaciones async

### NO DEBE HACER
- Tests que dependen de orden
- Testear implementación interna
- Ignorar edge cases
- Tests lentos sin justificación
- Skip tests sin crear issue

## Skills Relacionados

- **jest-testing** - Testing patterns generales
- **rxjs-patterns** - Testing de observables
- **angular-architect** - Arquitectura testeable
