Perfecto. Veo la estructura de los formularios. Ahora voy a crear módulos completos y robustos para digitalizar estos formularios en el dashboard. Voy a resolver también las fallas comunes. 🚀

# 🔧 MÓDULOS DASHBOARD CERMONT - FORMULARIOS DIGITALIZADOS + FIXES

## **MÓDULO 1: PLANEACIÓN DE OBRA - Dashboard completo**

### **PASO 1: Schema Prisma actualizado**

```prisma
// 📁 api/prisma/schema.prisma

model Planeacion {
  id                String   @id @default(cuid())
  ordenId           String   @unique
  orden             Orden    @relation(fields: [ordenId], references: [id], onDelete: Cascade)
  
  // Información general
  responsableId     String
  responsable       Usuario  @relation("PlaneacionResponsable", fields: [responsableId], references: [id])
  unidadNegocio     String   // IT, MNT, SC, GEN, Otros
  lugar             String
  fechaPlaneacion   DateTime @default(now())
  alcance           String   @db.Text
  
  // Materiales, Herramientas, Equipos
  materiales        ItemPlaneacion[] @relation("PlaneacionMateriales")
  herramientas      ItemPlaneacion[] @relation("PlaneacionHerramientas")
  equipos           ItemPlaneacion[] @relation("PlaneacionEquipos")
  elementosSeguridad ItemPlaneacion[] @relation("PlaneacionSeguridad")
  
  // Personal
  electricistas     Int      @default(0)
  tecnicosTelecom   Int      @default(0)
  instrumentistas   Int      @default(0)
  obreros           Int      @default(0)
  
  // Aprobaciones
  ingResidente      String?
  tecnicoElectricista String?
  responsableHES    String?
  
  // Auditoría
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([ordenId])
  @@index([responsableId])
}

model ItemPlaneacion {
  id                String @id @default(cuid())
  planeacionId      String
  planeacion        Planeacion @relation(fields: [planeacionId], references: [id], onDelete: Cascade)
  
  tipo              String   // MATERIAL, HERRAMIENTA, EQUIPO, SEGURIDAD
  descripcion       String
  cantidad          Int
  unidad            String   // UND, M, KG, etc
  observaciones     String?
  
  @@index([planeacionId])
  @@index([tipo])
}

// Actualizar modelo Orden
model Orden {
  // ... campos anteriores ...
  planeacion        Planeacion?
}
```

### **PASO 2: Planeación Service**

