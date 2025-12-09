# 🚀 PLAN DE ACCIÓN SEMANAL - CERMONT

**Semana 1: Diciembre 9-13, 2025**  
**Meta**: Sentar bases para MVP piloto (Ejecución + Evidencias + Reportes)

---

## 📅 DISTRIBUCIÓN DIARIA

### **LUNES 9 - SCHEMA PRISMA & DATABASE**

**Responsable**: Backend Lead  
**Horas**: 8 horas (turno completo)

#### 1️⃣ Actualizar `prisma/schema.prisma` (2 horas)

```typescript
// Agregar estos 5 modelos nuevos al schema:

model Ejecucion {
  id String @id @default(cuid())
  ordenId String @unique
  orden Orden @relation(fields: [ordenId], references: [id], onDelete: Cascade)
  tecnicoId String
  tecnico User @relation(fields: [tecnicoId], references: [id])
  estado String @default("no_iniciada") // no_iniciada, en_progreso, pausada, completada
  horaInicio DateTime?
  horaFin DateTime?
  tiempoTotalMinutos Int @default(0)
  observaciones String?
  checklistItems ChecklistItem[]
  fotografias Fotografia[]
  firma Firma?
  sincronizado Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([ordenId])
  @@index([tecnicoId])
  @@index([estado])
}

model ChecklistItem {
  id String @id @default(cuid())
  ejecucionId String
  ejecucion Ejecucion @relation(fields: [ejecucionId], references: [id], onDelete: Cascade)
  titulo String
  completado Boolean @default(false)
  completadoEn DateTime?
  observaciones String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([ejecucionId])
  @@index([completado])
}

model Fotografia {
  id String @id @default(cuid())
  ejecucionId String
  ejecucion Ejecucion @relation(fields: [ejecucionId], references: [id], onDelete: Cascade)
  url String
  s3Key String
  titulo String?
  descripcion String?
  latitude Decimal?
  longitude Decimal?
  timestamp DateTime @default(now())
  createdAt DateTime @default(now())
  @@index([ejecucionId])
  @@index([timestamp])
}

model Firma {
  id String @id @default(cuid())
  ejecucionId String @unique
  ejecucion Ejecucion @relation(fields: [ejecucionId], references: [id], onDelete: Cascade)
  svgData String @db.LongText // SVG del pad de firma
  nombreFirmante String
  cedulaFirmante String?
  timestamp DateTime @default(now())
  @@index([ejecucionId])
}

model Reporte {
  id String @id @default(cuid())
  ordenId String @unique
  orden Orden @relation(fields: [ordenId], references: [id], onDelete: Cascade)
  tipo String // "informe_tecnico", "acta_entrega", "ses", "factura"
  contenidoHtml String @db.LongText
  contenidoPdf Bytes? // PDF generado
  s3Key String? // Ubicación en S3
  estado String @default("borrador") // borrador, generado, enviado
  fechaGeneracion DateTime?
  fechaEnvio DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([ordenId])
  @@index([tipo])
  @@index([estado])
}

// Actualizar modelo Orden para agregar relaciones:
model Orden {
  // ... campos existentes ...
  
  // Nuevas relaciones:
  ejecucion Ejecucion?
  reportes Reporte[]
  costoReal Decimal? // Suma de materiales + mano de obra
  costoManoObra Decimal?
  costoMateriales Decimal?
  varianzaPorcentaje Decimal? // ((costoReal - costoEstimado) / costoEstimado) * 100
  
  // Índices mejorados:
  @@index([estado])
  @@index([asignadoA])
  @@index([fechaFinEstimada])
}

// Actualizar User para roles más específicos:
model User {
  // ... campos existentes ...
  
  // Permisos granulares por rol:
  permisos String[]
  certificaciones String[] // ["acceso_alturas", "manejo_equipos_electricos"]
  activo Boolean @default(true)
}
```

**Checklist**:
- [ ] Copiar arriba al archivo `prisma/schema.prisma`
- [ ] Ejecutar: `npx prisma format`
- [ ] Validar sintaxis: `npx prisma validate`

#### 2️⃣ Crear Migration (3 horas)

```bash
# Terminal - crear migration
npx prisma migrate dev --name "add_ejecucion_evidencias_reportes"

# Esto genera:
# prisma/migrations/[timestamp]_add_ejecucion_evidencias_reportes/migration.sql

# Verificar en PostgreSQL:
psql -h localhost -U postgres -d cermont -c "\dt"
```

