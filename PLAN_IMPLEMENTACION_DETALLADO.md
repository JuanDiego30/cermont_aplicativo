# ??? PLAN DE IMPLEMENTACIÓN - CORRECCIÓN DE FALLAS CERMONT

**Documento de Referencia**: `ANALISIS_COMPLETO_APLICATIVO.md`  
**Objetivo**: Corregir las 5 fallas críticas identificadas sin generar código espagueti

---

## ?? PRINCIPIOS DE IMPLEMENTACIÓN

### ? Clean Code Principles
1. **SOLID**: Cada clase tiene una responsabilidad única
2. **DRY**: No repetir código
3. **KISS**: Mantener simplicidad
4. **YAGNI**: Solo implementar lo necesario
5. **Separation of Concerns**: Backend ? Frontend

### ? Arquitectura Limpia
```
?? backend/
??? domain/          ? Entities, Interfaces (sin dependencias)
??? app/             ? Use Cases (lógica de negocio)
??? infra/           ? Controllers, DB, External Services
??? shared/          ? Utilities, Constants

?? frontend/
??? features/        ? Módulos por dominio
??? shared/          ? Componentes reutilizables
??? core/            ? API, Auth, Config
??? lib/             ? Utilities
```

---

## ?? FALLA #1: SISTEMA DE CERTIFICACIONES

### ?? Estructura de Archivos

