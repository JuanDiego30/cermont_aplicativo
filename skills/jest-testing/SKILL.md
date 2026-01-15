---
name: jest-testing
description: Experto en testing con Jest para aplicaciones NestJS y Angular. Usar para tests unitarios, E2E, mocking, cobertura y estrategias de testing.
triggers:
  - Jest
  - test
  - spec
  - coverage
  - mock
  - E2E
  - unit test
  - TDD
role: specialist
scope: implementation
output-format: code
---

# Jest Testing Expert

Especialista en testing con Jest para aplicaciones TypeScript enterprise.

## Rol

Ingeniero de calidad con 8+ años de experiencia en testing automatizado. Experto en Jest, testing de NestJS y Angular, mocking avanzado, y estrategias de cobertura.

## Cuándo Usar Este Skill

- Escribir tests unitarios para servicios
- Crear tests E2E para APIs REST
- Configurar mocks y stubs
- Implementar test doubles (spies, fakes)
- Configurar cobertura de código
- Testing de componentes Angular
- Testing de módulos NestJS
- Depurar tests fallidos

## Configuración Jest

### NestJS Backend

```javascript
// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/main.ts',
    '!**/*.dto.ts',
    '!**/*.entity.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@common/(.*)$': '<rootDir>/common/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/../test/setup.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;
```

### Angular Frontend

```javascript
// jest.config.js (para Angular con Jest)
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@env/(.*)$': '<rootDir>/src/environments/$1',
  },
  coverageReporters: ['html', 'text', 'lcov'],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.routes.ts',
  ],
};
```

## Patrones de Testing NestJS

### Service Unit Test

```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: '1', email: 'test@test.com', name: 'Test' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createDto = { email: 'new@test.com', name: 'New User' };
      const createdUser = { id: '2', ...createDto };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(createDto);

      expect(result).toEqual(createdUser);
      expect(prisma.user.create).toHaveBeenCalledWith({ data: createDto });
    });
  });
});
```

### Controller Unit Test

```typescript
// users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const mockUser = { id: '1', email: 'test@test.com' };
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith('1');
    });
  });
});
```

### E2E Test

```typescript
// test/users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    
    // Obtener token de autenticación
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'password' });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Limpiar datos de prueba
    await prisma.user.deleteMany({ where: { email: { contains: 'e2e' } } });
  });

  describe('POST /users', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'e2e-test@test.com', name: 'E2E Test User' })
        .expect(201)
        .expect((res) => {
          expect(res.body.email).toBe('e2e-test@test.com');
          expect(res.body.id).toBeDefined();
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'invalid-email' })
        .expect(400);
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ email: 'test@test.com' })
        .expect(401);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      const user = await prisma.user.create({
        data: { email: 'e2e-get@test.com', name: 'Get Test' },
      });

      return request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('e2e-get@test.com');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

## Patrones de Testing Angular

### Component Test

```typescript
// user-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UserService } from '../services/user.service';
import { of, throwError } from 'rxjs';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UserService', ['getUsers', 'deleteUser']);

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [{ provide: UserService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    const mockUsers = [{ id: '1', name: 'Test User' }];
    userServiceSpy.getUsers.and.returnValue(of(mockUsers));

    fixture.detectChanges();

    expect(component.users()).toEqual(mockUsers);
    expect(userServiceSpy.getUsers).toHaveBeenCalled();
  });

  it('should handle error loading users', () => {
    userServiceSpy.getUsers.and.returnValue(throwError(() => new Error('Network error')));

    fixture.detectChanges();

    expect(component.error()).toBe('Error loading users');
  });
});
```

### Service Test

```typescript
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
    httpMock.verify();
  });

  it('should fetch users', () => {
    const mockUsers = [{ id: '1', name: 'Test' }];

    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should create a user', () => {
    const newUser = { name: 'New User', email: 'new@test.com' };
    const createdUser = { id: '2', ...newUser };

    service.createUser(newUser).subscribe(user => {
      expect(user).toEqual(createdUser);
    });

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUser);
    req.flush(createdUser);
  });
});
```

## Mocking Avanzado

### Mock de Prisma

```typescript
// test/prisma-mock.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

export const createMockPrisma = (): MockPrismaClient => {
  return mockDeep<PrismaClient>();
};
```

### Mock de Módulos Externos

```typescript
// Mock de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock de JWT
jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn().mockReturnValue({ sub: '1', email: 'test@test.com' }),
  })),
}));
```

## Comandos Útiles

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar con cobertura
pnpm test:cov

# Ejecutar tests E2E
pnpm test:e2e

# Ejecutar tests en modo watch
pnpm test:watch

# Ejecutar test específico
pnpm test -- --testPathPattern="users.service"

# Debug tests
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Restricciones

### DEBE HACER
- Escribir tests antes o junto con el código (TDD/BDD)
- Mantener cobertura >80% en código crítico
- Usar mocks para dependencias externas
- Limpiar datos de test después de E2E
- Nombrar tests descriptivamente
- Agrupar tests relacionados con describe

### NO DEBE HACER
- Tests que dependen del orden de ejecución
- Tests con datos compartidos mutables
- Ignorar tests fallidos
- Tests demasiado acoplados a implementación
- Olvidar verificar mocks llamados

## Skills Relacionados

- **nestjs-expert** - Testing de NestJS
- **prisma-architect** - Mock de Prisma
- **angular-architect** - Testing de Angular
