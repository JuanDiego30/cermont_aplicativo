

export type KpiSemantics = "primary" | "success" | "warning" | "danger" | "neutral";

export interface KpiConfig {
  iconBg: string;
  iconColor: string;
  valueColor: string;
}

export const KPI_SEMANTICS_CONFIG: Record<KpiSemantics, KpiConfig> = {
  primary: { iconBg: "bg-[var(--color-cermont-blue-bg)]", iconColor: "text-[var(--icon-accent)]", valueColor: "text-[var(--color-ink)]" },
  success: { iconBg: "bg-[var(--color-success-bg)]", iconColor: "text-[var(--icon-success)]", valueColor: "text-[var(--color-ink)]" },
  warning: { iconBg: "bg-[var(--color-warning-bg)]", iconColor: "text-[var(--icon-warning)]", valueColor: "text-[var(--color-ink)]" },
  danger: { iconBg: "bg-[var(--color-danger-bg)]", iconColor: "text-[var(--icon-error)]", valueColor: "text-[var(--color-ink)]" },
  neutral: { iconBg: "bg-[var(--color-surface)]", iconColor: "text-[var(--icon-muted)]", valueColor: "text-[var(--color-ink)]" },
};

export interface KpiMetric {
  id: string;
  label: string;
  value: number | string;
  sublabel?: string;
  delta?: number;
  deltaLabel?: string;
  iconName: string;
  semantics: KpiSemantics;
  unit?: string;
  linkTo?: string;
}

export interface DashboardStats {
  ordenesActivas: number;
  mantenimientosAbiertos: number;
  completadasMes: number;
  ingresosMes: number;
  enEjecucion: number;
  bloqueadas: number;
  listasFacturar: number;
  recursosEnUso: number;
  cumplimientoSLA: number;
  ordenesConAlerta: number;
  kitsActivos: number;
  totalOrdenes: number;
  ordenesCompletadas: number;
  ordenesAbiertas: number;
}

export interface MonthlyTrendPoint {
  month: string;
  creadas: number;
  completadas: number;
}

export interface OrdersByStatusPoint {
  estado: string;
  count: number;
  color: string;
}

export interface ChartsData {
  tendenciaMensual: MonthlyTrendPoint[];
  ordenesPorEstado: OrdersByStatusPoint[];
}

export type ActivityType =
  | "orden_creada"
  | "orden_completada"
  | "orden_bloqueada"
  | "sla_riesgo"
  | "factura_emitida"
  | "propuesta_aprobada"
  | "ejecucion_iniciada"
  | "acta_generada";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  timestamp: string;
  userAvatar?: string;
  userName?: string;
  ordenId?: string;
  ordenCodigo?: string;
}

export const ACTIVITY_EVENT_CONFIG: Record<ActivityType, { iconName: string; iconBg: string; iconColor: string }> = {
  orden_creada: { iconName: "ClipboardList", iconBg: "bg-[var(--color-cermont-blue-bg)]", iconColor: "text-[var(--icon-accent)]" },
  orden_completada: { iconName: "CheckCircle2", iconBg: "bg-[var(--color-success-bg)]", iconColor: "text-[var(--icon-success)]" },
  orden_bloqueada: { iconName: "AlertTriangle", iconBg: "bg-[var(--color-danger-bg)]", iconColor: "text-[var(--icon-error)]" },
  sla_riesgo: { iconName: "Clock", iconBg: "bg-[var(--color-warning-bg)]", iconColor: "text-[var(--icon-warning)]" },
  factura_emitida: { iconName: "Receipt", iconBg: "bg-[var(--color-success-bg)]", iconColor: "text-[var(--icon-success)]" },
  propuesta_aprobada: { iconName: "ThumbsUp", iconBg: "bg-[var(--color-cermont-blue-bg)]", iconColor: "text-[var(--icon-accent)]" },
  ejecucion_iniciada: { iconName: "PlayCircle", iconBg: "bg-[var(--color-info-bg)]", iconColor: "text-[var(--icon-info)]" },
  acta_generada: { iconName: "FileText", iconBg: "bg-[var(--color-success-bg)]", iconColor: "text-[var(--icon-success)]" },
};

export interface RecentOrder {
  id: string;
  codigo: string;
  cliente: string;
  etapa: string;
  estado: "activa" | "completada" | "bloqueada" | "en_ejecucion" | "lista_facturar" | "draft";
  fecha: string;
  responsable?: string;
  responsableAvatar?: string;
}