**Checklist**:
- [ ] Migration generada exitosamente
- [ ] Schema sincronizado con DB real
- [ ] Prisma client regenerado (`@prisma/client`)

#### 3️⃣ Seed de datos de prueba (2 horas)

```typescript
// prisma/seed-test.ts
import { prisma } from '../src/config/database';

async function main() {
  // Limpiar datos antiguos
  await prisma.ejecucion.deleteMany();
  await prisma.orden.deleteMany();

  // Crear orden de test
  const orden = await prisma.orden.create({
    data: {
      titulo: 'Instalación Escalera - TEST',
      descripcion: 'Prueba de ejecución en campo',
      estado: 'planeacion',
      costoEstimado: 5000000,
      asignadoA: 'tecnico-001',
    },
  });

  // Crear ejecución
  const ejecucion = await prisma.ejecucion.create({
    data: {
      ordenId: orden.id,
      tecnicoId: 'tecnico-001',
      estado: 'no_iniciada',
    },
  });

  console.log('✅ Datos de test creados:', { orden, ejecucion });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

```bash
# Ejecutar seed
npx prisma db seed
# O: npx ts-node prisma/seed-test.ts
```

**Checklist**:
- [ ] Datos de test creados en DB local
- [ ] Verificar con `SELECT * FROM "Orden" LIMIT 5;`

---

### **MARTES 10 - API REST ENDPOINTS**

**Responsable**: Backend Developer  
**Horas**: 8 horas

#### 1️⃣ Crear `modules/ejecucion/ejecucion.repository.ts` (2 horas)

```typescript
import { prisma } from '../../config/database';
import { Ejecucion, ChecklistItem } from '@prisma/client';

export class EjecucionRepository {
  async iniciar(ordenId: string, tecnicoId: string): Promise<Ejecucion> {
    return prisma.ejecucion.create({
      data: {
        ordenId,
        tecnicoId,
        horaInicio: new Date(),
        estado: 'en_progreso',
      },
    });
  }

  async getEjecucion(id: string) {
    return prisma.ejecucion.findUnique({
      where: { id },
      include: {
        checklistItems: true,
        fotografias: true,
        firma: true,
      },
    });
  }

  async agregarChecklistItem(ejecucionId: string, titulo: string): Promise<ChecklistItem> {
    return prisma.checklistItem.create({
      data: {
        ejecucionId,
        titulo,
        completado: false,
      },
    });
  }

  async completarChecklistItem(itemId: string): Promise<ChecklistItem> {
    return prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        completado: true,
        completadoEn: new Date(),
      },
    });
  }

  async agregarFotografia(ejecucionId: string, url: string, s3Key: string, lat?: number, lon?: number) {
    return prisma.fotografia.create({
      data: {
        ejecucionId,
        url,
        s3Key,
        latitude: lat ? new Prisma.Decimal(lat) : null,
        longitude: lon ? new Prisma.Decimal(lon) : null,
      },
    });
  }

  async completarEjecucion(id: string, observaciones?: string): Promise<Ejecucion> {
    const ejecucion = await this.getEjecucion(id);
    if (!ejecucion) throw new Error('Ejecución no encontrada');

    const horaFin = new Date();
    const minutos = Math.round((horaFin.getTime() - ejecucion.horaInicio!.getTime()) / 60000);

    return prisma.ejecucion.update({
      where: { id },
      data: {
        estado: 'completada',
        horaFin,
        tiempoTotalMinutos: minutos,
        observaciones,
      },
    });
  }
}

export const ejecucionRepository = new EjecucionRepository();
```

**Checklist**:
- [ ] Archivo creado con 5 métodos CRUD
- [ ] Tipos Prisma importados correctamente
- [ ] Sin errores de compilación

#### 2️⃣ Crear `modules/ejecucion/ejecucion.service.ts` (2 horas)

```typescript
import { ejecucionRepository } from './ejecucion.repository';
import { logger } from '../../shared/utils/logger';
import { AppError } from '../../shared/errors';

export class EjecucionService {
  private repository = ejecucionRepository;

