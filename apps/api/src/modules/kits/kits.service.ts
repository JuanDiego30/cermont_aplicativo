/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KITS SERVICE - CERMONT APLICATIVO
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PROPÓSITO:
 * Este servicio gestiona los "Kits Típicos" que son plantillas predefinidas de
 * herramientas, equipos, documentos y actividades necesarias para realizar
 * trabajos específicos en CERMONT (inspecciones de líneas de vida, mantenimiento
 * CCTV, trabajos eléctricos, instrumentación, etc.).
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * 
 * 1. GESTIÓN DE KITS PERSONALIZADOS (Base de datos):
 *    - Crear, leer, actualizar y desactivar kits almacenados en PostgreSQL
 *    - Permite a los administradores crear kits personalizados según necesidades
 * 
 * 2. KITS PREDEFINIDOS (Hardcoded):
 *    - Contiene 4 kits estándar: LINEA_VIDA, CCTV, ELECTRICO, INSTRUMENTACION
 *    - Cada kit incluye:
 *      • Herramientas requeridas (con indicador si requiere certificación)
 *      • Equipos de seguridad (EPP) necesarios
 *      • Documentos obligatorios a completar
 *      • Checklist de actividades paso a paso
 *      • Duración estimada del trabajo
 * 
 * 3. APLICACIÓN DE KITS A EJECUCIONES:
 *    - Cuando se inicia una ejecución de trabajo, se puede aplicar un kit
 *    - El sistema crea automáticamente todos los checklists necesarios
 *    - Convierte los items del kit en tareas verificables con emojis visuales
 * 
 * 4. SINCRONIZACIÓN:
 *    - Permite sincronizar los kits predefinidos a la base de datos
 *    - Útil para migrar de hardcoded a configurables
 * 
 * FLUJO DE USO TÍPICO:
 * 1. Técnico recibe orden de inspección de línea de vida
 * 2. Al crear la ejecución, se aplica el kit "LINEA_VIDA"
 * 3. El sistema genera automáticamente 3 tipos de checklists:
 *    - 🔧 Verificación de herramientas (6 items)
 *    - 🛡️ Verificación de equipos de seguridad (6 items)
 *    - 📄 Documentos a completar (4 items)
 *    - 📋 Actividades a realizar (10 items)
 * 4. El técnico va marcando cada item como completado en campo
 * 5. Al finalizar, se valida que todos los items estén OK
 * 
 * SOLUCIÓN A FALLAS IDENTIFICADAS:
 * - ✅ Falla #1: "No se tienen todas las herramientas porque el alcance no se
 *               ha detallado a fondo" → Ahora hay listados típicos predefinidos
 * - ✅ Falla #2: "Al momento de ejecutar no se tienen herramientas completas
 *               por olvido" → El checklist obliga a verificar antes de iniciar
 * 
 * INTEGRACIÓN CON OTROS MÓDULOS:
 * - Se conecta con ChecklistsService para crear los items verificables
 * - Se conecta con EjecucionesService para aplicar el kit al iniciar trabajo
 * - Se conecta con PlaneacionService para estimar duración y recursos
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Kits típicos predefinidos según actividades de CERMONT
const KITS_PREDEFINIDOS = {
    LINEA_VIDA: {
        nombre: 'Kit Inspección Líneas de Vida',
        descripcion: 'Herramientas y equipos para inspección de líneas de vida verticales',
        herramientas: [
            { nombre: 'Calibrador pie de rey', cantidad: 1, certificacion: true },
            { nombre: 'Flexómetro 5m', cantidad: 1, certificacion: false },
            { nombre: 'Llave de boca 13mm', cantidad: 1, certificacion: false },
            { nombre: 'Destornillador de pala', cantidad: 1, certificacion: false },
            { nombre: 'Linterna LED', cantidad: 1, certificacion: false },
            { nombre: 'Espejo de inspección', cantidad: 1, certificacion: false },
        ],
        equipos: [
            { nombre: 'Arnés de seguridad', cantidad: 1, certificacion: true },
            { nombre: 'Eslinga doble con absorbedor', cantidad: 1, certificacion: true },
            { nombre: 'Mosquetones tipo C', cantidad: 4, certificacion: true },
            { nombre: 'Casco con barbuquejo', cantidad: 1, certificacion: true },
            { nombre: 'Gafas de seguridad', cantidad: 1, certificacion: false },
            { nombre: 'Guantes de seguridad', cantidad: 1, certificacion: false },
        ],
        documentos: [
            'Formato Inspección Líneas de Vida Vertical',
            'Permiso de Trabajo en Alturas',
            'AST - Análisis Seguro de Trabajo',
            'ATS - Matriz de riesgos',
        ],
        checklistItems: [
            'Verificar estado general del cable de acero',
            'Inspeccionar placa de anclaje superior',
            'Verificar tensor y su funcionamiento',
            'Revisar placa de anclaje inferior',
            'Comprobar ausencia de corrosión',
            'Verificar soldaduras y puntos de sujeción',
            'Medir diámetro del cable con calibrador',
            'Verificar certificaciones vigentes',
            'Documentar con fotografías cada componente',
            'Firmar formato de inspección',
        ],
        duracionEstimadaHoras: 4,
    },
    CCTV: {
        nombre: 'Kit Mantenimiento CCTV',
        descripcion: 'Herramientas y equipos para mantenimiento de sistemas CCTV',
        herramientas: [
            { nombre: 'Destornillador de estrella', cantidad: 1, certificacion: false },
            { nombre: 'Destornillador de pala', cantidad: 1, certificacion: false },
            { nombre: 'Pinzas electricas', cantidad: 1, certificacion: false },
            { nombre: 'Probador de cables RJ45', cantidad: 1, certificacion: true },
            { nombre: 'Multímetro digital', cantidad: 1, certificacion: true },
            { nombre: 'Kit ponchadora con conectores', cantidad: 1, certificacion: false },
            { nombre: 'Laptop con software de configuración', cantidad: 1, certificacion: false },
        ],
        equipos: [
            { nombre: 'Escalera tipo A 6 pasos', cantidad: 1, certificacion: true },
            { nombre: 'Arnés de seguridad', cantidad: 1, certificacion: true },
            { nombre: 'Casco dieléctrico', cantidad: 1, certificacion: true },
            { nombre: 'Gafas de seguridad', cantidad: 1, certificacion: false },
            { nombre: 'Guantes dieléctricos', cantidad: 1, certificacion: true },
        ],
        documentos: [
            'Formato Mantenimiento CCTV',
            'Permiso de Trabajo',
            'Manual técnico del DVR/NVR',
            'Diagrama de conexiones',
        ],
        checklistItems: [
            'Verificar alimentación eléctrica del sistema',
            'Comprobar conexiones de red/coaxial',
            'Limpiar lentes de cámaras',
            'Verificar enfoque y ángulo de visión',
            'Probar grabación en DVR/NVR',
            'Verificar espacio en disco duro',
            'Actualizar firmware si es necesario',
            'Comprobar visualización remota',
            'Documentar con capturas de pantalla',
            'Firmar formato de mantenimiento',
        ],
        duracionEstimadaHoras: 6,
    },
    ELECTRICO: {
        nombre: 'Kit Mantenimiento Eléctrico',
        descripcion: 'Herramientas y equipos para trabajos eléctricos',
        herramientas: [
            { nombre: 'Multímetro digital', cantidad: 1, certificacion: true },
            { nombre: 'Pinza amperimétrica', cantidad: 1, certificacion: true },
            { nombre: 'Detector de voltaje', cantidad: 1, certificacion: true },
            { nombre: 'Destornilladores aislados', cantidad: 1, certificacion: true },
            { nombre: 'Alicates aislados', cantidad: 1, certificacion: true },
            { nombre: 'Pelacables', cantidad: 1, certificacion: false },
            { nombre: 'Cinta aislante', cantidad: 2, certificacion: false },
            { nombre: 'Terminales y conectores', cantidad: 1, certificacion: false },
        ],
        equipos: [
            { nombre: 'Guantes dieléctricos clase 0', cantidad: 1, certificacion: true },
            { nombre: 'Casco dieléctrico', cantidad: 1, certificacion: true },
            { nombre: 'Botas dieléctricas', cantidad: 1, certificacion: true },
            { nombre: 'Gafas de protección UV', cantidad: 1, certificacion: false },
            { nombre: 'Tapete aislante', cantidad: 1, certificacion: true },
        ],
        documentos: [
            'Permiso de Trabajo Eléctrico',
            'AST - Análisis Seguro de Trabajo',
            'Diagrama unifilar',
            'Procedimiento de bloqueo y etiquetado',
        ],
        checklistItems: [
            'Verificar desenergización del circuito',
            'Aplicar procedimiento LOTO',
            'Medir ausencia de tensión',
            'Verificar estado de conductores',
            'Reapretar conexiones',
            'Medir resistencia de aislamiento',
            'Verificar protecciones térmicas',
            'Comprobar funcionamiento de interruptores',
            'Documentar mediciones realizadas',
            'Retirar LOTO siguiendo procedimiento',
        ],
        duracionEstimadaHoras: 8,
    },
    INSTRUMENTACION: {
        nombre: 'Kit Instrumentación Industrial',
        descripcion: 'Herramientas para calibración y mantenimiento de instrumentos',
        herramientas: [
            { nombre: 'Calibrador de presión', cantidad: 1, certificacion: true },
            { nombre: 'Simulador de señales 4-20mA', cantidad: 1, certificacion: true },
            { nombre: 'Multímetro de precisión', cantidad: 1, certificacion: true },
            { nombre: 'Termómetro infrarrojo', cantidad: 1, certificacion: true },
            { nombre: 'Destornilladores de precisión', cantidad: 1, certificacion: false },
            { nombre: 'Llaves Allen métricas', cantidad: 1, certificacion: false },
        ],
        equipos: [
            { nombre: 'Laptop con software de calibración', cantidad: 1, certificacion: false },
            { nombre: 'Comunicador HART', cantidad: 1, certificacion: true },
            { nombre: 'EPP básico', cantidad: 1, certificacion: true },
        ],
        documentos: [
            'Hoja de datos del instrumento',
            'Procedimiento de calibración',
            'Certificados de patrones',
            'Formato de calibración',
        ],
        checklistItems: [
            'Identificar tag del instrumento',
            'Verificar alimentación eléctrica/neumática',
            'Realizar prueba de cero',
            'Verificar span del instrumento',
            'Calibrar según procedimiento',
            'Documentar valores antes y después',
            'Etiquetar instrumento calibrado',
            'Registrar fecha próxima calibración',
        ],
        duracionEstimadaHoras: 4,
    },
};