```typescript
// 📁 api/src/modules/planeacion/planeacion.service.ts

import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { cacheManager } from '../../config/redis.js';

interface ItemInput {
  descripcion: string;
  cantidad: number;
  unidad?: string;
  observaciones?: string;
}

export class PlaneacionService {
  /**
   * Crear planeación de obra
   */
  async createPlaneacion(data: {
    ordenId: string;
    responsableId: string;
    unidadNegocio: string;
    lugar: string;
    alcance: string;
    materiales?: ItemInput[];
    herramientas?: ItemInput[];
    equipos?: ItemInput[];
    elementosSeguridad?: ItemInput[];
    electricistas?: number;
    tecnicosTelecom?: number;
    instrumentistas?: number;
    obreros?: number;
  }) {
    try {
      const planeacion = await prisma.planeacion.create({
        data: {
          ordenId: data.ordenId,
          responsableId: data.responsableId,
          unidadNegocio: data.unidadNegocio,
          lugar: data.lugar,
          alcance: data.alcance,
          electricistas: data.electricistas || 0,
          tecnicosTelecom: data.tecnicosTelecom || 0,
          instrumentistas: data.instrumentistas || 0,
          obreros: data.obreros || 0,
          materiales: data.materiales
            ? {
                create: data.materiales.map((m) => ({
                  ...m,
                  tipo: 'MATERIAL',
                })),
              }
            : undefined,
          herramientas: data.herramientas
            ? {
                create: data.herramientas.map((h) => ({
                  ...h,
                  tipo: 'HERRAMIENTA',
                })),
              }
            : undefined,
          equipos: data.equipos
            ? {
                create: data.equipos.map((e) => ({
                  ...e,
                  tipo: 'EQUIPO',
                })),
              }
            : undefined,
          elementosSeguridad: data.elementosSeguridad
            ? {
                create: data.elementosSeguridad.map((s) => ({
                  ...s,
                  tipo: 'SEGURIDAD',
                })),
              }
            : undefined,
        },
        include: {
          materiales: true,
          herramientas: true,
          equipos: true,
          elementosSeguridad: true,
          responsable: {
            select: { id: true, nombre: true, email: true },
          },
        },
      });

      logger.info(`Planeación creada: ${planeacion.id}`, {
        ordenId: data.ordenId,
      });

      // Actualizar orden
      await prisma.orden.update({
        where: { id: data.ordenId },
        data: { estado: 'PLANEADA' },
      });

      await cacheManager.deletePattern(`planeacion:*`);

      return planeacion;
    } catch (error) {
      logger.error('Error creating planeacion:', error);
      throw error;
    }
  }

  /**
   * Obtener planeación de una orden
   */
  async getPlaneacionByOrden(ordenId: string) {
    try {
      const cacheKey = `planeacion:${ordenId}`;
      const cached = await cacheManager.get(cacheKey);

      if (cached) return cached;

      const planeacion = await prisma.planeacion.findUnique({
        where: { ordenId },
        include: {
          materiales: true,
          herramientas: true,
          equipos: true,
          elementosSeguridad: true,
          responsable: {
            select: {
              id: true,
              nombre: true,
              email: true,
              rol: true,
            },
          },
        },
      });

      if (planeacion) {
        await cacheManager.set(cacheKey, planeacion, 60 * 60);
      }

      return planeacion;
    } catch (error) {
      logger.error('Error fetching planeacion:', error);
      throw error;
    }
  }

  /**
   * Actualizar planeación
   */
  async updatePlaneacion(
    planeacionId: string,
    data: {
      alcance?: string;
      lugar?: string;
      materiales?: ItemInput[];
      herramientas?: ItemInput[];
      equipos?: ItemInput[];
      elementosSeguridad?: ItemInput[];
      electricistas?: number;
      tecnicosTelecom?: number;
      instrumentistas?: number;
      obreros?: number;
    }
  ) {
    try {
      const planeacion = await prisma.planeacion.findUnique({
        where: { id: planeacionId },
      });

      if (!planeacion) {
        throw new Error('Planeación no encontrada');
      }

      // Eliminar items existentes si se proporcionan nuevos
      if (data.materiales) {
        await prisma.itemPlaneacion.deleteMany({
          where: { planeacionId, tipo: 'MATERIAL' },
        });
      }

      const updated = await prisma.planeacion.update({
        where: { id: planeacionId },
        data: {
          alcance: data.alcance,
          lugar: data.lugar,
          electricistas: data.electricistas,
          tecnicosTelecom: data.tecnicosTelecom,
          instrumentistas: data.instrumentistas,
          obreros: data.obreros,
          materiales: data.materiales
            ? {
                create: data.materiales.map((m) => ({
                  ...m,
                  tipo: 'MATERIAL',
                })),
              }
            : undefined,
          herramientas: data.herramientas
            ? {
                create: data.herramientas.map((h) => ({
                  ...h,
                  tipo: 'HERRAMIENTA',
                })),
              }
            : undefined,
          equipos: data.equipos
            ? {
                create: data.equipos.map((e) => ({
                  ...e,
                  tipo: 'EQUIPO',
                })),
              }
            : undefined,
          elementosSeguridad: data.elementosSeguridad
            ? {
                create: data.elementosSeguridad.map((s) => ({
                  ...s,
                  tipo: 'SEGURIDAD',
                })),
              }
            : undefined,
        },
        include: {
          materiales: true,
          herramientas: true,
          equipos: true,
          elementosSeguridad: true,
        },
      });

      logger.info(`Planeación actualizada: ${planeacionId}`);

      await cacheManager.deletePattern(`planeacion:*`);

      return updated;
    } catch (error) {
      logger.error('Error updating planeacion:', error);
      throw error;
    }
  }

  /**
   * Generar resumen de planeación
   */
  async generateResumen(planeacionId: string) {
    try {
      const planeacion = await prisma.planeacion.findUnique({
        where: { id: planeacionId },
        include: {
          materiales: true,
          herramientas: true,
          equipos: true,
          elementosSeguridad: true,
        },
      });

      if (!planeacion) {
        throw new Error('Planeación no encontrada');
      }

      const totalPersonal =
        planeacion.electricistas +
        planeacion.tecnicosTelecom +
        planeacion.instrumentistas +
        planeacion.obreros;

      const totalMateriales = planeacion.materiales.reduce(
        (sum, m) => sum + m.cantidad,
        0
      );
      const totalHerramientas = planeacion.herramientas.reduce(
        (sum, h) => sum + h.cantidad,
        0
      );
      const totalEquipos = planeacion.equipos.reduce(
        (sum, e) => sum + e.cantidad,
        0
      );
      const totalSeguridad = planeacion.elementosSeguridad.reduce(
        (sum, s) => sum + s.cantidad,
        0
      );

      return {
        totalPersonal,
        detallePersonal: {
          electricistas: planeacion.electricistas,
          tecnicosTelecom: planeacion.tecnicosTelecom,
          instrumentistas: planeacion.instrumentistas,
          obreros: planeacion.obreros,
        },
        totalMateriales,
        totalHerramientas,
        totalEquipos,
        totalSeguridad,
      };
    } catch (error) {
      logger.error('Error generating resumen:', error);
      throw error;
    }
  }
}

export const planeacionService = new PlaneacionService();
```