  async iniciarEjecucion(ordenId: string, tecnicoId: string) {
    logger.info('Iniciando ejecución', { ordenId, tecnicoId });
    
    // Validar que orden existe y está en estado correcto
    const orden = await prisma.orden.findUnique({ where: { id: ordenId } });
    if (!orden) throw new AppError('Orden no encontrada', 404);
    if (orden.estado !== 'planeacion' && orden.estado !== 'en_ejecucion') {
      throw new AppError(`No se puede ejecutar orden en estado: ${orden.estado}`, 400);
    }

    const ejecucion = await this.repository.iniciar(ordenId, tecnicoId);
    
    // Actualizar estado de orden
    await prisma.orden.update({
      where: { id: ordenId },
      data: { estado: 'en_ejecucion' },
    });

    logger.info('Ejecución iniciada', { ejecucionId: ejecucion.id });
    return ejecucion;
  }

  async registrarChecklistItem(ejecucionId: string, titulo: string) {
    logger.info('Agregando item a checklist', { ejecucionId, titulo });
    return this.repository.agregarChecklistItem(ejecucionId, titulo);
  }

  async marcarChecklistItem(itemId: string) {
    logger.info('Marcando item como completado', { itemId });
    return this.repository.completarChecklistItem(itemId);
  }

  async completarEjecucion(id: string, observaciones?: string, firmaData?: string) {
    logger.info('Completando ejecución', { ejecucionId: id });
    
    const ejecucion = await this.repository.completarEjecucion(id, observaciones);

    // Guardar firma si se proporciona
    if (firmaData) {
      await prisma.firma.create({
        data: {
          ejecucionId: id,
          svgData: firmaData,
          nombreFirmante: 'Por asignar',
          timestamp: new Date(),
        },
      });
    }

    // Actualizar estado de orden a completada
    await prisma.orden.update({
      where: { id: ejecucion.ordenId },
      data: { estado: 'completada' },
    });

    logger.info('Ejecución completada', { ejecucionId: id });
    return ejecucion;
  }
}

export const ejecucionService = new EjecucionService();
```

**Checklist**:
- [ ] Service implementado con validaciones
- [ ] Logging en puntos críticos
- [ ] Manejo de errores con AppError

#### 3️⃣ Crear `modules/ejecucion/ejecucion.controller.ts` (2 horas)

```typescript
import { Request, Response, NextFunction } from 'express';
import { ejecucionService } from './ejecucion.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class EjecucionController {
  iniciarEjecucion = asyncHandler(async (req: Request, res: Response) => {
    const { ordenId } = req.params;
    const tecnicoId = req.user?.userId;

    if (!tecnicoId) throw new Error('No autenticado');

    const ejecucion = await ejecucionService.iniciarEjecucion(ordenId, tecnicoId);
    res.status(201).json({ status: 'success', data: ejecucion });
  });

  getEjecucion = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const ejecucion = await ejecucionService.getEjecucion(id);
    res.json({ status: 'success', data: ejecucion });
  });

  agregarChecklistItem = asyncHandler(async (req: Request, res: Response) => {
    const { ejecucionId } = req.params;
    const { titulo } = req.body;

    const item = await ejecucionService.registrarChecklistItem(ejecucionId, titulo);
    res.status(201).json({ status: 'success', data: item });
  });

  marcarChecklistItem = asyncHandler(async (req: Request, res: Response) => {
    const { itemId } = req.params;
    const item = await ejecucionService.marcarChecklistItem(itemId);
    res.json({ status: 'success', data: item });
  });

  completarEjecucion = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { observaciones, firmaData } = req.body;

    const ejecucion = await ejecucionService.completarEjecucion(id, observaciones, firmaData);
    res.json({ status: 'success', data: ejecucion });
  });
}

export const ejecucionController = new EjecucionController();
```

**Checklist**:
- [ ] Controller implementado con asyncHandler
- [ ] Todos los endpoints documentados
- [ ] Validación de entrada (userId, params)

#### 4️⃣ Crear `modules/ejecucion/ejecucion.routes.ts` (2 horas)

```typescript
import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import { ejecucionController } from './ejecucion.controller';

const router = Router();

// Todos requieren autenticación
router.use(authMiddleware);

// POST /api/ejecucion/:ordenId/iniciar
router.post('/:ordenId/iniciar', ejecucionController.iniciarEjecucion);

// GET /api/ejecucion/:id
router.get('/:id', ejecucionController.getEjecucion);

// POST /api/ejecucion/:ejecucionId/checklist
router.post('/:ejecucionId/checklist', ejecucionController.agregarChecklistItem);

// PATCH /api/ejecucion/checklist/:itemId
router.patch('/checklist/:itemId', ejecucionController.marcarChecklistItem);

