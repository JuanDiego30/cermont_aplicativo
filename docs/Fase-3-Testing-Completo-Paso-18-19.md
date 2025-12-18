# 🟢 FASE 3: TESTING COMPLETO - PASOS 18-19 (32 HORAS)

**Documento**: Plan Detallado de Testing  
**Duración**: 32 horas (Semana 6-7)  
**Prioridad**: 🟡 ALTA  
**Objetivo**: Alcanzar >70% coverage con tests unitarios y E2E  

---

## 📋 TABLA DE CONTENIDOS

1. [Paso 18: Tests Unitarios >70% (20h)](#paso-18-tests-unitarios)
2. [Paso 19: Tests E2E (12h)](#paso-19-tests-e2e)
3. [Setup y Configuración](#setup-y-configuración)
4. [Plantillas de Tests](#plantillas-de-tests)
5. [Fixtures y Mocks](#fixtures-y-mocks)
6. [CI/CD con Tests](#cicd-con-tests)
7. [Checklist de Validación](#checklist-de-validación)

---

## 🔧 SETUP Y CONFIGURACIÓN

### Instalar Dependencias de Testing

```bash
cd apps/api

# Testing frameworks
pnpm add -D @nestjs/testing
pnpm add -D jest @types/jest
pnpm add -D ts-jest

# Utilities
pnpm add -D @faker-js/faker
pnpm add -D faker-js/faker

# Coverage
pnpm add -D jest-coverage-report
```

### Configurar Jest en package.json

**Archivo**: `apps/api/package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\\\.spec\\\\.ts$",
    "transform": {
      "^.+\\\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s",
      "!**/*.module.ts",
      "!**/*.interface.ts",
      "!**/*.vo.ts",
      "!**/index.ts"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "moduleNameMapper": {
      "@/(.*)": "<rootDir>/$1"
    }
  }
}
```

### Estructura de Carpetas para Tests

```bash
mkdir -p apps/api/src/modules/ordenes/application/use-cases/__tests__
mkdir -p apps/api/src/modules/ordenes/domain/entities/__tests__
mkdir -p apps/api/src/modules/ordenes/domain/value-objects/__tests__
mkdir -p apps/api/test/e2e
mkdir -p apps/api/test/fixtures
mkdir -p apps/api/test/mocks
```

---

## 🟢 PASO 18: TESTS UNITARIOS >70% (20 HORAS)

### 18.1 Tests de Value Objects (2h)

**Archivo**: `apps/api/src/modules/ordenes/domain/value-objects/__tests__/orden-numero.vo.spec.ts`

```typescript
import { OrdenNumero } from '../orden-numero.vo';
import { InvalidOrdenNumberError } from '../../errors/invalid-orden-number.error';

describe('OrdenNumero Value Object', () => {
  describe('create', () => {
    it('debe crear un OrdenNumero válido con formato ORD-XXXXXX', () => {
      // ARRANGE
      const numeroValido = 'ORD-123456';

      // ACT
      const result = OrdenNumero.create(numeroValido);

      // ASSERT
      expect(result).toBeDefined();
      expect(result.getValue()).toBe(numeroValido);
    });

    it('debe lanzar error si el formato no es ORD-XXXXXX', () => {
      // ARRANGE
      const numeroInvalido = 'ORDER-123456';

      // ACT & ASSERT
      expect(() => OrdenNumero.create(numeroInvalido)).toThrow(
        InvalidOrdenNumberError,
      );
    });

    it('debe lanzar error si la parte numérica no tiene 6 dígitos', () => {
      // ARRANGE
      const numeroInvalido = 'ORD-12345';

      // ACT & ASSERT
      expect(() => OrdenNumero.create(numeroInvalido)).toThrow(
        InvalidOrdenNumberError,
      );
    });

    it('debe lanzar error si el número contiene caracteres no numéricos', () => {
      // ARRANGE
      const numeroInvalido = 'ORD-1234AB';

      // ACT & ASSERT
      expect(() => OrdenNumero.create(numeroInvalido)).toThrow(
        InvalidOrdenNumberError,
      );
    });

    it('debe ser immutable (no permite cambios después de creación)', () => {
      // ARRANGE
      const numero = OrdenNumero.create('ORD-123456');

      // ACT & ASSERT
      expect(() => {
        (numero as any).value = 'ORD-654321';
      }).toThrow();
    });
  });

  describe('comparison', () => {
    it('debe considerar dos OrdenNumeros iguales si tienen el mismo valor', () => {
      // ARRANGE
      const numero1 = OrdenNumero.create('ORD-123456');
      const numero2 = OrdenNumero.create('ORD-123456');

      // ACT & ASSERT
      expect(numero1.equals(numero2)).toBe(true);
    });

    it('debe considerar dos OrdenNumeros diferentes si tienen valores diferentes', () => {
      // ARRANGE
      const numero1 = OrdenNumero.create('ORD-123456');
      const numero2 = OrdenNumero.create('ORD-654321');

      // ACT & ASSERT
      expect(numero1.equals(numero2)).toBe(false);
    });
  });

  describe('generation', () => {
    it('debe generar un OrdenNumero válido con timestamp', () => {
      // ACT
      const numero = OrdenNumero.generate();

      // ASSERT
      expect(numero).toBeDefined();
      expect(numero.getValue()).toMatch(/^ORD-\d{6}$/);
    });

    it('debe generar números únicos en diferentes llamadas', () => {
      // ACT
      const numero1 = OrdenNumero.generate();
      const numero2 = OrdenNumero.generate();

      // ASSERT
      expect(numero1.getValue()).not.toBe(numero2.getValue());
    });
  });
});
```

**Archivo**: `apps/api/src/modules/ordenes/domain/value-objects/__tests__/email.vo.spec.ts`

```typescript
import { Email } from '../email.vo';
import { InvalidEmailError } from '../../errors/invalid-email.error';

describe('Email Value Object', () => {
  describe('create', () => {
    it('debe crear un Email válido', () => {
      // ARRANGE
      const emailValido = 'usuario@example.com';

      // ACT
      const result = Email.create(emailValido);

      // ASSERT
      expect(result).toBeDefined();
      expect(result.getValue()).toBe(emailValido);
    });

    it('debe lanzar error si el email no contiene @', () => {
      // ARRANGE
      const emailInvalido = 'usuarioexample.com';

      // ACT & ASSERT
      expect(() => Email.create(emailInvalido)).toThrow(InvalidEmailError);
    });

    it('debe lanzar error si el email no tiene dominio', () => {
      // ARRANGE
      const emailInvalido = 'usuario@';

      // ACT & ASSERT
      expect(() => Email.create(emailInvalido)).toThrow(InvalidEmailError);
    });

    it('debe lanzar error si el email está vacío', () => {
      // ARRANGE
      const emailInvalido = '';

      // ACT & ASSERT
      expect(() => Email.create(emailInvalido)).toThrow(InvalidEmailError);
    });

    it('debe normalizar el email a minúsculas', () => {
      // ARRANGE
      const emailConMayusculas = 'Usuario@EXAMPLE.COM';

      // ACT
      const result = Email.create(emailConMayusculas);

      // ASSERT
      expect(result.getValue()).toBe('usuario@example.com');
    });
  });

  describe('domain extraction', () => {
    it('debe extraer el dominio correctamente', () => {
      // ARRANGE
      const email = Email.create('usuario@example.com');

      // ACT
      const dominio = email.getDomain();

      // ASSERT
      expect(dominio).toBe('example.com');
    });

    it('debe extraer el usuario correctamente', () => {
      // ARRANGE
      const email = Email.create('usuario@example.com');

      // ACT
      const usuario = email.getLocalPart();

      // ASSERT
      expect(usuario).toBe('usuario');
    });
  });
});
```

### 18.2 Tests de Entities (3h)

**Archivo**: `apps/api/src/modules/ordenes/domain/entities/__tests__/orden.entity.spec.ts`

```typescript
import { Orden } from '../orden.entity';
import { OrdenNumero } from '../../value-objects/orden-numero.vo';
import { OrdenStatus } from '../../value-objects/orden-status.vo';
import { Monto } from '../../value-objects/monto.vo';
import { InvalidStateTransitionError } from '../../errors/invalid-state-transition.error';

describe('Orden Entity', () => {
  let orden: Orden;

  beforeEach(() => {
    // ARRANGE - Setup común
    orden = Orden.create({
      id: 'orden-123',
      numero: OrdenNumero.create('ORD-123456'),
      clienteId: 'cliente-123',
      tecnicoId: 'tecnico-456',
      estado: OrdenStatus.create('PENDIENTE'),
      monto: Monto.create(1000),
      titulo: 'Mantenimiento preventivo',
      descripcion: 'Revisión de equipos',
    });
  });

  describe('creation', () => {
    it('debe crear una orden con estado inicial PENDIENTE', () => {
      // ASSERT
      expect(orden.getEstado().getValue()).toBe('PENDIENTE');
    });

    it('debe crear una orden con los datos proporcionados', () => {
      // ASSERT
      expect(orden.getId()).toBe('orden-123');
      expect(orden.getNumero().getValue()).toBe('ORD-123456');
      expect(orden.getClienteId()).toBe('cliente-123');
      expect(orden.getTecnicoId()).toBe('tecnico-456');
    });
  });

  describe('state transitions', () => {
    it('debe permitir transición de PENDIENTE a EN_PROCESO', () => {
      // ACT
      orden.cambiarEstado(OrdenStatus.create('EN_PROCESO'));

      // ASSERT
      expect(orden.getEstado().getValue()).toBe('EN_PROCESO');
    });

    it('debe permitir transición de PENDIENTE a CANCELADA', () => {
      // ACT
      orden.cambiarEstado(OrdenStatus.create('CANCELADA'));

      // ASSERT
      expect(orden.getEstado().getValue()).toBe('CANCELADA');
    });

    it('debe lanzar error si la transición no es válida', () => {
      // ACT & ASSERT
      expect(() => {
        orden.cambiarEstado(OrdenStatus.create('COMPLETADA'));
      }).toThrow(InvalidStateTransitionError);
    });

    it('debe permitir transición de EN_PROCESO a COMPLETADA', () => {
      // ARRANGE
      orden.cambiarEstado(OrdenStatus.create('EN_PROCESO'));

      // ACT
      orden.cambiarEstado(OrdenStatus.create('COMPLETADA'));

      // ASSERT
      expect(orden.getEstado().getValue()).toBe('COMPLETADA');
    });

    it('debe NO permitir cambios en estado COMPLETADA (es final)', () => {
      // ARRANGE
      orden.cambiarEstado(OrdenStatus.create('EN_PROCESO'));
      orden.cambiarEstado(OrdenStatus.create('COMPLETADA'));

      // ACT & ASSERT
      expect(() => {
        orden.cambiarEstado(OrdenStatus.create('PENDIENTE'));
      }).toThrow(InvalidStateTransitionError);
    });
  });

  describe('business logic', () => {
    it('debe calcular el monto total con impuestos correctamente', () => {
      // ARRANGE
      const monto = Monto.create(1000);
      const impuesto = 0.19; // 19% IVA

      // ACT
      const total = monto.conImpuesto(impuesto);

      // ASSERT
      expect(total).toBe(1190);
    });

    it('debe permitir agregar actividades a la orden', () => {
      // ARRANGE
      const actividad = {
        id: 'actividad-1',
        descripcion: 'Revisar equipos',
        duracion: 2,
      };

      // ACT
      orden.agregarActividad(actividad);

      // ASSERT
      expect(orden.getActividades()).toHaveLength(1);
      expect(orden.getActividades()[0]).toEqual(actividad);
    });

    it('debe permitir agregar evidencias a la orden', () => {
      // ARRANGE
      const evidencia = {
        id: 'evidencia-1',
        url: 'https://example.com/foto.jpg',
        tipo: 'FOTO',
      };

      // ACT
      orden.agregarEvidencia(evidencia);

      // ASSERT
      expect(orden.getEvidencias()).toHaveLength(1);
    });
  });

  describe('domain events', () => {
    it('debe registrar evento cuando la orden cambia de estado', () => {
      // ACT
      orden.cambiarEstado(OrdenStatus.create('EN_PROCESO'));

      // ASSERT
      const eventos = orden.getDomainEvents();
      expect(eventos).toContainEqual(
        expect.objectContaining({
          type: 'OrdenStatusChangedEvent',
          data: expect.objectContaining({
            ordenId: 'orden-123',
            nuevoEstado: 'EN_PROCESO',
          }),
        }),
      );
    });
  });
});
```

### 18.3 Tests de Use Cases (7h)

**Archivo**: `apps/api/src/modules/ordenes/application/use-cases/__tests__/create-orden.use-case.spec.ts`

```typescript
import { CreateOrdenUseCase } from '../create-orden.use-case';
import { OrdenRepository } from '../../domain/repositories/orden.repository.interface';
import { UserRepository } from '../../../usuarios/domain/repositories/user.repository.interface';
import { EmailService } from '../../../email/application/email.service';
import { CreateOrdenDTO } from '../../application/dto/create-orden.dto';
import { Orden } from '../../domain/entities/orden.entity';

describe('CreateOrdenUseCase', () => {
  let useCase: CreateOrdenUseCase;
  let mockOrdenRepo: jest.Mocked<OrdenRepository>;
  let mockUserRepo: jest.Mocked<UserRepository>;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    // ARRANGE - Setup de mocks
    mockOrdenRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockUserRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
    } as any;

    mockEmailService = {
      sendEmail: jest.fn(),
    } as any;

    useCase = new CreateOrdenUseCase(
      mockOrdenRepo,
      mockUserRepo,
      mockEmailService,
    );
  });

  describe('execute', () => {
    it('debe crear una orden con datos válidos', async () => {
      // ARRANGE
      const dto: CreateOrdenDTO = {
        titulo: 'Mantenimiento preventivo',
        descripcion: 'Revisión de equipos',
        clienteId: 'cliente-123',
        tecnicoId: 'tecnico-456',
        monto: 1000,
        fechaProgramada: new Date('2025-12-25'),
      };

      const ordenEsperada = {
        id: 'orden-789',
        ...dto,
        estado: 'PENDIENTE',
      };

      mockUserRepo.findById.mockResolvedValue({
        id: 'cliente-123',
        nombre: 'Juan',
        email: 'juan@example.com',
      } as any);

      mockUserRepo.findById.mockResolvedValue({
        id: 'tecnico-456',
        nombre: 'Carlos',
        email: 'carlos@example.com',
      } as any);

      mockOrdenRepo.save.mockResolvedValue(ordenEsperada as any);

      // ACT
      const result = await useCase.execute(dto);

      // ASSERT
      expect(result).toEqual(ordenEsperada);
      expect(mockOrdenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: dto.titulo,
          clienteId: dto.clienteId,
        }),
      );
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
    });

    it('debe lanzar error si clienteId no existe', async () => {
      // ARRANGE
      const dto: CreateOrdenDTO = {
        titulo: 'Mantenimiento preventivo',
        descripcion: 'Revisión de equipos',
        clienteId: 'cliente-no-existe',
        tecnicoId: 'tecnico-456',
        monto: 1000,
        fechaProgramada: new Date('2025-12-25'),
      };

      mockUserRepo.findById.mockResolvedValue(null);

      // ACT & ASSERT
      await expect(useCase.execute(dto)).rejects.toThrow(
        'Cliente no encontrado',
      );
    });

    it('debe lanzar error si tecnicoId no existe', async () => {
      // ARRANGE
      const dto: CreateOrdenDTO = {
        titulo: 'Mantenimiento preventivo',
        descripcion: 'Revisión de equipos',
        clienteId: 'cliente-123',
        tecnicoId: 'tecnico-no-existe',
        monto: 1000,
        fechaProgramada: new Date('2025-12-25'),
      };

      mockUserRepo.findById.mockResolvedValueOnce({
        id: 'cliente-123',
      } as any);

      mockUserRepo.findById.mockResolvedValueOnce(null);

      // ACT & ASSERT
      await expect(useCase.execute(dto)).rejects.toThrow(
        'Técnico no encontrado',
      );
    });

    it('debe lanzar error si la fecha programada es en el pasado', async () => {
      // ARRANGE
      const dto: CreateOrdenDTO = {
        titulo: 'Mantenimiento preventivo',
        descripcion: 'Revisión de equipos',
        clienteId: 'cliente-123',
        tecnicoId: 'tecnico-456',
        monto: 1000,
        fechaProgramada: new Date('2020-01-01'),
      };

      // ACT & ASSERT
      await expect(useCase.execute(dto)).rejects.toThrow(
        'Fecha programada debe ser en el futuro',
      );
    });

    it('debe enviar email de confirmación al cliente', async () => {
      // ARRANGE
      const dto: CreateOrdenDTO = {
        titulo: 'Mantenimiento preventivo',
        descripcion: 'Revisión de equipos',
        clienteId: 'cliente-123',
        tecnicoId: 'tecnico-456',
        monto: 1000,
        fechaProgramada: new Date('2025-12-25'),
      };

      const clienteConEmail = {
        id: 'cliente-123',
        email: 'cliente@example.com',
        nombre: 'Juan Pérez',
      };

      mockUserRepo.findById.mockResolvedValueOnce(clienteConEmail as any);
      mockUserRepo.findById.mockResolvedValueOnce({
        id: 'tecnico-456',
      } as any);

      mockOrdenRepo.save.mockResolvedValue({
        id: 'orden-789',
        ...dto,
      } as any);

      // ACT
      await useCase.execute(dto);

      // ASSERT
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'cliente@example.com',
        subject: 'Nueva orden de trabajo creada',
        template: 'crear-orden',
        data: expect.any(Object),
      });
    });
  });

  describe('validations', () => {
    it('debe validar que el monto sea positivo', async () => {
      // ARRANGE
      const dto: CreateOrdenDTO = {
        titulo: 'Mantenimiento preventivo',
        descripcion: 'Revisión de equipos',
        clienteId: 'cliente-123',
        tecnicoId: 'tecnico-456',
        monto: -100,
        fechaProgramada: new Date('2025-12-25'),
      };

      // ACT & ASSERT
      await expect(useCase.execute(dto)).rejects.toThrow(
        'El monto debe ser positivo',
      );
    });

    it('debe validar que el título no esté vacío', async () => {
      // ARRANGE
      const dto: CreateOrdenDTO = {
        titulo: '',
        descripcion: 'Revisión de equipos',
        clienteId: 'cliente-123',
        tecnicoId: 'tecnico-456',
        monto: 1000,
        fechaProgramada: new Date('2025-12-25'),
      };

      // ACT & ASSERT
      await expect(useCase.execute(dto)).rejects.toThrow(
        'El título es requerido',
      );
    });
  });
});
```

**Archivo**: `apps/api/src/modules/ordenes/application/use-cases/__tests__/update-orden-status.use-case.spec.ts`

```typescript
import { UpdateOrdenStatusUseCase } from '../update-orden-status.use-case';
import { OrdenRepository } from '../../domain/repositories/orden.repository.interface';
import { DomainEventPublisher } from '../../../common/domain/domain-event-publisher';
import { OrdenNotFoundException } from '../../domain/exceptions/orden-not-found.exception';
import { InvalidStateTransitionError } from '../../domain/exceptions/invalid-state-transition.error';

describe('UpdateOrdenStatusUseCase', () => {
  let useCase: UpdateOrdenStatusUseCase;
  let mockOrdenRepo: jest.Mocked<OrdenRepository>;
  let mockEventPublisher: jest.Mocked<DomainEventPublisher>;

  beforeEach(() => {
    mockOrdenRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as any;

    mockEventPublisher = {
      publish: jest.fn(),
    } as any;

    useCase = new UpdateOrdenStatusUseCase(
      mockOrdenRepo,
      mockEventPublisher,
    );
  });

  describe('execute', () => {
    it('debe cambiar el estado de una orden de PENDIENTE a EN_PROCESO', async () => {
      // ARRANGE
      const ordenId = 'orden-123';
      const nuevoEstado = 'EN_PROCESO';

      const ordenExistente = {
        id: ordenId,
        estado: 'PENDIENTE',
        cambiarEstado: jest.fn(),
        getDomainEvents: jest.fn().mockReturnValue([
          { type: 'OrdenStatusChangedEvent', data: { ordenId, nuevoEstado } },
        ]),
      } as any;

      mockOrdenRepo.findById.mockResolvedValue(ordenExistente);
      mockOrdenRepo.save.mockResolvedValue({
        ...ordenExistente,
        estado: nuevoEstado,
      });

      // ACT
      const result = await useCase.execute(ordenId, nuevoEstado);

      // ASSERT
      expect(result.estado).toBe(nuevoEstado);
      expect(ordenExistente.cambiarEstado).toHaveBeenCalledWith(nuevoEstado);
      expect(mockOrdenRepo.save).toHaveBeenCalled();
      expect(mockEventPublisher.publish).toHaveBeenCalled();
    });

    it('debe lanzar error si la orden no existe', async () => {
      // ARRANGE
      mockOrdenRepo.findById.mockResolvedValue(null);

      // ACT & ASSERT
      await expect(
        useCase.execute('orden-no-existe', 'EN_PROCESO'),
      ).rejects.toThrow(OrdenNotFoundException);
    });

    it('debe lanzar error si la transición de estado es inválida', async () => {
      // ARRANGE
      const ordenExistente = {
        id: 'orden-123',
        estado: 'COMPLETADA',
        cambiarEstado: jest.fn().mockImplementation(() => {
          throw new InvalidStateTransitionError(
            'No se puede cambiar de COMPLETADA a EN_PROCESO',
          );
        }),
      } as any;

      mockOrdenRepo.findById.mockResolvedValue(ordenExistente);

      // ACT & ASSERT
      await expect(
        useCase.execute('orden-123', 'EN_PROCESO'),
      ).rejects.toThrow(InvalidStateTransitionError);
    });

    it('debe publicar evento de cambio de estado', async () => {
      // ARRANGE
      const ordenId = 'orden-123';
      const nuevoEstado = 'EN_PROCESO';

      const evento = {
        type: 'OrdenStatusChangedEvent',
        data: { ordenId, nuevoEstado },
      };

      const ordenExistente = {
        id: ordenId,
        estado: 'PENDIENTE',
        cambiarEstado: jest.fn(),
        getDomainEvents: jest.fn().mockReturnValue([evento]),
      } as any;

      mockOrdenRepo.findById.mockResolvedValue(ordenExistente);
      mockOrdenRepo.save.mockResolvedValue({
        ...ordenExistente,
        estado: nuevoEstado,
      });

      // ACT
      await useCase.execute(ordenId, nuevoEstado);

      // ASSERT
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(evento);
    });
  });
});
```

### 18.4 Tests de Services (4h)

**Archivo**: `apps/api/src/modules/dashboard/application/services/__tests__/kpi-calculator.service.spec.ts`

```typescript
import { KPICalculatorService } from '../kpi-calculator.service';
import { OrdenRepository } from '../../../ordenes/domain/repositories/orden.repository.interface';

describe('KPICalculatorService', () => {
  let service: KPICalculatorService;
  let mockOrdenRepo: jest.Mocked<OrdenRepository>;

  beforeEach(() => {
    mockOrdenRepo = {
      findMany: jest.fn(),
    } as any;

    service = new KPICalculatorService(mockOrdenRepo);
  });

  describe('calculateStats', () => {
    it('debe calcular estadísticas correctamente', async () => {
      // ARRANGE
      const ordenes = [
        { id: '1', estado: 'COMPLETADA', monto: 1000 },
        { id: '2', estado: 'COMPLETADA', monto: 2000 },
        { id: '3', estado: 'EN_PROCESO', monto: 1500 },
        { id: '4', estado: 'PENDIENTE', monto: 500 },
      ] as any;

      mockOrdenRepo.findMany.mockResolvedValue(ordenes);

      // ACT
      const stats = await service.calculateStats();

      // ASSERT
      expect(stats.totalOrdenes).toBe(4);
      expect(stats.completadas).toBe(2);
      expect(stats.enProceso).toBe(1);
      expect(stats.pendientes).toBe(1);
      expect(stats.montoTotal).toBe(5000);
    });

    it('debe retornar 0 si no hay órdenes', async () => {
      // ARRANGE
      mockOrdenRepo.findMany.mockResolvedValue([]);

      // ACT
      const stats = await service.calculateStats();

      // ASSERT
      expect(stats.totalOrdenes).toBe(0);
      expect(stats.completadas).toBe(0);
      expect(stats.montoTotal).toBe(0);
    });

    it('debe calcular porcentaje de completitud correctamente', async () => {
      // ARRANGE
      const ordenes = [
        { id: '1', estado: 'COMPLETADA' },
        { id: '2', estado: 'COMPLETADA' },
        { id: '3', estado: 'EN_PROCESO' },
        { id: '4', estado: 'PENDIENTE' },
      ] as any;

      mockOrdenRepo.findMany.mockResolvedValue(ordenes);

      // ACT
      const stats = await service.calculateStats();

      // ASSERT
      expect(stats.porcentajeCompletitud).toBe(50);
    });
  });

  describe('calculateTechnicianMetrics', () => {
    it('debe calcular métricas por técnico', async () => {
      // ARRANGE
      const ordenes = [
        { id: '1', tecnicoId: 'tech-1', estado: 'COMPLETADA' },
        { id: '2', tecnicoId: 'tech-1', estado: 'COMPLETADA' },
        { id: '3', tecnicoId: 'tech-2', estado: 'EN_PROCESO' },
      ] as any;

      mockOrdenRepo.findMany.mockResolvedValue(ordenes);

      // ACT
      const metrics = await service.calculateTechnicianMetrics();

      // ASSERT
      expect(metrics).toHaveLength(2);
      expect(metrics[0]).toEqual(
        expect.objectContaining({
          tecnicoId: 'tech-1',
          ordenesAsignadas: 2,
          completadas: 2,
        }),
      );
    });
  });
});
```

### 18.5 Verificar Coverage

```bash
cd apps/api

# Ejecutar tests con coverage
pnpm test:cov

# Generar reporte HTML
# El reporte estará en coverage/lcov-report/index.html

# Ver resumen en consola
cat coverage/coverage-summary.json
```

**Objetivos de Coverage por módulo**:
```
✅ Ordenes: >85%
✅ Auth: >90%
✅ Dashboard: >80%
✅ Email: >75%
✅ Usuarios: >75%
✅ Global: >70%
```

---

## 🟢 PASO 19: TESTS E2E (12 HORAS)

### 19.1 Configurar Testing E2E

**Archivo**: `apps/api/test/jest-e2e.json`

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^src/(.*)$": "<rootDir>/../src/$1"
  }
}
```

**Archivo**: `apps/api/test/setup.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/infrastructure/persistence/prisma.service';

export class TestSetup {
  static app: INestApplication;
  static prisma: PrismaService;

  static async setupDatabase() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await this.app.init();

    this.prisma = this.app.get<PrismaService>(PrismaService);

    // Limpiar base de datos
    await this.cleanDatabase();
  }

  static async cleanDatabase() {
    const tables = [
      'ordenes',
      'usuarios',
      'evidencias',
      'actividades',
    ];

    for (const table of tables) {
      await this.prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "${table}" CASCADE;`,
      );
    }
  }

  static async teardown() {
    await this.cleanDatabase();
    await this.app.close();
  }
}
```

**Archivo**: `apps/api/test/fixtures/usuario.fixture.ts`

```typescript
import { faker } from '@faker-js/faker';

export class UsuarioFixture {
  static crearAdmin() {
    return {
      id: faker.string.uuid(),
      nombre: 'Admin',
      email: 'admin@cermont.com',
      password: 'Admin123!',
      rol: 'ADMIN',
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static crearTecnico() {
    return {
      id: faker.string.uuid(),
      nombre: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'Tech123!',
      rol: 'TECNICO',
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static crearCliente() {
    return {
      id: faker.string.uuid(),
      nombre: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'Client123!',
      rol: 'CLIENTE',
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
```

**Archivo**: `apps/api/test/fixtures/orden.fixture.ts`

```typescript
import { faker } from '@faker-js/faker';

export class OrdenFixture {
  static crear(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      numero: `ORD-${faker.string.numeric(6)}`,
      titulo: faker.lorem.sentence(),
      descripcion: faker.lorem.paragraph(),
      clienteId: faker.string.uuid(),
      tecnicoId: faker.string.uuid(),
      estado: 'PENDIENTE',
      monto: faker.number.int({ min: 100, max: 10000 }),
      fechaProgramada: faker.date.future(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static crearMultiples(cantidad: number) {
    return Array.from({ length: cantidad }, () => this.crear());
  }
}
```

### 19.2 Tests E2E de Auth (3h)

**Archivo**: `apps/api/test/auth.e2e-spec.ts`

```typescript
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { UsuarioFixture } from './fixtures/usuario.fixture';
import { PrismaService } from '../src/common/infrastructure/persistence/prisma.service';

describe('Auth E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let usuarioAdmin: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Limpiar y preparar datos
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Usuario" CASCADE;');

    usuarioAdmin = UsuarioFixture.crearAdmin();
    await prisma.usuario.create({
      data: usuarioAdmin,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('debe retornar tokens con credenciales válidas', async () => {
      // ARRANGE
      const loginDto = {
        email: usuarioAdmin.email,
        password: usuarioAdmin.password,
      };

      // ACT
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.usuario).toHaveProperty('id');
      expect(response.body.usuario.email).toBe(usuarioAdmin.email);
    });

    it('debe retornar 401 con credenciales inválidas', async () => {
      // ARRANGE
      const loginDto = {
        email: usuarioAdmin.email,
        password: 'password-incorrecto',
      };

      // ACT
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto);

      // ASSERT
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Credenciales inválidas');
    });

    it('debe retornar 400 con email inválido', async () => {
      // ARRANGE
      const loginDto = {
        email: 'email-invalido',
        password: 'password123',
      };

      // ACT
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto);

      // ASSERT
      expect(response.status).toBe(400);
    });

    it('debe aplicar rate limiting después de 5 intentos fallidos', async () => {
      // ARRANGE
      const loginDto = {
        email: usuarioAdmin.email,
        password: 'password-incorrecto',
      };

      // ACT - 5 intentos fallidos
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto);
      }

      // ACT - 6to intento debe ser rate limited
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto);

      // ASSERT
      expect(response.status).toBe(429);
      expect(response.body.message).toMatch(/rate limit/i);
    });
  });

  describe('POST /auth/register', () => {
    it('debe registrar un nuevo usuario', async () => {
      // ARRANGE
      const registerDto = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'Password123!',
        rol: 'CLIENTE',
      };

      // ACT
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);

      // ASSERT
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.usuario.email).toBe(registerDto.email);
    });

    it('debe retornar 400 si email ya existe', async () => {
      // ARRANGE
      const registerDto = {
        nombre: 'Otro Usuario',
        email: usuarioAdmin.email, // Email ya existe
        password: 'Password123!',
        rol: 'CLIENTE',
      };

      // ACT
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/email already exists/i);
    });

    it('debe validar contraseña fuerte', async () => {
      // ARRANGE
      const registerDto = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: '123', // Contraseña muy débil
        rol: 'CLIENTE',
      };

      // ACT
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);

      // ASSERT
      expect(response.status).toBe(400);
    });
  });

  describe('GET /auth/me', () => {
    let token: string;

    beforeAll(async () => {
      // Obtener token de login
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: usuarioAdmin.email,
          password: usuarioAdmin.password,
        });

      token = loginResponse.body.accessToken;
    });

    it('debe retornar usuario actual autenticado', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.email).toBe(usuarioAdmin.email);
    });

    it('debe retornar 401 sin token', async () => {
      // ACT
      const response = await request(app.getHttpServer()).get('/auth/me');

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe retornar 401 con token inválido', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer token-invalido');

      // ASSERT
      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    let token: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: usuarioAdmin.email,
          password: usuarioAdmin.password,
        });

      token = loginResponse.body.accessToken;
    });

    it('debe logout exitosamente', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/logged out/i);
    });

    it('debe invalidar el token después de logout', async () => {
      // ACT - Intent después de logout
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      // ASSERT
      expect(response.status).toBe(401);
    });
  });
});
```

### 19.3 Tests E2E de Órdenes (4h)

**Archivo**: `apps/api/test/ordenes.e2e-spec.ts`

```typescript
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { UsuarioFixture } from './fixtures/usuario.fixture';
import { OrdenFixture } from './fixtures/orden.fixture';
import { PrismaService } from '../src/common/infrastructure/persistence/prisma.service';

describe('Órdenes E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let usuarioAdmin: any;
  let usuarioTecnico: any;
  let usuarioCliente: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Limpiar y preparar datos
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Usuario" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Order" CASCADE;');

    usuarioAdmin = UsuarioFixture.crearAdmin();
    usuarioTecnico = UsuarioFixture.crearTecnico();
    usuarioCliente = UsuarioFixture.crearCliente();

    await prisma.usuario.createMany({
      data: [usuarioAdmin, usuarioTecnico, usuarioCliente],
    });

    // Obtener token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: usuarioAdmin.email,
        password: usuarioAdmin.password,
      });

    token = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /ordenes', () => {
    it('debe crear una orden con datos válidos', async () => {
      // ARRANGE
      const createDto = {
        titulo: 'Mantenimiento preventivo',
        descripcion: 'Revisión de equipos',
        clienteId: usuarioCliente.id,
        tecnicoId: usuarioTecnico.id,
        monto: 1000,
        fechaProgramada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      // ACT
      const response = await request(app.getHttpServer())
        .post('/ordenes')
        .set('Authorization', `Bearer ${token}`)
        .send(createDto);

      // ASSERT
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.titulo).toBe(createDto.titulo);
      expect(response.body.estado).toBe('PENDIENTE');
    });

    it('debe retornar 400 si faltan campos requeridos', async () => {
      // ARRANGE
      const createDto = {
        titulo: 'Mantenimiento preventivo',
        // Falta descripción
        clienteId: usuarioCliente.id,
      };

      // ACT
      const response = await request(app.getHttpServer())
        .post('/ordenes')
        .set('Authorization', `Bearer ${token}`)
        .send(createDto);

      // ASSERT
      expect(response.status).toBe(400);
    });

    it('debe retornar 401 sin autenticación', async () => {
      // ARRANGE
      const createDto = OrdenFixture.crear();

      // ACT
      const response = await request(app.getHttpServer())
        .post('/ordenes')
        .send(createDto);

      // ASSERT
      expect(response.status).toBe(401);
    });
  });

  describe('GET /ordenes', () => {
    it('debe listar órdenes paginadas', async () => {
      // ARRANGE - Crear 5 órdenes
      const ordenes = OrdenFixture.crearMultiples(5).map(o => ({
        ...o,
        clienteId: usuarioCliente.id,
        tecnicoId: usuarioTecnico.id,
      }));

      await prisma.order.createMany({
        data: ordenes,
      });

      // ACT
      const response = await request(app.getHttpServer())
        .get('/ordenes?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('debe filtrar órdenes por estado', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get('/ordenes?estado=PENDIENTE')
        .set('Authorization', `Bearer ${token}`);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ estado: 'PENDIENTE' }),
        ]),
      );
    });
  });

  describe('GET /ordenes/:id', () => {
    let ordenId: string;

    beforeAll(async () => {
      const orden = OrdenFixture.crear({
        clienteId: usuarioCliente.id,
        tecnicoId: usuarioTecnico.id,
      });

      const created = await prisma.order.create({
        data: orden,
      });

      ordenId = created.id;
    });

    it('debe obtener una orden por ID', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get(`/ordenes/${ordenId}`)
        .set('Authorization', `Bearer ${token}`);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(ordenId);
    });

    it('debe retornar 404 si la orden no existe', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get(`/ordenes/orden-no-existe`)
        .set('Authorization', `Bearer ${token}`);

      // ASSERT
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /ordenes/:id', () => {
    let ordenId: string;

    beforeAll(async () => {
      const orden = OrdenFixture.crear({
        clienteId: usuarioCliente.id,
        tecnicoId: usuarioTecnico.id,
      });

      const created = await prisma.order.create({
        data: orden,
      });

      ordenId = created.id;
    });

    it('debe actualizar el estado de una orden', async () => {
      // ARRANGE
      const updateDto = {
        estado: 'EN_PROCESO',
      };

      // ACT
      const response = await request(app.getHttpServer())
        .patch(`/ordenes/${ordenId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateDto);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.estado).toBe('EN_PROCESO');
    });

    it('debe retornar 400 si la transición de estado es inválida', async () => {
      // ARRANGE
      const updateDto = {
        estado: 'PENDIENTE', // No se puede volver a PENDIENTE desde EN_PROCESO
      };

      // ACT
      const response = await request(app.getHttpServer())
        .patch(`/ordenes/${ordenId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateDto);

      // ASSERT
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /ordenes/:id', () => {
    let ordenId: string;

    beforeAll(async () => {
      const orden = OrdenFixture.crear({
        clienteId: usuarioCliente.id,
        tecnicoId: usuarioTecnico.id,
        estado: 'PENDIENTE',
      });

      const created = await prisma.order.create({
        data: orden,
      });

      ordenId = created.id;
    });

    it('debe eliminar una orden en estado PENDIENTE', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .delete(`/ordenes/${ordenId}`)
        .set('Authorization', `Bearer ${token}`);

      // ASSERT
      expect(response.status).toBe(200);

      // Verificar que fue eliminada
      const findResponse = await request(app.getHttpServer())
        .get(`/ordenes/${ordenId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(findResponse.status).toBe(404);
    });
  });
});
```

### 19.4 Tests E2E de Dashboard (2h)

**Archivo**: `apps/api/test/dashboard.e2e-spec.ts`

```typescript
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { UsuarioFixture } from './fixtures/usuario.fixture';
import { OrdenFixture } from './fixtures/orden.fixture';
import { PrismaService } from '../src/common/infrastructure/persistence/prisma.service';

describe('Dashboard E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Preparar datos
    const usuario = UsuarioFixture.crearAdmin();
    await prisma.usuario.create({ data: usuario });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: usuario.email,
        password: usuario.password,
      });

    token = loginResponse.body.accessToken;

    // Crear órdenes de prueba
    const ordenes = OrdenFixture.crearMultiples(10).map(o => ({
      ...o,
      clienteId: usuario.id,
      tecnicoId: usuario.id,
    }));

    await prisma.order.createMany({ data: ordenes });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /dashboard/stats', () => {
    it('debe retornar estadísticas del dashboard', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${token}`);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalOrdenes');
      expect(response.body).toHaveProperty('completadas');
      expect(response.body).toHaveProperty('enProceso');
      expect(response.body).toHaveProperty('pendientes');
      expect(response.body).toHaveProperty('montoTotal');
      expect(response.body).toHaveProperty('porcentajeCompletitud');
    });

    it('debe cachear las estadísticas', async () => {
      // ACT - Primera llamada
      const response1 = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${token}`);

      // ACT - Segunda llamada (debe venir del caché)
      const response2 = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${token}`);

      // ASSERT
      expect(response1.body).toEqual(response2.body);
      expect(response1.get('x-cache')).toBe('HIT');
    });
  });

  describe('GET /dashboard/metrics/technician', () => {
    it('debe retornar métricas por técnico', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get('/dashboard/metrics/technician')
        .set('Authorization', `Bearer ${token}`);

      // ASSERT
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('tecnicoId');
      expect(response.body[0]).toHaveProperty('ordenesAsignadas');
    });
  });
});
```

### 19.5 Configurar CI/CD con Tests

**Archivo**: `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: cermont_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run linting
        run: pnpm lint

      - name: Run unit tests
        run: pnpm test:cov
        working-directory: apps/api
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/cermont_test

      - name: Run E2E tests
        run: pnpm test:e2e
        working-directory: apps/api
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/cermont_test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./apps/api/coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella

      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./apps/api/coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

---

## ✅ CHECKLIST DE VALIDACIÓN - FASE 3

```bash
# Paso 18: Tests Unitarios
- [ ] Instalar @nestjs/testing, jest, ts-jest
- [ ] Configurar jest.config.json
- [ ] Tests de Value Objects (>85% coverage)
- [ ] Tests de Entities (>85% coverage)
- [ ] Tests de Use Cases (>80% coverage)
- [ ] Tests de Services (>75% coverage)
- [ ] Coverage global >70%
- [ ] Todos los tests pasan: pnpm test

# Paso 19: Tests E2E
- [ ] Configurar jest-e2e.json
- [ ] Crear fixtures (UsuarioFixture, OrdenFixture)
- [ ] Tests E2E Auth (login, register, logout)
- [ ] Tests E2E Órdenes (CRUD completo)
- [ ] Tests E2E Dashboard (stats, metrics)
- [ ] Tests E2E de flujo completo
- [ ] Todos los tests E2E pasan: pnpm test:e2e

# CI/CD
- [ ] Workflow GitHub Actions creado
- [ ] Tests corren en PR automáticamente
- [ ] Coverage reportado en PR
```

---

## 📊 MÉTRICAS ESPERADAS DESPUÉS DE FASE 3

```
✅ Coverage Total: >70%
✅ Tests Unitarios: ~350
✅ Tests E2E: ~50
✅ Build Time: <2 min
✅ Test Execution Time: <5 min
✅ All tests passing: ✅ 100%
```

---

**🚀 Fase 3 COMPLETADA. Proceeding to Fase 4: DOCUMENTACIÓN**