```typescript
// ============================================================================
// BACKEND - Domain Layer
// ============================================================================

// ?? backend/src/domain/entities/CertifiedEquipment.ts
export interface CertifiedEquipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  certification: Certification;
  maintenanceSchedule?: MaintenanceSchedule;
  status: EquipmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum EquipmentCategory {
  TOOL = 'TOOL',
  EQUIPMENT = 'EQUIPMENT',
  PPE = 'PPE',
  VEHICLE = 'VEHICLE',
}

export interface Certification {
  type: string;           // "ISO 9001", "RETIE", "ANSI Z87.1"
  number: string;
  issueDate: Date;
  expiryDate: Date;
  issuedBy: string;
  documentUrl?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface MaintenanceSchedule {
  lastMaintenance: Date;
  nextMaintenance: Date;
  frequencyInDays: number;
  maintenanceType: string;
}

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',         // Disponible
  IN_USE = 'IN_USE',               // En uso
  MAINTENANCE = 'MAINTENANCE',     // En mantenimiento
  EXPIRED = 'EXPIRED',             // Certificación vencida
  RETIRED = 'RETIRED',             // Dado de baja
}

// ============================================================================
// BACKEND - Repository Interface
// ============================================================================

// ?? backend/src/domain/repositories/ICertifiedEquipmentRepository.ts
export interface ICertifiedEquipmentRepository {
  create(equipment: Omit<CertifiedEquipment, 'id'>): Promise<CertifiedEquipment>;
  findById(id: string): Promise<CertifiedEquipment | null>;
  findAll(filters?: EquipmentFilters): Promise<CertifiedEquipment[]>;
  findByCategory(category: EquipmentCategory): Promise<CertifiedEquipment[]>;
  findExpiringCertifications(daysAhead: number): Promise<CertifiedEquipment[]>;
  update(id: string, data: Partial<CertifiedEquipment>): Promise<CertifiedEquipment>;
  delete(id: string): Promise<void>;
}

export interface EquipmentFilters {
  category?: EquipmentCategory;
  status?: EquipmentStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// BACKEND - Use Cases
// ============================================================================

// ?? backend/src/app/equipment/use-cases/CreateCertifiedEquipment.ts
import type { ICertifiedEquipmentRepository } from '../../../domain/repositories/ICertifiedEquipmentRepository.js';
import type { CertifiedEquipment } from '../../../domain/entities/CertifiedEquipment.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const ERROR_MESSAGES = {
  INVALID_NAME: 'El nombre del equipo es requerido',
  INVALID_CERTIFICATION: 'Los datos de certificación son inválidos',
  EXPIRY_IN_PAST: 'La fecha de vencimiento no puede estar en el pasado',
  MISSING_DOCUMENT: 'El documento de certificación es requerido',
} as const;

export interface CreateEquipmentInput {
  name: string;
  category: string;
  certification: {
    type: string;
    number: string;
    issueDate: string;
    expiryDate: string;
    issuedBy: string;
    documentUrl?: string;
  };
  maintenanceSchedule?: {
    lastMaintenance: string;
    frequencyInDays: number;
    maintenanceType: string;
  };
  createdBy: string;
}

export class CreateCertifiedEquipmentUseCase {
  constructor(
    private readonly equipmentRepository: ICertifiedEquipmentRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: CreateEquipmentInput): Promise<CertifiedEquipment> {
    this.validate(input);

    const equipment = await this.equipmentRepository.create({
      name: input.name,
      category: input.category as EquipmentCategory,
      certification: {
        type: input.certification.type,
        number: input.certification.number,
        issueDate: new Date(input.certification.issueDate),
        expiryDate: new Date(input.certification.expiryDate),
        issuedBy: input.certification.issuedBy,
        documentUrl: input.certification.documentUrl,
      },
      maintenanceSchedule: input.maintenanceSchedule ? {
        lastMaintenance: new Date(input.maintenanceSchedule.lastMaintenance),
        nextMaintenance: this.calculateNextMaintenance(
          new Date(input.maintenanceSchedule.lastMaintenance),
          input.maintenanceSchedule.frequencyInDays
        ),
        frequencyInDays: input.maintenanceSchedule.frequencyInDays,
        maintenanceType: input.maintenanceSchedule.maintenanceType,
      } : undefined,
      status: this.determineInitialStatus(new Date(input.certification.expiryDate)),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.logAudit(equipment, input.createdBy);

    logger.info('[CreateCertifiedEquipment] Equipo certificado creado', {
      equipmentId: equipment.id,
      name: equipment.name,
      category: equipment.category,
      expiryDate: equipment.certification.expiryDate,
    });

    return equipment;
  }

  private validate(input: CreateEquipmentInput): void {
    if (!input.name?.trim()) {
      throw new Error(ERROR_MESSAGES.INVALID_NAME);
    }

    if (!input.certification?.type || !input.certification?.number || !input.certification?.expiryDate) {
      throw new Error(ERROR_MESSAGES.INVALID_CERTIFICATION);
    }

    const expiryDate = new Date(input.certification.expiryDate);
    if (expiryDate < new Date()) {
      throw new Error(ERROR_MESSAGES.EXPIRY_IN_PAST);
    }
  }

  private calculateNextMaintenance(lastMaintenance: Date, frequencyInDays: number): Date {
    const next = new Date(lastMaintenance);
    next.setDate(next.getDate() + frequencyInDays);
    return next;
  }

  private determineInitialStatus(expiryDate: Date): EquipmentStatus {
    return expiryDate < new Date() ? EquipmentStatus.EXPIRED : EquipmentStatus.AVAILABLE;
  }

  private async logAudit(equipment: CertifiedEquipment, userId: string): Promise<void> {
    await this.auditService.log({
      entityType: 'CertifiedEquipment',
      entityId: equipment.id,
      action: AuditAction.CREATE,
      userId,
      after: equipment,
      reason: 'Nuevo equipo certificado registrado',
    });
  }
}

// ============================================================================
// BACKEND - Alert System
// ============================================================================

// ?? backend/src/app/equipment/use-cases/CheckExpiringCertifications.ts
export interface CertificationAlert {
  equipment: CertifiedEquipment;
  daysUntilExpiry: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class CheckExpiringCertificationsUseCase {
  constructor(
    private readonly equipmentRepository: ICertifiedEquipmentRepository,
    private readonly notificationService: INotificationService
  ) {}

  async execute(): Promise<CertificationAlert[]> {
    const alerts: CertificationAlert[] = [];

    // Buscar certificaciones que expiran en los próximos 30 días
    const expiringEquipment = await this.equipmentRepository.findExpiringCertifications(30);

    for (const equipment of expiringEquipment) {
      const daysUntilExpiry = this.calculateDaysUntilExpiry(equipment.certification.expiryDate);
      const severity = this.determineSeverity(daysUntilExpiry);

      alerts.push({
        equipment,
        daysUntilExpiry,
        severity,
      });

      // Enviar notificación según severidad
      if (severity === 'HIGH') {
        await this.notificationService.sendUrgentAlert({
          subject: `?? URGENTE: Certificación de ${equipment.name} vence en ${daysUntilExpiry} días`,
          recipients: ['admin@cermont.com', 'supervisor@cermont.com'],
          data: equipment,
        });
      } else if (severity === 'MEDIUM') {
        await this.notificationService.sendWarning({
          subject: `?? Aviso: Certificación de ${equipment.name} vence en ${daysUntilExpiry} días`,
          recipients: ['supervisor@cermont.com'],
          data: equipment,
        });
      }
    }

    logger.info('[CheckExpiringCertifications] Verificación completada', {
      totalAlerts: alerts.length,
      high: alerts.filter(a => a.severity === 'HIGH').length,
      medium: alerts.filter(a => a.severity === 'MEDIUM').length,
    });

    return alerts;
  }

  private calculateDaysUntilExpiry(expiryDate: Date): number {
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private determineSeverity(daysUntilExpiry: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (daysUntilExpiry <= 7) return 'HIGH';
    if (daysUntilExpiry <= 15) return 'MEDIUM';
    return 'LOW';
  }
}

// ============================================================================
// BACKEND - Job Scheduler
// ============================================================================

// ?? backend/src/jobs/CertificationExpiryAlert.ts
import cron from 'node-cron';
import { CheckExpiringCertificationsUseCase } from '../app/equipment/use-cases/CheckExpiringCertifications.js';

export class CertificationExpiryAlertJob {
  constructor(
    private readonly checkExpiringCertifications: CheckExpiringCertificationsUseCase
  ) {}

  start(): void {
    // Ejecutar todos los días a las 6:00 AM
    cron.schedule('0 6 * * *', async () => {
      logger.info('[CertificationExpiryAlertJob] Iniciando verificación de certificaciones');
      
      try {
        await this.checkExpiringCertifications.execute();
        logger.info('[CertificationExpiryAlertJob] Verificación completada exitosamente');
      } catch (error) {
        logger.error('[CertificationExpiryAlertJob] Error en verificación', { error });
      }
    });

    logger.info('[CertificationExpiryAlertJob] Job programado: 6:00 AM diario');
  }
}

// ============================================================================
// BACKEND - Controller
// ============================================================================

// ?? backend/src/infra/http/controllers/EquipmentController.ts
export class EquipmentController {
  static async list(req: Request, res: Response) {
    const { category, status, search, page = 1, limit = 20 } = req.query;

    const equipment = await equipmentRepository.findAll({
      category: category as EquipmentCategory,
      status: status as EquipmentStatus,
      search: search as string,
      page: Number(page),
      limit: Number(limit),
    });

    res.json({ success: true, data: equipment });
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    const equipment = await equipmentRepository.findById(id);

    if (!equipment) {
      return res.status(404).json({ success: false, error: 'Equipo no encontrado' });
    }

    res.json({ success: true, data: equipment });
  }

  static async create(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const createUseCase = new CreateCertifiedEquipmentUseCase(equipmentRepository, auditService);

    const equipment = await createUseCase.execute({
      ...req.body,
      createdBy: userId,
    });

    res.status(201).json({ success: true, data: equipment });
  }

  static async getExpiringAlerts(req: Request, res: Response) {
    const checkUseCase = new CheckExpiringCertificationsUseCase(equipmentRepository, notificationService);
    const alerts = await checkUseCase.execute();

    res.json({ success: true, data: alerts });
  }
}

// ============================================================================
// FRONTEND - Types
// ============================================================================

// ?? frontend/src/features/equipment/types/equipment.types.ts
export interface CertifiedEquipment {
  id: string;
  name: string;
  category: 'TOOL' | 'EQUIPMENT' | 'PPE' | 'VEHICLE';
  certification: {
    type: string;
    number: string;
    issueDate: string;
    expiryDate: string;
    issuedBy: string;
    documentUrl?: string;
  };
  maintenanceSchedule?: {
    lastMaintenance: string;
    nextMaintenance: string;
    frequencyInDays: number;
    maintenanceType: string;
  };
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'EXPIRED' | 'RETIRED';
  createdAt: string;
  updatedAt: string;
}

export interface CertificationAlert {
  equipment: CertifiedEquipment;
  daysUntilExpiry: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

// ============================================================================
// FRONTEND - Component
// ============================================================================

// ?? frontend/src/features/equipment/components/EquipmentList.tsx
'use client';

import { useState, useEffect } from 'react';
import { equipmentApi } from '../api/equipment-service';
import { CertifiedEquipment } from '../types/equipment.types';
import { Badge } from '@/shared/components/ui/Badge';
import { AlertTriangle, CheckCircle, Wrench, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  AVAILABLE: { label: 'Disponible', icon: CheckCircle, color: 'success' },
  IN_USE: { label: 'En Uso', icon: Wrench, color: 'info' },
  MAINTENANCE: { label: 'Mantenimiento', icon: Wrench, color: 'warning' },
  EXPIRED: { label: 'Vencido', icon: XCircle, color: 'error' },
  RETIRED: { label: 'Retirado', icon: XCircle, color: 'neutral' },
} as const;

export function EquipmentList() {
  const [equipment, setEquipment] = useState<CertifiedEquipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    const data = await equipmentApi.list();
    setEquipment(data);
    setIsLoading(false);
  };

  const getDaysUntilExpiry = (expiryDate: string): number => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getCertificationBadge = (expiryDate: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0) return <Badge color="error">Vencida</Badge>;
    if (days <= 7) return <Badge color="error">Vence en {days} días</Badge>;
    if (days <= 15) return <Badge color="warning">Vence en {days} días</Badge>;
    return <Badge color="success">Vigente ({days} días)</Badge>;
  };

  if (isLoading) {
    return <div>Cargando equipos...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Equipos Certificados</h2>

      <div className="grid gap-4">
        {equipment.map((item) => {
          const statusConfig = STATUS_CONFIG[item.status];
          const Icon = statusConfig.icon;

          return (
            <div
              key={item.id}
              className="rounded-xl border-2 border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-6 w-6 text-neutral-500" />
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <Badge color={statusConfig.color as any}>{statusConfig.label}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Certificación</p>
                      <p className="font-medium">{item.certification.type}</p>
                      <p className="text-sm">N° {item.certification.number}</p>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Estado</p>
                      {getCertificationBadge(item.certification.expiryDate)}
                    </div>

                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Emitido por</p>
                      <p className="font-medium">{item.certification.issuedBy}</p>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Vence</p>
                      <p className="font-medium">
                        {new Date(item.certification.expiryDate).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>

                  {item.maintenanceSchedule && (
                    <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Próximo Mantenimiento
                      </p>
                      <p className="mt-1">
                        {new Date(item.maintenanceSchedule.nextMaintenance).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  )}
                </div>

                {item.certification.documentUrl && (
                  <a
                    href={item.certification.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-600 hover:underline"
                  >
                    Ver Documento ?
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## ?? FALLA #2: CONTROL AUTOMÁTICO DE COSTOS REALES

### ?? Estructura de Archivos

```typescript
// ============================================================================
// BACKEND - Enhanced Cost Calculator
// ============================================================================

