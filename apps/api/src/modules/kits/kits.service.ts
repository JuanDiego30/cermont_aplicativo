/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KITS SERVICE - CERMONT APLICATIVO (LEGACY)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * LEGACY SERVICE: Uses Prisma directly for backward compatibility.
 * For new features, use the Use Cases in application/use-cases/
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

// ============================================================================
// Interfaces
// ============================================================================

interface HerramientaKit {
  nombre: string;
  cantidad: number;
  certificacion: boolean;
}

interface EquipoKit {
  nombre: string;
  cantidad: number;
  certificacion: boolean;
}

/**
 * Type-safe JSON field parsers for KitTipico fields.
 * Prisma returns JsonValue which needs runtime validation.
 */
function parseChecklistItems(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function parseHerramientas(value: unknown): HerramientaKit[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is HerramientaKit => 
    typeof item === "object" && 
    item !== null &&
    typeof (item as HerramientaKit).nombre === "string"
  );
}

function parseEquipos(value: unknown): EquipoKit[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is EquipoKit => 
    typeof item === "object" && 
    item !== null &&
    typeof (item as EquipoKit).nombre === "string"
  );
}

interface CreateKitDtoLegacy {
  nombre: string;
  descripcion?: string;
  herramientas?: HerramientaKit[];
  equipos?: EquipoKit[];
  documentos?: string[];
  checklistItems?: string[];
  duracionEstimadaHoras?: number;
  costoEstimado?: number;
}

// ============================================================================
// Kits predefinidos
// ============================================================================