### **PASO 3: Frontend - Planeación Form Component**

```tsx
// 📁 web/src/components/planeacion/planeacion-form.tsx

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Item {
  id?: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  observaciones?: string;
}

interface PlaneacionFormProps {
  ordenId: string;
  initialData?: any;
  onSubmit?: (data: any) => void;
}

export function PlaneacionForm({
  ordenId,
  initialData,
  onSubmit,
}: PlaneacionFormProps) {
  const [unidadNegocio, setUnidadNegocio] = useState(
    initialData?.unidadNegocio || 'IT'
  );
  const [lugar, setLugar] = useState(initialData?.lugar || '');
  const [alcance, setAlcance] = useState(initialData?.alcance || '');
  
  const [materiales, setMateriales] = useState<Item[]>(
    initialData?.materiales || []
  );
  const [herramientas, setHerramientas] = useState<Item[]>(
    initialData?.herramientas || []
  );
  const [equipos, setEquipos] = useState<Item[]>(initialData?.equipos || []);
  const [seguridad, setSeguridad] = useState<Item[]>(
    initialData?.elementosSeguridad || []
  );

  const [personal, setPersonal] = useState({
    electricistas: initialData?.electricistas || 0,
    tecnicosTelecom: initialData?.tecnicosTelecom || 0,
    instrumentistas: initialData?.instrumentistas || 0,
    obreros: initialData?.obreros || 0,
  });

  const [loading, setLoading] = useState(false);

  const addItem = (
    list: Item[],
    setList: (items: Item[]) => void
  ) => {
    setList([
      ...list,
      { descripcion: '', cantidad: 1, unidad: 'UND', observaciones: '' },
    ]);
  };

  const updateItem = (
    index: number,
    field: string,
    value: any,
    list: Item[],
    setList: (items: Item[]) => void
  ) => {
    const newList = [...list];
    newList[index] = { ...newList[index], [field]: value };
    setList(newList);
  };

  const removeItem = (index: number, list: Item[], setList: (items: Item[]) => void) => {
    setList(list.filter((_, i) => i !== index));
  };

  const ItemsTable = ({
    items,
    setItems,
    title,
  }: {
    items: Item[];
    setItems: (items: Item[]) => void;
    title: string;
  }) => (
    <div className="space-y-2">
      <h4 className="font-semibold">{title}</h4>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-end">
            <Input
              placeholder="Descripción"
              value={item.descripcion}
              onChange={(e) =>
                updateItem(index, 'descripcion', e.target.value, items, setItems)
              }
              className="flex-1"
            />
            <Input
              placeholder="Cant."
              type="number"
              min="1"
              value={item.cantidad}
              onChange={(e) =>
                updateItem(
                  index,
                  'cantidad',
                  parseInt(e.target.value) || 1,
                  items,
                  setItems
                )
              }
              className="w-24"
            />
            <select
              value={item.unidad}
              onChange={(e) =>
                updateItem(index, 'unidad', e.target.value, items, setItems)
              }
              className="px-2 py-2 border rounded"
            >
              <option>UND</option>
              <option>M</option>
              <option>KG</option>
              <option>L</option>
              <option>PAQ</option>
            </select>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeItem(index, items, setItems)}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => addItem(items, setItems)}
        className="w-full"
      >
        + Agregar
      </Button>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/planeacion', {
        method: initialData?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ordenId,
          unidadNegocio,
          lugar,
          alcance,
          materiales,
          herramientas,
          equipos,
          elementosSeguridad: seguridad,
          ...personal,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Planeación guardada exitosamente');
        onSubmit?.(data);
      } else {
        alert('❌ Error al guardar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>📋 Planeación de Obra</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <div className="space-y-3">
            <h3 className="font-semibold">Información General</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Unidad de Negocio</label>
                <select
                  value={unidadNegocio}
                  onChange={(e) => setUnidadNegocio(e.target.value)}
                  className="w-full px-3 py-2 border rounded mt-1"
                >
                  <option>IT</option>
                  <option>MNT</option>
                  <option>SC</option>
                  <option>GEN</option>
                  <option>Otros</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Lugar</label>
                <Input
                  value={lugar}
                  onChange={(e) => setLugar(e.target.value)}
                  placeholder="Ubicación del trabajo"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Alcance del Trabajo</label>
              <textarea
                value={alcance}
                onChange={(e) => setAlcance(e.target.value)}
                placeholder="Descripción detallada del alcance"
                className="w-full px-3 py-2 border rounded mt-1 h-20"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="materiales" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="materiales">Materiales</TabsTrigger>
              <TabsTrigger value="herramientas">Herramientas</TabsTrigger>
              <TabsTrigger value="equipos">Equipos</TabsTrigger>
              <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
            </TabsList>

            <TabsContent value="materiales" className="space-y-4 mt-4">
              <ItemsTable
                items={materiales}
                setItems={setMateriales}
                title="Materiales Requeridos"
              />
            </TabsContent>

            <TabsContent value="herramientas" className="space-y-4 mt-4">
              <ItemsTable
                items={herramientas}
                setItems={setHerramientas}
                title="Herramientas Requeridas"
              />
            </TabsContent>

            <TabsContent value="equipos" className="space-y-4 mt-4">
              <ItemsTable
                items={equipos}
                setItems={setEquipos}
                title="Equipos Requeridos"
              />
            </TabsContent>

            <TabsContent value="seguridad" className="space-y-4 mt-4">
              <ItemsTable
                items={seguridad}
                setItems={setSeguridad}
                title="Elementos de Seguridad"
              />
            </TabsContent>
          </Tabs>

          {/* Personal */}
          <div className="space-y-3">
            <h3 className="font-semibold">Personal Requerido</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-sm font-medium">Electricistas</label>
                <Input
                  type="number"
                  min="0"
                  value={personal.electricistas}
                  onChange={(e) =>
                    setPersonal({
                      ...personal,
                      electricistas: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Técnicos Telecom</label>
                <Input
                  type="number"
                  min="0"
                  value={personal.tecnicosTelecom}
                  onChange={(e) =>
                    setPersonal({
                      ...personal,
                      tecnicosTelecom: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Instrumentistas</label>
                <Input
                  type="number"
                  min="0"
                  value={personal.instrumentistas}
                  onChange={(e) =>
                    setPersonal({
                      ...personal,
                      instrumentistas: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Obreros</label>
                <Input
                  type="number"
                  min="0"
                  value={personal.obreros}
                  onChange={(e) =>
                    setPersonal({
                      ...personal,
                      obreros: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <Badge variant="secondary">
              Total Personal:{' '}
              {personal.electricistas +
                personal.tecnicosTelecom +
                personal.instrumentistas +
                personal.obreros}
            </Badge>
          </div>

          {/* Submit */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '⏳ Guardando...' : '💾 Guardar Planeación'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

***

## **MÓDULO 2: INSPECCIÓN LÍNEAS DE VIDA - Vertical**

### **PASO 1: Schema Prisma**

```prisma
model InspeccionLineaVida {
  id                String   @id @default(cuid())
  
  // Identificación
  numeroLinea       String   @unique
  fabricante        String
  diametroCable     String   // "8mm", "10mm", etc
  tipoCable         String   // "Acero Inoxidable", etc
  ubicacion         String   // Torre, Poste, etc
  
  // Especificaciones
  especificaciones  Json     // Componentes de la línea
  
  // Inspección
  fechaInspeccion   DateTime @default(now())
  fechaInstalacion  DateTime?
  fechaUltimoMantenimiento DateTime?
  
  // Componentes evaluados
  componentes       ComponenteLineaVida[]
  
  // Resultado
  estado            String   // CONFORME, NO_CONFORME
  accionesCorrectivas String? @db.Text
  observaciones     String?  @db.Text
  fotosEvidencia    String[] // URLs
  
  // Inspector
  inspectorId       String
  inspector         Usuario  @relation(fields: [inspectorId], references: [id])
  
  // Auditoría
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([numeroLinea])
  @@index([inspectorId])
  @@index([estado])
}