// ?? backend/src/infra/services/CostCalculatorService.ts (MEJORADO)
export class CostCalculatorService {
  // ... código existente ...

  /**
   * Calcula impuestos colombianos (IVA + Retención)
   */
  calculateTaxes(baseAmount: number): TaxBreakdown {
    const IVA_RATE = 0.19;        // 19%
    const RETENCION_RATE = 0.04;  // 4%

    const iva = baseAmount * IVA_RATE;
    const subtotalWithIVA = baseAmount + iva;
    const retencion = baseAmount * RETENCION_RATE;
    const total = subtotalWithIVA - retencion;

    return {
      base: baseAmount,
      iva,
      subtotalWithIVA,
      retencion,
      total,
    };
  }

  /**
   * Calcula varianza y determina estado
   */
  calculateVarianceWithStatus(budgeted: number, actual: number): VarianceResult {
    const variance = actual - budgeted;
    const variancePercent = budgeted > 0 ? (variance / budgeted) * 100 : 0;

    let status: 'OK' | 'WARNING' | 'CRITICAL';
    if (Math.abs(variancePercent) <= 5) status = 'OK';
    else if (Math.abs(variancePercent) <= 10) status = 'WARNING';
    else status = 'CRITICAL';

    return {
      variance,
      variancePercent,
      status,
      isOverBudget: variance > 0,
    };
  }
}