const KITS_PREDEFINIDOS = {
  LINEA_VIDA: {
    nombre: "Kit Inspección Líneas de Vida",
    descripcion:
      "Herramientas y equipos para inspección de líneas de vida verticales",
    herramientas: [
      { nombre: "Calibrador pie de rey", cantidad: 1, certificacion: true },
      { nombre: "Flexómetro 5m", cantidad: 1, certificacion: false },
      { nombre: "Llave de boca 13mm", cantidad: 1, certificacion: false },
      { nombre: "Destornillador de pala", cantidad: 1, certificacion: false },
      { nombre: "Linterna LED", cantidad: 1, certificacion: false },
      { nombre: "Espejo de inspección", cantidad: 1, certificacion: false },
    ],
    equipos: [
      { nombre: "Arnés de seguridad", cantidad: 1, certificacion: true },
      {
        nombre: "Eslinga doble con absorbedor",
        cantidad: 1,
        certificacion: true,
      },
      { nombre: "Mosquetones tipo C", cantidad: 4, certificacion: true },
      { nombre: "Casco con barbuquejo", cantidad: 1, certificacion: true },
      { nombre: "Gafas de seguridad", cantidad: 1, certificacion: false },
      { nombre: "Guantes de seguridad", cantidad: 1, certificacion: false },
    ],
    documentos: [
      "Formato Inspección Líneas de Vida Vertical",
      "Permiso de Trabajo en Alturas",
      "AST - Análisis Seguro de Trabajo",
      "ATS - Matriz de riesgos",
    ],
    checklistItems: [
      "Verificar estado general del cable de acero",
      "Inspeccionar placa de anclaje superior",
      "Verificar tensor y su funcionamiento",
      "Revisar placa de anclaje inferior",
      "Comprobar ausencia de corrosión",
      "Verificar soldaduras y puntos de sujeción",
      "Medir diámetro del cable con calibrador",
      "Verificar certificaciones vigentes",
      "Documentar con fotografías cada componente",
      "Firmar formato de inspección",
    ],
    duracionEstimadaHoras: 4,
  },
  CCTV: {
    nombre: "Kit Mantenimiento CCTV",
    descripcion: "Herramientas y equipos para mantenimiento de sistemas CCTV",
    herramientas: [
      {
        nombre: "Destornillador de estrella",
        cantidad: 1,
        certificacion: false,
      },
      { nombre: "Destornillador de pala", cantidad: 1, certificacion: false },
      { nombre: "Pinzas electricas", cantidad: 1, certificacion: false },
      { nombre: "Probador de cables RJ45", cantidad: 1, certificacion: true },
      { nombre: "Multímetro digital", cantidad: 1, certificacion: true },
      {
        nombre: "Kit ponchadora con conectores",
        cantidad: 1,
        certificacion: false,
      },
      {
        nombre: "Laptop con software de configuración",
        cantidad: 1,
        certificacion: false,
      },
    ],
    equipos: [
      { nombre: "Escalera tipo A 6 pasos", cantidad: 1, certificacion: true },
      { nombre: "Arnés de seguridad", cantidad: 1, certificacion: true },
      { nombre: "Casco dieléctrico", cantidad: 1, certificacion: true },
      { nombre: "Gafas de seguridad", cantidad: 1, certificacion: false },
      { nombre: "Guantes dieléctricos", cantidad: 1, certificacion: true },
    ],
    documentos: [
      "Formato Mantenimiento CCTV",
      "Permiso de Trabajo",
      "Manual técnico del DVR/NVR",
      "Diagrama de conexiones",
    ],
    checklistItems: [
      "Verificar alimentación eléctrica del sistema",
      "Comprobar conexiones de red/coaxial",
      "Limpiar lentes de cámaras",
      "Verificar enfoque y ángulo de visión",
      "Probar grabación en DVR/NVR",
      "Verificar espacio en disco duro",
      "Actualizar firmware si es necesario",
      "Comprobar visualización remota",
      "Documentar con capturas de pantalla",
      "Firmar formato de mantenimiento",
    ],
    duracionEstimadaHoras: 6,
  },
  ELECTRICO: {
    nombre: "Kit Mantenimiento Eléctrico",
    descripcion: "Herramientas y equipos para trabajos eléctricos",
    herramientas: [
      { nombre: "Multímetro digital", cantidad: 1, certificacion: true },
      { nombre: "Pinza amperimétrica", cantidad: 1, certificacion: true },
      { nombre: "Detector de voltaje", cantidad: 1, certificacion: true },
      { nombre: "Destornilladores aislados", cantidad: 1, certificacion: true },
      { nombre: "Alicates aislados", cantidad: 1, certificacion: true },
      { nombre: "Pelacables", cantidad: 1, certificacion: false },
      { nombre: "Cinta aislante", cantidad: 2, certificacion: false },
      { nombre: "Terminales y conectores", cantidad: 1, certificacion: false },
    ],
    equipos: [
      {
        nombre: "Guantes dieléctricos clase 0",
        cantidad: 1,
        certificacion: true,
      },
      { nombre: "Casco dieléctrico", cantidad: 1, certificacion: true },
      { nombre: "Botas dieléctricas", cantidad: 1, certificacion: true },
      { nombre: "Gafas de protección UV", cantidad: 1, certificacion: false },
      { nombre: "Tapete aislante", cantidad: 1, certificacion: true },
    ],
    documentos: [
      "Permiso de Trabajo Eléctrico",
      "AST - Análisis Seguro de Trabajo",
      "Diagrama unifilar",
      "Procedimiento de bloqueo y etiquetado",
    ],
    checklistItems: [
      "Verificar desenergización del circuito",
      "Aplicar procedimiento LOTO",
      "Medir ausencia de tensión",
      "Verificar estado de conductores",
      "Reapretar conexiones",
      "Medir resistencia de aislamiento",
      "Verificar protecciones térmicas",
      "Comprobar funcionamiento de interruptores",
      "Documentar mediciones realizadas",
      "Retirar LOTO siguiendo procedimiento",
    ],
    duracionEstimadaHoras: 8,
  },
  INSTRUMENTACION: {
    nombre: "Kit Instrumentación Industrial",
    descripcion:
      "Herramientas para calibración y mantenimiento de instrumentos",
    herramientas: [
      { nombre: "Calibrador de presión", cantidad: 1, certificacion: true },
      {
        nombre: "Simulador de señales 4-20mA",
        cantidad: 1,
        certificacion: true,
      },
      { nombre: "Multímetro de precisión", cantidad: 1, certificacion: true },
      { nombre: "Termómetro infrarrojo", cantidad: 1, certificacion: true },
      {
        nombre: "Destornilladores de precisión",
        cantidad: 1,
        certificacion: false,
      },
      { nombre: "Llaves Allen métricas", cantidad: 1, certificacion: false },
    ],
    equipos: [
      {
        nombre: "Laptop con software de calibración",
        cantidad: 1,
        certificacion: false,
      },
      { nombre: "Comunicador HART", cantidad: 1, certificacion: true },
      { nombre: "EPP básico", cantidad: 1, certificacion: true },
    ],
    documentos: [
      "Hoja de datos del instrumento",
      "Procedimiento de calibración",
      "Certificados de patrones",
      "Formato de calibración",
    ],
    checklistItems: [
      "Identificar tag del instrumento",
      "Verificar alimentación eléctrica/neumática",
      "Realizar prueba de cero",
      "Verificar span del instrumento",
      "Calibrar según procedimiento",
      "Documentar valores antes y después",
      "Etiquetar instrumento calibrado",
      "Registrar fecha próxima calibración",
    ],
    duracionEstimadaHoras: 4,
  },
};