@Injectable()
export class KitsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Obtener todos los kits activos de la base de datos
     */
    async findAll() {
        const kits = await this.prisma.kitTipico.findMany({
            where: { activo: true },
            orderBy: { nombre: 'asc' },
        });
        return { data: kits };
    }

    /**
     * Obtener un kit específico por ID
     */
    async findOne(id: string) {
        const kit = await this.prisma.kitTipico.findUnique({ where: { id } });
        if (!kit) throw new NotFoundException('Kit no encontrado');
        return kit;
    }

    /**
     * Crear un nuevo kit personalizado
     */
    async create(dto: any) {
        const kit = await this.prisma.kitTipico.create({ data: dto });
        return { message: 'Kit creado', data: kit };
    }

    /**
     * Actualizar un kit existente
     */
    async update(id: string, dto: any) {
        await this.findOne(id);
        const kit = await this.prisma.kitTipico.update({
            where: { id },
            data: dto,
        });
        return { message: 'Kit actualizado', data: kit };
    }

    /**
     * Desactivar un kit (soft delete)
     */
    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.kitTipico.update({
            where: { id },
            data: { activo: false },
        });
        return { message: 'Kit desactivado' };
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
     * ✅ CORREGIDO: Aplicar kit de base de datos a una ejecución
     * Crea checklists basados en el kit almacenado en PostgreSQL
     */
    async applyKitToExecution(
        kitId: string,
        ejecucionId: string,
        userId: string,
    ) {
        const kit = await this.findOne(kitId);

        // Verificar que la ejecución existe
        const ejecucion = await this.prisma.ejecucion.findUnique({
            where: { id: ejecucionId },
        });

        if (!ejecucion) {
            throw new NotFoundException('Ejecución no encontrada');
        }

        // Obtener datos del kit
        const checklistItems = (kit.checklistItems as string[]) || [];
        const herramientas = (kit.herramientas as any[]) || [];
        const equipos = (kit.equipos as any[]) || [];

        // ✅ FIX: Crear checklist principal primero
        const checklistPrincipal = await this.prisma.checklistEjecucion.create({
            data: {
                ejecucionId,
                nombre: `Kit: ${kit.nombre}`,
                descripcion: kit.descripcion,
                completada: false,
            },
        });

        // Crear items de verificación de herramientas
        const herramientasItems = herramientas.map((h) => ({
            checklistId: checklistPrincipal.id,
            nombre: `${h.nombre} (Cant: ${h.cantidad})`,
            estado: 'pendiente',
            completado: false,
            observaciones: h.certificacion ? 'REQUIERE CERTIFICACIÓN' : null,
        }));

        // Crear items de verificación de equipos
        const equiposItems = equipos.map((e) => ({
            checklistId: checklistPrincipal.id,
            nombre: `${e.nombre} (Cant: ${e.cantidad})`,
            estado: 'pendiente',
            completado: false,
            observaciones: e.certificacion ? 'REQUIERE CERTIFICACIÓN' : null,
        }));

        // Crear items de actividades
        const actividadesItems = checklistItems.map((item) => ({
            checklistId: checklistPrincipal.id,
            nombre: item,
            estado: 'pendiente',
            completado: false,
        }));

        // Insertar todos los items del checklist
        if (
            herramientasItems.length > 0 ||
            equiposItems.length > 0 ||
            actividadesItems.length > 0
        ) {
            await this.prisma.checklistItemEjecucion.createMany({
                data: [...herramientasItems, ...equiposItems, ...actividadesItems],
            });
        }

        // Obtener checklist completo con items
        const checklistCompleto = await this.prisma.checklistEjecucion.findUnique({
            where: { id: checklistPrincipal.id },
            include: { items: true },
        });

        return {
            message: 'Kit aplicado a la ejecución correctamente',
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
     * ✅ CORREGIDO: Aplicar kit predefinido a una ejecución
     * Usa los kits hardcoded para crear checklists organizados
     */
    async applyPredefinedKitToExecution(
        tipo: string,
        ejecucionId: string,
        userId: string,
    ) {
        const kit = KITS_PREDEFINIDOS[tipo as keyof typeof KITS_PREDEFINIDOS];
        if (!kit)
            throw new NotFoundException(`Kit predefinido ${tipo} no encontrado`);

        // Verificar que la ejecución existe
        const ejecucion = await this.prisma.ejecucion.findUnique({
            where: { id: ejecucionId },
        });

        if (!ejecucion) {
            throw new NotFoundException('Ejecución no encontrada');
        }

        // ✅ FIX: Crear checklist principal
        const checklistPrincipal = await this.prisma.checklistEjecucion.create({
            data: {
                ejecucionId,
                nombre: kit.nombre,
                descripcion: kit.descripcion,
                completada: false,
            },
        });

        // Crear items de verificación de herramientas
        const herramientasItems = kit.herramientas.map((h) => ({
            checklistId: checklistPrincipal.id,
            nombre: `🔧 ${h.nombre} (Cant: ${h.cantidad})`,
            estado: 'pendiente',
            completado: false,
            observaciones: h.certificacion ? '⚠️ CERTIFICACIÓN REQUERIDA' : null,
        }));

        // Crear items de verificación de equipos
        const equiposItems = kit.equipos.map((e) => ({
            checklistId: checklistPrincipal.id,
            nombre: `🛡️ ${e.nombre} (Cant: ${e.cantidad})`,
            estado: 'pendiente',
            completado: false,
            observaciones: e.certificacion ? '⚠️ CERTIFICACIÓN REQUERIDA' : null,
        }));

        // Crear items de documentos requeridos
        const documentosItems = kit.documentos.map((doc) => ({
            checklistId: checklistPrincipal.id,
            nombre: `📄 ${doc}`,
            estado: 'pendiente',
            completado: false,
        }));

        // Crear items de actividades
        const actividadesItems = kit.checklistItems.map((item) => ({
            checklistId: checklistPrincipal.id,
            nombre: `📋 ${item}`,
            estado: 'pendiente',
            completado: false,
        }));

        // Insertar todos los items del checklist
        await this.prisma.checklistItemEjecucion.createMany({
            data: [
                ...herramientasItems,
                ...equiposItems,
                ...documentosItems,
                ...actividadesItems,
            ],
        });

        // Obtener checklist completo con items
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
     * Útil para migrar de hardcoded a configurables
     */
    async syncPredefinedKits() {
        const results = [];

        for (const [tipo, kit] of Object.entries(KITS_PREDEFINIDOS)) {
            const existingKit = await this.prisma.kitTipico.findUnique({
                where: { nombre: kit.nombre },
            });

            if (!existingKit) {
                const newKit = await this.prisma.kitTipico.create({
                    data: {
                        nombre: kit.nombre,
                        descripcion: kit.descripcion,
                        herramientas: kit.herramientas,
                        equipos: kit.equipos,
                        documentos: kit.documentos,
                        checklistItems: kit.checklistItems,
                        duracionEstimadaHoras: kit.duracionEstimadaHoras,
                        costoEstimado: 0,
                        activo: true,
                    },
                });
                results.push({ tipo, status: 'created', id: newKit.id });
            } else {
                results.push({ tipo, status: 'exists', id: existingKit.id });
            }
        }

        return {
            message: 'Sincronización de kits completada',
            data: results,
        };
    }
}