// ============================================================================
// BACKEND - Real Cost Capture
// ============================================================================

// ?? backend/src/app/costing/use-cases/CaptureRealCost.ts
export class CaptureRealCostUseCase {
  constructor(
    private readonly costItemRepository: ICostItemRepository,
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly costCalculatorService: CostCalculatorService,
    private readonly notificationService: INotificationService,
    private readonly auditService: AuditService
  ) {}

  async execute(input: CaptureRealCostInput): Promise<CostItem> {
    this.validate(input);

    // 1. Crear ítem de costo real
    const costItem = await this.costItemRepository.create({
      workPlanId: input.workPlanId,
      category: input.category,
      description: input.description,
      amount: input.amount,
      invoiceNumber: input.invoiceNumber,
      date: new Date(input.date),
      capturedBy: input.capturedBy,
    });

    // 2. Recalcular varianza del plan
    const workPlan = await this.workPlanRepository.findById(input.workPlanId);
    const allCosts = await this.costItemRepository.findByWorkPlanId(input.workPlanId);
    
    const totalActual = allCosts.reduce((sum, item) => sum + item.amount, 0);
    const variance = this.costCalculatorService.calculateVarianceWithStatus(
      workPlan.estimatedBudget.total,
      totalActual
    );

    // 3. Enviar alerta si excede umbral
    if (variance.status === 'WARNING' || variance.status === 'CRITICAL') {
      await this.sendCostAlert(workPlan, variance);
    }

    // 4. Actualizar plan de trabajo
    await this.workPlanRepository.update(input.workPlanId, {
      actualBudget: {
        ...workPlan.actualBudget,
        total: totalActual,
      },
    });

    // 5. Registrar auditoría
    await this.auditService.log({
      entityType: 'WorkPlan',
      entityId: input.workPlanId,
      action: AuditAction.UPDATE_COST,
      userId: input.capturedBy,
      after: { costItem, variance },
      reason: `Costo real capturado: ${input.description} - $${input.amount}`,
    });

    logger.info('[CaptureRealCost] Costo capturado', {
      workPlanId: input.workPlanId,
      amount: input.amount,
      totalActual,
      variance: variance.variancePercent,
      status: variance.status,
    });

    return costItem;
  }