@Injectable()
export class KitsService {
  private readonly logger = new Logger(KitsService.name);

  constructor(private readonly prisma: PrismaService) {
    this.logger.log(
      "ℹ️  KitsService: Legacy service. Consider migrating to Use Cases.",
    );
  }

  /**
   * @deprecated Use ListKitsUseCase instead
   */
  async findAll() {
    try {
      const kits = await this.prisma.kitTipico.findMany({
        where: { activo: true },
        orderBy: { createdAt: "desc" },
      });
      return { data: kits };
    } catch (error) {
      const err = error as Error;
      this.logger.error("[findAll] Error:", err.message);
      throw error;
    }
  }

  /**
   * @deprecated Use GetKitUseCase instead
   */
  async findOne(id: string) {
    const kit = await this.prisma.kitTipico.findUnique({ where: { id } });
    if (!kit) throw new NotFoundException("Kit no encontrado");
    return kit;
  }

  /**
   * @deprecated Use CreateKitUseCase instead
   */
  async create(dto: CreateKitDtoLegacy) {
    const kit = await this.prisma.kitTipico.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? "",
        herramientas: (dto.herramientas ?? []) as object,
        equipos: (dto.equipos ?? []) as object,
        documentos: dto.documentos ?? [],
        checklistItems: dto.checklistItems ?? [],
        duracionEstimadaHoras: dto.duracionEstimadaHoras ?? 0,
        costoEstimado: dto.costoEstimado ?? 0,
        activo: true,
      },
    });
    return { message: "Kit creado", data: kit };
  }

  /**
   * @deprecated Use UpdateKitUseCase instead
   */
  async update(id: string, dto: Partial<CreateKitDtoLegacy>) {
    await this.findOne(id);
    const updateData: Record<string, unknown> = {};
    if (dto.nombre) updateData["nombre"] = dto.nombre;
    if (dto.descripcion !== undefined)
      updateData["descripcion"] = dto.descripcion ?? null;
    if (dto.herramientas)
      updateData["herramientas"] = dto.herramientas as object;
    if (dto.equipos) updateData["equipos"] = dto.equipos as object;
    if (dto.documentos) updateData["documentos"] = dto.documentos;
    if (dto.checklistItems) updateData["checklistItems"] = dto.checklistItems;
    if (dto.duracionEstimadaHoras !== undefined)
      updateData["duracionEstimadaHoras"] = dto.duracionEstimadaHoras;
    if (dto.costoEstimado !== undefined)
      updateData["costoEstimado"] = dto.costoEstimado;

    const kit = await this.prisma.kitTipico.update({
      where: { id },
      data: updateData,
    });
    return { message: "Kit actualizado", data: kit };
  }

  /**
   * @deprecated Use DeleteKitUseCase instead
   */
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.kitTipico.update({
      where: { id },
      data: { activo: false },
    });
    return { message: "Kit desactivado" };
  }

  /**
   * @deprecated Use ActivateKitUseCase or DeactivateKitUseCase instead
   */
  async changeEstado(id: string, estado: string) {
    await this.findOne(id);
    const nuevoEstado =
      estado === "disponible" || estado === "active" || estado === "activo";
    const kit = await this.prisma.kitTipico.update({
      where: { id },
      data: { activo: nuevoEstado },
    });
    return { message: "Estado actualizado", data: kit };
  }

  /**
   * Obtener todos los kits predefinidos (hardcoded)
   */
  async getPredefinedKits() {
    return {
      data: Object.entries(KITS_PREDEFINIDOS).map(([key, value]) => ({
        tipo: key,
        ...value,
      })),
    };
  }

  /**
   * Obtener un kit predefinido específico por tipo
   */
  async getPredefinedKit(tipo: string) {
    const kit = KITS_PREDEFINIDOS[tipo as keyof typeof KITS_PREDEFINIDOS];
    if (!kit)
      throw new NotFoundException(`Kit predefinido ${tipo} no encontrado`);
    return { tipo, ...kit };
  }

  /**
   * Aplicar kit de base de datos a una ejecución
   */
  async applyKitToExecution(
    kitId: string,
    ejecucionId: string,
    userId: string,
  ) {
    const kit = await this.findOne(kitId);

    const ejecucion = await this.prisma.ejecucion.findUnique({
      where: { id: ejecucionId },
    });

    if (!ejecucion) {
      throw new NotFoundException("Ejecución no encontrada");
    }

    const checklistItems = parseChecklistItems(kit.checklistItems);
    const herramientas = parseHerramientas(kit.herramientas);
    const equipos = parseEquipos(kit.equipos);

    const checklistPrincipal = await this.prisma.checklistEjecucion.create({
      data: {
        ejecucionId,
        nombre: `Kit: ${kit.nombre}`,
        descripcion: kit.descripcion,
        completada: false,
      },
    });

    const herramientasItems = herramientas.map((h) => ({
      checklistId: checklistPrincipal.id,
      nombre: `${h.nombre} (Cant: ${h.cantidad})`,
      estado: "pendiente",
      completado: false,
      observaciones: h.certificacion ? "REQUIERE CERTIFICACIÓN" : null,
    }));

    const equiposItems = equipos.map((e) => ({
      checklistId: checklistPrincipal.id,
      nombre: `${e.nombre} (Cant: ${e.cantidad})`,
      estado: "pendiente",
      completado: false,
      observaciones: e.certificacion ? "REQUIERE CERTIFICACIÓN" : null,
    }));

    const actividadesItems = checklistItems.map((item) => ({
      checklistId: checklistPrincipal.id,
      nombre: item,
      estado: "pendiente",
      completado: false,
    }));

    if (
      herramientasItems.length > 0 ||
      equiposItems.length > 0 ||
      actividadesItems.length > 0
    ) {
      await this.prisma.checklistItemEjecucion.createMany({
        data: [...herramientasItems, ...equiposItems, ...actividadesItems],
      });
    }

    const checklistCompleto = await this.prisma.checklistEjecucion.findUnique({
      where: { id: checklistPrincipal.id },
      include: { items: true },
    });

    return {
      message: "Kit aplicado a la ejecución correctamente",
      data: {
        kitAplicado: kit.nombre,
        totalHerramientas: herramientas.length,
        totalEquipos: equipos.length,
        totalActividades: checklistItems.length,
        itemsCreados: checklistCompleto?.items.length || 0,
        checklist: checklistCompleto,
      },
    };
  }

  /**
   * Aplicar kit predefinido a una ejecución
   */
  async applyPredefinedKitToExecution(
    tipo: string,
    ejecucionId: string,
    userId: string,
  ) {
    const kit = KITS_PREDEFINIDOS[tipo as keyof typeof KITS_PREDEFINIDOS];
    if (!kit)
      throw new NotFoundException(`Kit predefinido ${tipo} no encontrado`);

    const ejecucion = await this.prisma.ejecucion.findUnique({
      where: { id: ejecucionId },
    });

    if (!ejecucion) {
      throw new NotFoundException("Ejecución no encontrada");
    }

    const checklistPrincipal = await this.prisma.checklistEjecucion.create({
      data: {
        ejecucionId,
        nombre: kit.nombre,
        descripcion: kit.descripcion,
        completada: false,
      },
    });

    const herramientasItems = kit.herramientas.map((h) => ({
      checklistId: checklistPrincipal.id,
      nombre: `🔧 ${h.nombre} (Cant: ${h.cantidad})`,
      estado: "pendiente",
      completado: false,
      observaciones: h.certificacion ? "⚠️ CERTIFICACIÓN REQUERIDA" : null,
    }));

    const equiposItems = kit.equipos.map((e) => ({
      checklistId: checklistPrincipal.id,
      nombre: `🛡️ ${e.nombre} (Cant: ${e.cantidad})`,
      estado: "pendiente",
      completado: false,
      observaciones: e.certificacion ? "⚠️ CERTIFICACIÓN REQUERIDA" : null,
    }));

    const documentosItems = kit.documentos.map((doc) => ({
      checklistId: checklistPrincipal.id,
      nombre: `📄 ${doc}`,
      estado: "pendiente",
      completado: false,
    }));

    const actividadesItems = kit.checklistItems.map((item) => ({
      checklistId: checklistPrincipal.id,
      nombre: `📋 ${item}`,
      estado: "pendiente",
      completado: false,
    }));

    await this.prisma.checklistItemEjecucion.createMany({
      data: [
        ...herramientasItems,
        ...equiposItems,
        ...documentosItems,
        ...actividadesItems,
      ],
    });

    const checklistCompleto = await this.prisma.checklistEjecucion.findUnique({
      where: { id: checklistPrincipal.id },
      include: { items: true },
    });

    return {
      message: `Kit "${kit.nombre}" aplicado correctamente`,
      data: {
        kitAplicado: kit.nombre,
        duracionEstimada: `${kit.duracionEstimadaHoras} horas`,
        totalHerramientas: kit.herramientas.length,
        totalEquipos: kit.equipos.length,
        totalDocumentos: kit.documentos.length,
        totalActividades: kit.checklistItems.length,
        itemsCreados: checklistCompleto?.items.length || 0,
        checklist: checklistCompleto,
      },
    };
  }

  /**
   * Sincronizar kits predefinidos a la base de datos
   */
  async syncPredefinedKits() {
    const results: Array<{ tipo: string; status: string; id: string }> = [];

    for (const [tipo, kit] of Object.entries(KITS_PREDEFINIDOS)) {
      const existingKit = await this.prisma.kitTipico.findFirst({
        where: { nombre: kit.nombre },
      });

      if (!existingKit) {
        const newKit = await this.prisma.kitTipico.create({
          data: {
            nombre: kit.nombre,
            descripcion: kit.descripcion,
            herramientas: kit.herramientas as object,
            equipos: kit.equipos as object,
            documentos: kit.documentos,
            checklistItems: kit.checklistItems,
            duracionEstimadaHoras: kit.duracionEstimadaHoras,
            costoEstimado: 0,
            activo: true,
          },
        });
        results.push({ tipo, status: "created", id: newKit.id });
      } else {
        results.push({ tipo, status: "exists", id: existingKit.id });
      }
    }

    return {
      message: "Sincronización de kits completada",
      data: results,
    };
  }
}