export const RECENT_ORDER_ESTADO_MAP: Record<RecentOrder["estado"], { variant: "success" | "warning" | "danger" | "info" | "neutral" | "draft"; label: string }> = {
  activa: { variant: "info", label: "Activa" },
  completada: { variant: "success", label: "Completada" },
  bloqueada: { variant: "danger", label: "Bloqueada" },
  en_ejecucion: { variant: "info", label: "En ejecución" },
  lista_facturar: { variant: "warning", label: "Lista para facturar" },
  draft: { variant: "draft", label: "Borrador" },
};

export type FlowStage = "comercial" | "operativo" | "cierre" | "financiero";

export interface FlowStep {
  number: number;
  title: string;
  description: string;
  stage: FlowStage;
  count?: number;
  amount?: number;
}

export const FLOW_STAGE_LABELS: Record<FlowStage, string> = {
  comercial: "Comercial",
  operativo: "Operativo",
  cierre: "Cierre",
  financiero: "Financiero",
};

export const FLOW_STAGE_COLORS: Record<FlowStage, { bg: string; text: string; border: string; badge: string }> = {
  comercial: { bg: "bg-[var(--color-cermont-blue-bg)]", text: "text-[var(--icon-accent)]", border: "border-[var(--icon-accent)]/30", badge: "bg-[var(--color-cermont-blue-bg)] text-[var(--icon-accent)]" },
  operativo: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--icon-success)]", border: "border-[var(--icon-success)]/30", badge: "bg-[var(--color-success-bg)] text-[var(--icon-success)]" },
  cierre: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--icon-warning)]", border: "border-[var(--icon-warning)]/30", badge: "bg-[var(--color-warning-bg)] text-[var(--icon-warning)]" },
  financiero: { bg: "bg-[var(--color-surface-soft)]", text: "text-[var(--icon-primary)]", border: "border-[var(--icon-primary)]/30", badge: "bg-[var(--color-surface)] text-[var(--icon-primary)]" },
};

export const CERMONT_FLOW_STEPS: FlowStep[] = [
  { number: 1, title: "Solicitud", description: "Registro y apertura del caso de servicio.", stage: "comercial" },
  { number: 2, title: "Visita", description: "Inspección técnica previa al servicio.", stage: "comercial" },
  { number: 3, title: "Propuesta", description: "Creación y envío de propuesta técnica-comercial.", stage: "comercial" },
  { number: 4, title: "Aprobación", description: "Confirmación del cliente para proceder.", stage: "comercial" },
  { number: 5, title: "Orden de Trabajo", description: "Generación de la orden oficial de servicio.", stage: "operativo" },
  { number: 6, title: "Planeación", description: "Asignación de técnicos, recursos y agenda.", stage: "operativo" },
  { number: 7, title: "Ejecución", description: "Realización del trabajo en campo.", stage: "operativo" },
  { number: 8, title: "Evidencias", description: "Registro fotográfico y soportes de la ejecución.", stage: "operativo" },
  { number: 9, title: "Informe Técnico", description: "Documentación de ejecución y recursos usados.", stage: "operativo" },
  { number: 10, title: "Acta de Entrega", description: "Generación del acta y sus soportes.", stage: "cierre" },
  { number: 11, title: "Firma del Cliente", description: "Aceptación formal de la entrega por el cliente.", stage: "cierre" },
  { number: 12, title: "SES / Ariba", description: "Registro, envío y aprobación de la hoja de entrada.", stage: "cierre" },
  { number: 13, title: "Facturación", description: "Emisión de factura electrónica con soportes.", stage: "financiero" },
  { number: 14, title: "Pago y Cierre", description: "Recibo de fondos y cierre del ciclo.", stage: "financiero" },
];

export interface SlaAlert {
  id: string;
  ordenCodigo: string;
  ordenId: string;
  cliente: string;
  etapa: string;
  horasRestantes: number;
  estado: "vencida" | "riesgo";
}

export interface HealthScore {
  overall: number;
  sla: number;
  efficiency: number;
  financial: number;
  workload: number;
  trend: "improving" | "stable" | "declining";
  breakdown: Array<{ label: string; score: number; maxScore: number; status: "good" | "fair" | "poor" }>;
}

export interface PredictiveAlert {
  id: string;
  type: "sla_breach_risk" | "resource_bottleneck" | "workload_spike" | "revenue_dip";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  probability: number;
  daysToImpact: number;
  affectedEntity?: string;
  suggestedAction?: string;
}