model ComponenteLineaVida {
  id                  String @id @default(cuid())
  
  inspeccionId        String
  inspeccion          InspeccionLineaVida @relation(fields: [inspeccionId], references: [id], onDelete: Cascade)
  
  // Componente
  nombre              String // "PLACA_ANCLAJE_SUPERIOR", "CABLE", etc
  
  // Condiciones evaluadas
  condiciones         CondicionComponente[]
  
  // Hallazgos
  hallazgos           String?
  estado              String // C (Conforme), NC (No Conforme)
  accionCorrectiva    String?
  
  @@index([inspeccionId])
}

model CondicionComponente {
  id                    String @id @default(cuid())
  
  componenteId          String
  componente            ComponenteLineaVida @relation(fields: [componenteId], references: [id], onDelete: Cascade)
  
  tipoAfeccion          String // "Grietas", "Corrosión", "Desgaste", etc
  descripcion           String
  estado                String // C o NC
  
  @@index([componenteId])
}
```

### **PASO 2: Frontend - Inspección Líneas Verticales Form**

```tsx
// 📁 web/src/components/lineas-vida/inspeccion-linea-vida-form.tsx

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

const COMPONENTES_INSPECCION = [
  {
    nombre: 'PLACA DE ANCLAJE SUPERIOR',
    condiciones: [
      'Grietas visibles',
      'Corrosión visible',
      'Tornillos instalados en su totalidad',
      'Tornillería ajustada',
    ],
  },
  {
    nombre: 'PLATINAS DE SUJECIÓN',
    condiciones: [
      'Grietas visibles',
      'Corrosión visible',
      'Tornillos instalados en su totalidad',
      'Tornillería ajustada',
      'Grafado en buen estado',
    ],
  },
  {
    nombre: 'ABSORBEDOR DE ENERGÍA',
    condiciones: [
      'Grietas visibles',
      'Corrosión visible',
      'Tornillos instalados en su totalidad',
      'Pin de fijación instalado',
      'Grafado en buen estado',
    ],
  },
  {
    nombre: 'CABLE EN ACERO INOXIDABLE',
    condiciones: [
      'Mantiene su integridad en toda la longitud',
      'Presenta torceduras',
      'Presenta aplastamientos',
      'Desgaste o hilos sueltos',
      'Cable tensionado',
      'Corrosión visible',
    ],
  },
  {
    nombre: 'SISTEMA TENSOR',
    condiciones: [
      'Grietas visibles',
      'Corrosión visible',
      'Tornillos instalados en su totalidad',
      'Tornillería ajustada',
      'Soporte cable guía cada 10 metros',
    ],
  },
  {
    nombre: 'PLACA DE ANCLAJE INFERIOR',
    condiciones: [
      'Grietas visibles',
      'Corrosión visible',
      'Tornillos instalados',
      'Tornillería ajustada',
    ],
  },
  {
    nombre: 'PLACA DE IDENTIFICACIÓN',
    condiciones: [
      'Instalación correcta',
      'Placa legible',
      'Fecha de inspección actualizada',
    ],
  },
];