// PATCH /api/ejecucion/:id/completar
router.patch('/:id/completar', ejecucionController.completarEjecucion);

export default router;
```

**Checklist**:
- [ ] Rutas registradas correctamente
- [ ] Orden de rutas (specific antes de generic)
- [ ] Middleware aplicado

---

### **MIÉRCOLES 11 - FRONTEND COMPONENTS**

**Responsable**: Frontend Developer  
**Horas**: 8 horas

#### 1️⃣ Crear `components/ejecucion/mobile-checklist.tsx` (3 horas)

```typescript
'use client';

import { useState } from 'react';
import { Check, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEjecucion } from '@/hooks/use-ejecucion';

interface MobileChecklistProps {
  ejecucionId: string;
  ordenId: string;
}

export function MobileChecklist({ ejecucionId, ordenId }: MobileChecklistProps) {
  const { ejecucion, agregarItem, marcarItem, isLoading } = useEjecucion(ejecucionId);
  const [nuevoItem, setNuevoItem] = useState('');

  const handleAgregar = async () => {
    if (!nuevoItem.trim()) return;
    await agregarItem(nuevoItem);
    setNuevoItem('');
  };

  if (!ejecucion) return <div>Cargando...</div>;

  const completados = ejecucion.checklistItems?.filter(i => i.completado).length || 0;
  const total = ejecucion.checklistItems?.length || 0;
  const porcentaje = total > 0 ? (completados / total) * 100 : 0;

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h2 className="font-bold text-lg">Orden #{ordenId.slice(-4)}</h2>
        <p className="text-sm text-gray-600">{ejecucion.estado}</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progreso</span>
          <span className="font-bold">{completados}/{total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {ejecucion.checklistItems?.map((item) => (
          <button
            key={item.id}
            onClick={() => marcarItem(item.id)}
            className={`w-full p-3 rounded-lg text-left flex items-center gap-3 ${
              item.completado
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            } border`}
            disabled={isLoading}
          >
            <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${
              item.completado ? 'bg-green-500 border-green-500' : 'border-gray-300'
            }`}>
              {item.completado && <Check className="w-4 h-4 text-white" />}
            </div>
            <span className={item.completado ? 'line-through text-gray-500' : ''}>
              {item.titulo}
            </span>
          </button>
        ))}
      </div>

      {/* Agregar Item */}
      <div className="flex gap-2 pt-4 border-t">
        <input
          type="text"
          placeholder="Nuevo ítem..."
          value={nuevoItem}
          onChange={(e) => setNuevoItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAgregar()}
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
          disabled={isLoading}
        />
        <Button
          onClick={handleAgregar}
          disabled={!nuevoItem.trim() || isLoading}
          size="sm"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
```

**Checklist**:
- [ ] Component renderiza correctamente
- [ ] Interacción con hooks funciona
- [ ] Responsive (mobile-first)

#### 2️⃣ Crear `hooks/use-ejecucion.ts` (3 horas)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ejecucionApi } from '@/features/ejecucion/api/ejecucion.api';

export function useEjecucion(ejecucionId: string) {
  const queryClient = useQueryClient();

  const { data: ejecucion, isLoading } = useQuery({
    queryKey: ['ejecucion', ejecucionId],
    queryFn: () => ejecucionApi.getEjecucion(ejecucionId),
  });

  const agregarItemMutation = useMutation({
    mutationFn: (titulo: string) =>
      ejecucionApi.agregarChecklistItem(ejecucionId, titulo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ejecucion', ejecucionId] });
    },
  });

  const marcarItemMutation = useMutation({
    mutationFn: (itemId: string) => ejecucionApi.marcarChecklistItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ejecucion', ejecucionId] });
    },
  });

  return {
    ejecucion,
    isLoading,
    agregarItem: agregarItemMutation.mutate,
    marcarItem: marcarItemMutation.mutate,
  };
}
```

**Checklist**:
- [ ] Hook implementado con React Query
- [ ] Manejo de mutaciones
- [ ] Cache invalidation

#### 3️⃣ Crear `features/ejecucion/api/ejecucion.api.ts` (2 horas)

```typescript
import { apiClient } from '@/lib/api';

export const ejecucionApi = {
  iniciar: (ordenId: string) =>
    apiClient.post(`/ejecucion/${ordenId}/iniciar`, {}),

  getEjecucion: (ejecucionId: string) =>
    apiClient.get(`/ejecucion/${ejecucionId}`),

  agregarChecklistItem: (ejecucionId: string, titulo: string) =>
    apiClient.post(`/ejecucion/${ejecucionId}/checklist`, { titulo }),

  marcarChecklistItem: (itemId: string) =>
    apiClient.patch(`/ejecucion/checklist/${itemId}`, {}),

  completar: (ejecucionId: string, observaciones?: string, firmaData?: string) =>
    apiClient.patch(`/ejecucion/${ejecucionId}/completar`, {
      observaciones,
      firmaData,
    }),
};
```

**Checklist**:
- [ ] API client completado
- [ ] Tipado correcto
- [ ] Métodos alineados con backend

---

### **JUEVES 12 - TESTING & INTEGRATION**

**Responsable**: QA/Backend  
**Horas**: 8 horas

#### 1️⃣ Tests Unitarios para Service (3 horas)

```typescript
// modules/ejecucion/ejecucion.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EjecucionService } from './ejecucion.service';

describe('EjecucionService', () => {
  let service: EjecucionService;

  beforeEach(() => {
    service = new EjecucionService();
  });

  it('should iniciar ejecución successfully', async () => {
    const result = await service.iniciarEjecucion('orden-123', 'tecnico-001');
    expect(result).toHaveProperty('id');
    expect(result.estado).toBe('en_progreso');
  });

  it('should add checklist item', async () => {
    const result = await service.registrarChecklistItem('ejecucion-123', 'Item 1');
    expect(result.titulo).toBe('Item 1');
    expect(result.completado).toBe(false);
  });

  it('should mark item as completed', async () => {
    const result = await service.marcarChecklistItem('item-123');
    expect(result.completado).toBe(true);
    expect(result.completadoEn).toBeDefined();
  });
});
```

**Checklist**:
- [ ] Tests corriendo: `npm run test`
- [ ] 80%+ coverage del service
- [ ] Todos pasando

#### 2️⃣ Tests de Integration (3 horas)

```typescript
// modules/ejecucion/ejecucion.integration.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app';

describe('Ejecucion Routes', () => {
  let token: string;
  let ordenId: string;
  let ejecucionId: string;

  beforeAll(async () => {
    // Login y obtener token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password123' });
    token = res.body.token;

    // Crear orden de test
    const ordenRes = await request(app)
      .post('/api/ordenes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titulo: 'Test Orden',
        estado: 'planeacion',
        costoEstimado: 1000000,
      });
    ordenId = ordenRes.body.data.id;
  });

  it('POST /api/ejecucion/:ordenId/iniciar - should start execution', async () => {
    const res = await request(app)
      .post(`/api/ejecucion/${ordenId}/iniciar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    ejecucionId = res.body.data.id;
  });

  it('POST /api/ejecucion/:ejecucionId/checklist - should add item', async () => {
    const res = await request(app)
      .post(`/api/ejecucion/${ejecucionId}/checklist`)
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Verificar herramientas' });

    expect(res.status).toBe(201);
    expect(res.body.data.titulo).toBe('Verificar herramientas');
  });

  it('PATCH /api/ejecucion/:id/completar - should complete execution', async () => {
    const res = await request(app)
      .patch(`/api/ejecucion/${ejecucionId}/completar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ observaciones: 'Todo completado OK' });

    expect(res.status).toBe(200);
    expect(res.body.data.estado).toBe('completada');
  });
});
```

**Checklist**:
- [ ] Endpoints testeados end-to-end
- [ ] Status codes correctos
- [ ] Data validation funciona

#### 3️⃣ Documentación API (2 horas)

```bash
# Crear README.md con ejemplos CURL

## Ejecución Endpoints

### 1. Iniciar Ejecución
```bash
curl -X POST http://localhost:3001/api/ejecucion/:ordenId/iniciar \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

# Response:
{
  "status": "success",
  "data": {
    "id": "exec-123",
    "ordenId": "orden-123",
    "estado": "en_progreso",
    "horaInicio": "2025-12-12T10:00:00Z"
  }
}
```

### 2. Agregar Item al Checklist
```bash
curl -X POST http://localhost:3001/api/ejecucion/exec-123/checklist \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Verificar herramientas"}'
```

### 3. Marcar Item como Completado
```bash
curl -X PATCH http://localhost:3001/api/ejecucion/checklist/item-123 \
  -H "Authorization: Bearer TOKEN"
```

### 4. Completar Ejecución
```bash
curl -X PATCH http://localhost:3001/api/ejecucion/exec-123/completar \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"observaciones": "Trabajo completado"}'
```
```

**Checklist**:
- [ ] Documentación en `docs/API.md`
- [ ] Ejemplos CURL funcionales
- [ ] Parámetros documentados

---

### **VIERNES 13 - VALIDACIÓN & REVISIÓN**

**Responsable**: Tech Lead  
**Horas**: 8 horas

#### 1️⃣ QA Manual (3 horas)

Ejecutar flujo completo:
1. [ ] Login exitoso
2. [ ] Crear orden
3. [ ] Iniciar ejecución
4. [ ] Agregar 5 items al checklist
5. [ ] Marcar 3 items como completados
6. [ ] Completar ejecución
7. [ ] Verificar en BD que orden está en estado "completada"

#### 2️⃣ Performance Testing (2 horas)

```bash
# Simular 100 requests en paralelo
npm install -D autocannon

# Test básico
autocannon http://localhost:3001/api/ejecucion/exec-123 \
  -c 10 \
  -d 30 \
  -R 100

# Resultados esperados:
# Latency p99 < 200ms
# Errores: 0
```

#### 3️⃣ Code Review & Documentación (3 horas)

- [ ] Revisar todos los PRs
- [ ] Feedback/Changes si es necesario
- [ ] Merge a `main`
- [ ] Actualizar `CHANGELOG.md`
- [ ] Crear tag v0.2.0

```markdown
## [0.2.0] - 2025-12-13

### Added
- Módulo Ejecución en Campo (MVP)
  - Iniciar ejecución
  - Agregar/completar checklist items
  - Captura de datos offline-ready
  
- Frontend Components
  - Mobile checklist component
  - Real-time sync con server

### Tests
- 80+ tests unitarios
- Integration tests completos

### Documentación
- API documentation
- Component stories
```

---

## 📊 DELIVERABLES ESPERADOS AL VIERNES 13

```
✅ Completado Semana 1:
├── Backend (60% del módulo Ejecución)
│   ├── Schema Prisma actualizado
│   ├── Migrations ejecutadas
│   ├── Repository CRUD completo
│   ├── Service con lógica de negocio
│   ├── Controller con endpoints
│   ├── Routes configuradas
│   └── Tests >80% coverage
│
├── Frontend (40% del módulo Ejecución)
│   ├── Mobile Checklist Component
│   ├── Custom Hook useEjecucion
│   ├── API Client ejecucionApi
│   └── Básico pero funcional
│
├── Testing
│   ├── Unit Tests (Service)
│   ├── Integration Tests (API)
│   ├── Manual QA checklist
│   └── Performance baseline
│
└── Documentación
    ├── API Endpoints documented
    ├── Component Storybook
    ├── Setup Guide
    └── Changelog actualizado
```

---

## 🔄 PRÓXIMA SEMANA (16-20 Diciembre)

**Enfoque**: Completar módulos críticos para piloto

- **Lunes 16**: Módulo Evidencias (Fotos + Geolocalización)
- **Martes 17**: Reportes & PDF Generator (Informe + Acta)
- **Miércoles 18**: Offline/Online Sync
- **Jueves 19**: Testing Completo
- **Viernes 20**: Validación Piloto (2 usuarios)

---

## 💡 TIPS IMPORTANTES

1. **Git Workflow**:
   ```bash
   git checkout -b feature/ejecucion-modulo
   # ... código ...
   git add .
   git commit -m "feat: implementar módulo ejecución MVP"
   git push origin feature/ejecucion-modulo
   # → Crear PR para review
   ```

2. **Testing Antes de Commit**:
   ```bash
   npm run lint      # Revisar sintaxis
   npm run test      # Ejecutar tests
   npm run build     # Compilar TS
   ```

3. **Debug Local**:
   ```bash
   # Terminal 1 - Backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd web && npm run dev
   
   # Terminal 3 - Tests
   npm run test:watch
   ```

4. **Sincronizar con Cambios de Compañeros**:
   ```bash
   git pull origin main --rebase
   npm install  # Si hay nuevas dependencias
   ```

---

**¿Listo para empezar? 🚀**

Inicia el LUNES con el Paso 1 (Schema Prisma). Si necesitas ayuda con cualquier archivo, avísame.