  private async sendCostAlert(workPlan: WorkPlan, variance: VarianceResult) {
    const severity = variance.status === 'CRITICAL' ? 'HIGH' : 'MEDIUM';
    
    await this.notificationService.send({
      type: 'COST_OVERRUN',
      severity,
      subject: `${severity === 'HIGH' ? '??' : '??'} Alerta de Sobrecosto - ${workPlan.title}`,
      message: `El costo real excede el presupuesto en ${variance.variancePercent.toFixed(1)}%`,
      recipients: [workPlan.supervisor, 'finanzas@cermont.com'],
      data: {
        workPlanId: workPlan.id,
        orderNumber: workPlan.orderCode,
        budgeted: workPlan.estimatedBudget.total,
        actual: workPlan.actualBudget.total,
        variance: variance.variance,
      },
    });
  }
}
```

---

## ? RESUMEN DE ENTREGABLES

### Backend (30 archivos nuevos)
- [ ] 8 Entities (Domain Layer)
- [ ] 12 Use Cases (Application Layer)
- [ ] 6 Repositories (Infrastructure Layer)
- [ ] 4 Jobs (Scheduled Tasks)

### Frontend (25 componentes nuevos)
- [ ] 10 Components (Features)
- [ ] 8 API Services
- [ ] 7 Types/Interfaces

### Documentación
- [x] Análisis completo
- [x] Plan de implementación
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Manual de usuario

---

**ESTIMACIÓN TOTAL**: 6-8 semanas de desarrollo  
**PRIORIDAD**: ?? CRÍTICA

**PRÓXIMO PASO**: Iniciar implementación de Sistema de Certificaciones