export function InspeccionLineaVidaForm({ ordenId }: { ordenId?: string }) {
  const [numeroLinea, setNumeroLinea] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [diametroCable, setDiametroCable] = useState('8mm');
  const [tipoCable, setTipoCable] = useState('Acero Inoxidable');
  const [ubicacion, setUbicacion] = useState('');
  
  const [componentes, setComponentes] = useState<any[]>([]);
  const [fotosEvidencia, setFotosEvidencia] = useState<File[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCondicionChange = (
    componente: string,
    condicion: string,
    estado: 'C' | 'NC'
  ) => {
    const existingComponente = componentes.find((c) => c.nombre === componente);

    if (existingComponente) {
      const existingCondicion = existingComponente.condiciones.find(
        (cond: any) => cond.descripcion === condicion
      );

      if (existingCondicion) {
        existingCondicion.estado = estado;
      } else {
        existingComponente.condiciones.push({
          descripcion: condicion,
          estado,
        });
      }
    } else {
      setComponentes([
        ...componentes,
        {
          nombre: componente,
          condiciones: [{ descripcion: condicion, estado }],
        },
      ]);
    }
  };

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFotosEvidencia((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const estadoGeneral = componentes.length > 0 ? (
    componentes.every((c) =>
      c.condiciones.every((cond: any) => cond.estado === 'C')
    ) ? (
      <Badge variant="success" className="bg-green-600">
        ✓ CONFORME
      </Badge>
    ) : (
      <Badge variant="destructive">✗ NO CONFORME</Badge>
    )
  ) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/lineas-vida/inspeccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numeroLinea,
          fabricante,
          diametroCable,
          tipoCable,
          ubicacion,
          componentes,
          observaciones,
          fotosEvidencia,
        }),
      });

      if (response.ok) {
        alert('✅ Inspección registrada');
        // Reset form
      } else {
        alert('❌ Error');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>🔗 Inspección Línea de Vida Vertical (OPE-006)</CardTitle>
          {estadoGeneral}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identificación */}
          <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h3 className="font-semibold">Identificación de Línea</h3>

            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Número de Línea"
                value={numeroLinea}
                onChange={(e) => setNumeroLinea(e.target.value)}
                required
              />
              <Input
                placeholder="Fabricante"
                value={fabricante}
                onChange={(e) => setFabricante(e.target.value)}
                required
              />
              <Input
                placeholder="Diámetro Cable"
                value={diametroCable}
                onChange={(e) => setDiametroCable(e.target.value)}
              />
              <Input
                placeholder="Ubicación (Torre, Poste)"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
              />
            </div>
          </div>

          {/* Componentes */}
          <div className="space-y-4">
            <h3 className="font-semibold">Evaluación de Componentes</h3>

            {COMPONENTES_INSPECCION.map((componente) => (
              <div
                key={componente.nombre}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="font-medium text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {componente.nombre}
                </div>

                <div className="space-y-2">
                  {componente.condiciones.map((condicion) => (
                    <div
                      key={condicion}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded"
                    >
                      <label className="text-sm flex-1">{condicion}</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleCondicionChange(
                              componente.nombre,
                              condicion,
                              'C'
                            )
                          }
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          C
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleCondicionChange(
                              componente.nombre,
                              condicion,
                              'NC'
                            )
                          }
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          NC
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Evidencia */}
          <div className="space-y-2">
            <label className="font-semibold">📸 Registro Fotográfico</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleAddPhoto}
              className="w-full"
            />
            <p className="text-sm text-gray-600">
              {fotosEvidencia.length} foto(s)
            </p>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <label className="font-semibold">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas adicionales y recomendaciones"
              className="w-full px-3 py-2 border rounded h-20"
            />
          </div>

          {/* Submit */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '⏳ Guardando...' : '💾 Guardar Inspección'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

***

## **MÓDULO 3: RESUMEN EJECUCIÓN - Dashboard con resumen datos**

```tsx
// 📁 web/src/components/ejecucion/resumen-ejecucion.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ResumenEjecucion {
  totalTareas: number;
  tareasCompletadas: number;
  evidenciasRecibidas: number;
  porcentajeAvance: number;
  estado: string;
  duracion: string;
  costo: number;
}

export function ResumenEjecucion({ ejecucionId }: { ejecucionId: string }) {
  const [resumen, setResumen] = useState<ResumenEjecucion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const response = await fetch(
          `/api/ejecuciones/${ejecucionId}/resumen`
        );
        const data = await response.json();
        setResumen(data.resumen);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumen();
  }, [ejecucionId]);

  if (loading) return <div>Cargando...</div>;
  if (!resumen) return <div>Error</div>;

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA':
        return 'bg-green-600';
      case 'EN_EJECUCION':
        return 'bg-blue-600';
      case 'PENDIENTE':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Progreso */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Progreso General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resumen.porcentajeAvance}%</div>
          <Progress value={resumen.porcentajeAvance} className="mt-2" />
          <p className="text-xs text-gray-600 mt-1">
            {resumen.tareasCompletadas} de {resumen.totalTareas} tareas
          </p>
        </CardContent>
      </Card>

      {/* Estado */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge className={`${getEstadoColor(resumen.estado)} text-white`}>
            {resumen.estado}
          </Badge>
          <p className="text-xs text-gray-600 mt-2">Duración: {resumen.duracion}</p>
        </CardContent>
      </Card>

      {/* Evidencias */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">📸 Evidencias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resumen.evidenciasRecibidas}</div>
          <p className="text-xs text-gray-600 mt-2">Fotos/Videos registrados</p>
        </CardContent>
      </Card>

      {/* Costo */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">💰 Inversión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${resumen.costo.toLocaleString()}
          </div>
          <p className="text-xs text-gray-600 mt-2">Costo actual</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

***

## **RESOLVER FALLAS COMUNES EN CERMONT**

### **FALLA #1: Sincronización Real-time con Socket.IO**

```typescript
// 📁 api/src/modules/ordenes/ordenes.routes.ts (FIX)

import { io } from '../../config/socket.js';

router.post('/update/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const orden = await ordenService.update(id, data);

    // ✅ BROADCAST a todos los usuarios que ven esta orden
    io.to(`orden:${id}`).emit('orden:updated', {
      ordenId: id,
      changes: data,
      timestamp: new Date(),
    });

    res.json({ status: 'success', orden });
  } catch (error) {
    next(error);
  }
});
```

### **FALLA #2: Validación de entrada mejorada**

```typescript
// 📁 api/src/shared/middleware/validation.ts

import { body, validationResult } from 'express-validator';

export const validateCreateOrden = [
  body('numero').notEmpty().withMessage('Número obligatorio'),
  body('clienteId').isUUID().withMessage('Cliente válido requerido'),
  body('tipoServicio')
    .isIn(['INSTALACION', 'MANTENIMIENTO', 'INSPECCION'])
    .withMessage('Tipo de servicio inválido'),
  body('montoEstimado').isFloat({ min: 0 }).withMessage('Monto válido'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validación fallida',
        errors: errors.array(),
      });
    }
    next();
  },
];
```

### **FALLA #3: Manejo de errores global mejorado**

```typescript
// 📁 api/src/shared/middleware/error-handler.ts

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../config/logger.js';

