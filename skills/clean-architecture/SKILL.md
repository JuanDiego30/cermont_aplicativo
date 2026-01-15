---
name: clean-architecture
description: Experto en Clean Architecture, SOLID, y patrones hexagonales para aplicaciones enterprise. Usar para refactoring, organización de código, y patrones de diseño.
triggers:
  - architecture
  - SOLID
  - refactor
  - hexagonal
  - DDD
  - clean code
  - patterns
  - domain driven
role: specialist
scope: design
output-format: code
---

# Clean Architecture Expert

Arquitecto de software especializado en Clean Architecture y patrones enterprise.

## Rol

Arquitecto senior con 12+ años de experiencia en diseño de sistemas enterprise. Experto en Clean Architecture, patrones hexagonales, Domain-Driven Design y principios SOLID.

## Cuándo Usar Este Skill

- Diseñar arquitectura de aplicación
- Refactorizar código legacy
- Implementar separación de capas
- Aplicar principios SOLID
- Diseñar Domain-Driven Design
- Crear abstracciones limpias
- Mejorar testabilidad
- Reducir acoplamiento

## Principios SOLID

### S - Single Responsibility Principle

```typescript
// ❌ Múltiples responsabilidades
class UserService {
  async createUser(data: CreateUserDto) { /* ... */ }
  async sendWelcomeEmail(user: User) { /* ... */ }
  async generateReport(users: User[]) { /* ... */ }
}

// ✅ Una responsabilidad por clase
class UserService {
  async createUser(data: CreateUserDto): Promise<User> { /* ... */ }
}

class EmailService {
  async sendWelcomeEmail(user: User): Promise<void> { /* ... */ }
}

class UserReportService {
  async generateReport(users: User[]): Promise<Report> { /* ... */ }
}
```

### O - Open/Closed Principle

```typescript
// ❌ Modificar clase existente para cada nuevo tipo
class PaymentProcessor {
  process(payment: Payment) {
    if (payment.type === 'credit') { /* ... */ }
    else if (payment.type === 'debit') { /* ... */ }
    else if (payment.type === 'crypto') { /* ... */ }
  }
}

// ✅ Extender sin modificar
interface PaymentStrategy {
  process(amount: number): Promise<PaymentResult>;
}

class CreditCardPayment implements PaymentStrategy {
  async process(amount: number): Promise<PaymentResult> { /* ... */ }
}

class CryptoPayment implements PaymentStrategy {
  async process(amount: number): Promise<PaymentResult> { /* ... */ }
}

class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}
  
  async process(amount: number): Promise<PaymentResult> {
    return this.strategy.process(amount);
  }
}
```

### L - Liskov Substitution Principle

```typescript
// ❌ Viola LSP
class Bird {
  fly(): void { /* ... */ }
}

class Penguin extends Bird {
  fly(): void {
    throw new Error("Penguins can't fly"); // ¡Viola LSP!
  }
}

// ✅ Respeta LSP
interface Bird {
  move(): void;
}

interface FlyingBird extends Bird {
  fly(): void;
}

class Sparrow implements FlyingBird {
  move(): void { this.fly(); }
  fly(): void { /* ... */ }
}

class Penguin implements Bird {
  move(): void { /* waddle */ }
}
```

### I - Interface Segregation Principle

```typescript
// ❌ Interfaz grande que fuerza implementaciones vacías
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
}

class Robot implements Worker {
  work(): void { /* ... */ }
  eat(): void { /* No necesita */ }
  sleep(): void { /* No necesita */ }
}

// ✅ Interfaces pequeñas y específicas
interface Workable {
  work(): void;
}

interface Eatable {
  eat(): void;
}

interface Sleepable {
  sleep(): void;
}

class Human implements Workable, Eatable, Sleepable {
  work(): void { /* ... */ }
  eat(): void { /* ... */ }
  sleep(): void { /* ... */ }
}

class Robot implements Workable {
  work(): void { /* ... */ }
}
```

### D - Dependency Inversion Principle

```typescript
// ❌ Depende de implementación concreta
class UserService {
  private repository = new PostgresUserRepository();
  
  async getUser(id: string): Promise<User> {
    return this.repository.findById(id);
  }
}

// ✅ Depende de abstracción
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

class UserService {
  constructor(private repository: UserRepository) {}
  
  async getUser(id: string): Promise<User> {
    return this.repository.findById(id);
  }
}

// Implementaciones
class PostgresUserRepository implements UserRepository { /* ... */ }
class MongoUserRepository implements UserRepository { /* ... */ }
class InMemoryUserRepository implements UserRepository { /* ... */ }
```

## Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE                        │
│  (Controllers, Repositories, External Services)         │
├─────────────────────────────────────────────────────────┤
│                    APPLICATION                           │
│  (Use Cases, DTOs, Ports/Interfaces)                    │
├─────────────────────────────────────────────────────────┤
│                      DOMAIN                              │
│  (Entities, Value Objects, Domain Services)             │
└─────────────────────────────────────────────────────────┘
```

### Estructura de Carpetas

```
src/
├── domain/                    # Capa de dominio (núcleo)
│   ├── entities/              # Entidades de negocio
│   │   ├── user.entity.ts
│   │   └── order.entity.ts
│   ├── value-objects/         # Objetos de valor
│   │   ├── email.vo.ts
│   │   └── money.vo.ts
│   ├── repositories/          # Interfaces de repositorios
│   │   └── user.repository.interface.ts
│   ├── services/              # Servicios de dominio
│   │   └── pricing.domain-service.ts
│   └── errors/                # Errores de dominio
│       └── domain.errors.ts
│
├── application/               # Capa de aplicación
│   ├── use-cases/             # Casos de uso
│   │   ├── create-user/
│   │   │   ├── create-user.use-case.ts
│   │   │   ├── create-user.dto.ts
│   │   │   └── create-user.spec.ts
│   │   └── get-order/
│   │       └── get-order.use-case.ts
│   ├── ports/                 # Puertos (interfaces)
│   │   ├── input/             # Puertos de entrada
│   │   └── output/            # Puertos de salida
│   └── services/              # Servicios de aplicación
│       └── notification.service.interface.ts
│
├── infrastructure/            # Capa de infraestructura
│   ├── controllers/           # Controladores HTTP
│   │   └── user.controller.ts
│   ├── repositories/          # Implementaciones de repos
│   │   └── prisma-user.repository.ts
│   ├── services/              # Servicios externos
│   │   └── sendgrid-email.service.ts
│   ├── persistence/           # Configuración de BD
│   │   └── prisma/
│   └── config/                # Configuración
│       └── database.config.ts
│
└── shared/                    # Código compartido
    ├── guards/
    ├── interceptors/
    └── utils/
```

### Implementación de Capas

#### Domain Layer

```typescript
// domain/entities/user.entity.ts
import { Email } from '../value-objects/email.vo';

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    public name: string,
    public readonly createdAt: Date,
    private _password: string,
  ) {}

  static create(props: {
    id: string;
    email: string;
    name: string;
    password: string;
  }): User {
    const email = Email.create(props.email);
    return new User(
      props.id,
      email,
      props.name,
      new Date(),
      props.password,
    );
  }

  updateName(name: string): void {
    if (!name || name.length < 2) {
      throw new DomainError('Name must be at least 2 characters');
    }
    this.name = name;
  }

  validatePassword(password: string): boolean {
    // Lógica de validación de contraseña
    return this._password === password;
  }
}

// domain/value-objects/email.vo.ts
export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new DomainError(`Invalid email: ${email}`);
    }
    return new Email(email.toLowerCase());
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

// domain/repositories/user.repository.interface.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
```

#### Application Layer

```typescript
// application/use-cases/create-user/create-user.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IPasswordHasher } from '@application/ports/output/password-hasher.interface';
import { CreateUserDto } from './create-user.dto';

export const USER_REPOSITORY = Symbol('IUserRepository');
export const PASSWORD_HASHER = Symbol('IPasswordHasher');

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // 1. Verificar si email ya existe
    const existingUser = await this.userRepository.findByEmail(
      Email.create(dto.email),
    );
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // 2. Hashear contraseña
    const hashedPassword = await this.passwordHasher.hash(dto.password);

    // 3. Crear entidad de dominio
    const user = User.create({
      id: crypto.randomUUID(),
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
    });

    // 4. Persistir
    return this.userRepository.save(user);
  }
}
```

#### Infrastructure Layer

```typescript
// infrastructure/repositories/prisma-user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma/prisma.service';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { User } from '@domain/entities/user.entity';
import { Email } from '@domain/value-objects/email.vo';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ where: { id } });
    return data ? this.toDomain(data) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { email: email.toString() },
    });
    return data ? this.toDomain(data) : null;
  }

  async save(user: User): Promise<User> {
    const data = await this.prisma.user.upsert({
      where: { id: user.id },
      update: this.toPersistence(user),
      create: this.toPersistence(user),
    });
    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  private toDomain(data: any): User {
    return User.create({
      id: data.id,
      email: data.email,
      name: data.name,
      password: data.password,
    });
  }

  private toPersistence(user: User): any {
    return {
      id: user.id,
      email: user.email.toString(),
      name: user.name,
    };
  }
}

// infrastructure/controllers/user.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateUserUseCase } from '@application/use-cases/create-user/create-user.use-case';
import { CreateUserDto } from '@application/use-cases/create-user/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }
}
```

## Dependency Injection Setup

```typescript
// infrastructure/modules/user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { CreateUserUseCase, USER_REPOSITORY, PASSWORD_HASHER } from '@application/use-cases/create-user/create-user.use-case';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { BcryptPasswordHasher } from '../services/bcrypt-password-hasher.service';
import { PrismaModule } from '../persistence/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
  ],
})
export class UserModule {}
```

## Restricciones

### DEBE HACER
- Mantener dominio libre de dependencias externas
- Usar interfaces para todas las dependencias
- Flujo de dependencias hacia adentro
- Testear casos de uso independientemente
- Usar Value Objects para validación
- Nombrar clases por su propósito

### NO DEBE HACER
- Importar infraestructura en dominio
- Exponer entidades de BD directamente
- Lógica de negocio en controladores
- Acoplamiento a frameworks en dominio
- Ignorar invariantes de dominio

## Skills Relacionados

- **nestjs-expert** - Implementación NestJS
- **prisma-architect** - Repositorios
- **jest-testing** - Testing de use cases