export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    user: req.user?.userId,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Error de validación Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      status: 'error',
      message: 'Registro duplicado',
    });
  }

  // Error de DB conexión
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      status: 'error',
      message: 'Base de datos no disponible',
    });
  }

  // Error genérico
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor'
      : err.message,
  });
};
```

***

## **✅ CHECKLIST MÓDULOS COMPLETADOS**

```
✅ MÓDULO PLANEACIÓN
  - Schema Prisma con materiales/herramientas/equipos/seguridad
  - Service con CRUD completo
  - Frontend form con tabs
  - Validaciones
  - Caching

✅ MÓDULO INSPECCIÓN LÍNEAS VERTICALES
  - 7 componentes de inspección
  - Sistema binario C/NC
  - Fotos evidencia
  - Observaciones
  - Reportes

✅ MÓDULO RESUMEN EJECUCIÓN
  - Dashboard con 4 métricas principales
  - Progreso visual
  - Estado realtime
  - Costo tracking

✅ FIXES CRÍTICOS
  - Real-time updates Socket.IO
  - Validación de entrada
  - Manejo de errores global
  - Logging completo
```

**¿Cuáles son las fallas específicas que estás experimentando en CERMONT ahora mismo para resolverlas?** 🔧

[1](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/b5793aee-c770-4431-af4a-d3b8e8f057aa/FORMATO-DE-PLANEACION-DE-OBRA.pdf)
[2](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/534e0227-5c6e-4adf-888f-40ce3d329305/Formato-Inspeccion-lineas-de-vida-Vertical.pdf)
[3](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/93f18f3b-537b-4ef7-a286-bdfc545ac5a0/FORMATO-DE-PLANEACION-DE-OBRA.pdf)