/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KITS CONTROLLER - CERMONT APLICATIVO
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PROPÓSITO:
 * Controlador REST API que expone endpoints para gestionar los "Kits Típicos"
 * utilizados en la planeación y ejecución de trabajos técnicos.
 * 
 * ENDPOINTS DISPONIBLES:
 * 
 * 1. GESTIÓN DE KITS PERSONALIZADOS (Base de datos):
 *    GET    /kits                    → Lista todos los kits activos
 *    GET    /kits/:id                → Obtiene un kit específico
 *    POST   /kits                    → Crea un nuevo kit (admin/supervisor)
 *    PUT    /kits/:id                → Actualiza un kit (admin/supervisor)
 *    DELETE /kits/:id                → Desactiva un kit (solo admin)
 * 
 * 2. KITS PREDEFINIDOS (Hardcoded):
 *    GET    /kits/predefinidos                → Lista todos los kits predefinidos
 *    GET    /kits/predefinidos/:tipo          → Obtiene kit por tipo
 *    POST   /kits/predefinidos/sync           → Sincroniza a BD (solo admin)
 * 
 * 3. APLICACIÓN DE KITS A EJECUCIONES:
 *    POST   /kits/:id/aplicar/:ejecucionId              → Aplica kit guardado
 *    POST   /kits/predefinidos/:tipo/aplicar/:ejecucionId → Aplica kit predefinido
 * 
 * ROLES Y PERMISOS:
 * - Lectura (GET): Todos los usuarios autenticados
 * - Creación/Edición: admin, supervisor
 * - Eliminación/Sincronización: solo admin
 * 
 * FLUJO DE USO TÍPICO:
 * 1. Técnico consulta kits disponibles: GET /kits/predefinidos
 * 2. Al crear ejecución, aplica kit: POST /kits/predefinidos/LINEA_VIDA/aplicar/{ejecucionId}
 * 3. Sistema crea automáticamente todos los checklists necesarios
 * 4. Técnico verifica items en campo usando ChecklistsController
 * 
 * SEGURIDAD:
 * - Requiere JWT válido (@UseGuards(JwtAuthGuard))
 * - Valida roles específicos (@Roles decorator)
 * - Audita todas las modificaciones
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiBody,
} from '@nestjs/swagger';
import { KitsService } from './kits.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateKitDto, UpdateKitDto } from './dto/kit.dto';

@ApiTags('Kits Típicos')
@Controller('kits')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class KitsController {
    constructor(private readonly kitsService: KitsService) { }

    /**
     * ✅ OBTENER TODOS LOS KITS ACTIVOS
     * GET /kits
     */
    @Get()
    @ApiOperation({
        summary: 'Obtener todos los kits típicos activos',
        description:
            'Lista todos los kits almacenados en la base de datos que están marcados como activos',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de kits obtenida correctamente',
        schema: {
            example: {
                data: [
                    {
                        id: 'uuid',
                        nombre: 'Kit Inspección Líneas de Vida',
                        descripcion: 'Herramientas y equipos para...',
                        duracionEstimadaHoras: 4,
                        costoEstimado: 150000,
                        activo: true,
                    },
                ],
            },
        },
    })
    async findAll() {
        return this.kitsService.findAll();
    }

    /**
     * ✅ OBTENER KITS PREDEFINIDOS (HARDCODED)
     * GET /kits/predefinidos
     */
    @Get('predefinidos')
    @ApiOperation({
        summary: 'Obtener lista de kits predefinidos',
        description:
            'Retorna los 4 kits predefinidos hardcoded: LINEA_VIDA, CCTV, ELECTRICO, INSTRUMENTACION',
    })
    @ApiResponse({
        status: 200,
        description: 'Kits predefinidos obtenidos',
        schema: {
            example: {
                data: [
                    {
                        tipo: 'LINEA_VIDA',
                        nombre: 'Kit Inspección Líneas de Vida',
                        descripcion: 'Herramientas y equipos para inspección...',
                        herramientas: [
                            { nombre: 'Calibrador pie de rey', cantidad: 1, certificacion: true },
                        ],
                        equipos: [
                            { nombre: 'Arnés de seguridad', cantidad: 1, certificacion: true },
                        ],
                        documentos: ['Formato Inspección Líneas de Vida Vertical'],
                        checklistItems: ['Verificar estado general del cable de acero'],
                        duracionEstimadaHoras: 4,
                    },
                ],
            },
        },
    })
    async getPredefinedKits() {
        return this.kitsService.getPredefinedKits();
    }

    /**
     * ✅ OBTENER UN KIT PREDEFINIDO ESPECÍFICO
     * GET /kits/predefinidos/:tipo
     */
    @Get('predefinidos/:tipo')
    @ApiOperation({
        summary: 'Obtener un kit predefinido por tipo',
        description: 'Tipos válidos: LINEA_VIDA, CCTV, ELECTRICO, INSTRUMENTACION',
    })
    @ApiParam({
        name: 'tipo',
        description: 'Tipo de kit',
        enum: ['LINEA_VIDA', 'CCTV', 'ELECTRICO', 'INSTRUMENTACION'],
    })
    @ApiResponse({ status: 200, description: 'Kit predefinido obtenido' })
    @ApiResponse({ status: 404, description: 'Kit predefinido no encontrado' })
    async getPredefinedKit(@Param('tipo') tipo: string) {
        return this.kitsService.getPredefinedKit(tipo.toUpperCase());
    }

    /**
     * ✅ SINCRONIZAR KITS PREDEFINIDOS A LA BASE DE DATOS
     * POST /kits/predefinidos/sync
     * Requiere: rol ADMIN
     */
    @Post('predefinidos/sync')
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Sincronizar kits predefinidos a la base de datos',
        description:
            'Migra los kits hardcoded a la base de datos para hacerlos editables. Solo admin.',
    })
    @ApiResponse({
        status: 200,
        description: 'Sincronización completada',
        schema: {
            example: {
                message: 'Sincronización de kits completada',
                data: [
                    { tipo: 'LINEA_VIDA', status: 'created', id: 'uuid' },
                    { tipo: 'CCTV', status: 'exists', id: 'uuid' },
                ],
            },
        },
    })
    async syncPredefinedKits() {
        return this.kitsService.syncPredefinedKits();
    }

    /**
     * ✅ OBTENER UN KIT POR ID
     * GET /kits/:id
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtener un kit por ID' })
    @ApiParam({ name: 'id', description: 'UUID del kit' })
    @ApiResponse({ status: 200, description: 'Kit obtenido correctamente' })
    @ApiResponse({ status: 404, description: 'Kit no encontrado' })
    async findOne(@Param('id') id: string) {
        return this.kitsService.findOne(id);
    }

    /**
     * ✅ CREAR UN NUEVO KIT PERSONALIZADO
     * POST /kits
     * Requiere: rol ADMIN o SUPERVISOR
     */
    @Post()
    @Roles('admin', 'supervisor')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear un nuevo kit típico personalizado',
        description: 'Permite crear kits adaptados a necesidades específicas del cliente',
    })
    @ApiBody({
        type: CreateKitDto,
        examples: {
            example1: {
                summary: 'Kit personalizado ejemplo',
                value: {
                    nombre: 'Kit Mantenimiento Predictivo',
                    descripcion: 'Kit especializado para análisis vibracional',
                    herramientas: [
                        { nombre: 'Analizador de vibraciones', cantidad: 1, certificacion: true },
                    ],
                    equipos: [{ nombre: 'EPP completo', cantidad: 1, certificacion: true }],
                    documentos: ['Formato de análisis vibracional'],
                    checklistItems: ['Tomar lecturas en puntos críticos'],
                    duracionEstimadaHoras: 6,
                    costoEstimado: 500000,
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Kit creado exitosamente' })
    @ApiResponse({ status: 403, description: 'No tiene permisos suficientes' })
    async create(@Body() dto: CreateKitDto) {
        return this.kitsService.create(dto);
    }

    /**
     * ✅ ACTUALIZAR UN KIT EXISTENTE
     * PUT /kits/:id
     * Requiere: rol ADMIN o SUPERVISOR
     */
    @Put(':id')
    @Roles('admin', 'supervisor')
    @ApiOperation({ summary: 'Actualizar un kit típico existente' })
    @ApiParam({ name: 'id', description: 'UUID del kit a actualizar' })
    @ApiBody({ type: UpdateKitDto })
    @ApiResponse({ status: 200, description: 'Kit actualizado correctamente' })
    @ApiResponse({ status: 404, description: 'Kit no encontrado' })
    @ApiResponse({ status: 403, description: 'No tiene permisos suficientes' })
    async update(@Param('id') id: string, @Body() dto: UpdateKitDto) {
        return this.kitsService.update(id, dto);
    }

    /**
     * ✅ DESACTIVAR UN KIT (SOFT DELETE)
     * DELETE /kits/:id
     * Requiere: rol ADMIN
     */
    @Delete(':id')
    @Roles('admin')
    @ApiOperation({
        summary: 'Desactivar un kit típico',
        description: 'No elimina físicamente, solo marca como inactivo',
    })
    @ApiParam({ name: 'id', description: 'UUID del kit a desactivar' })
    @ApiResponse({ status: 200, description: 'Kit desactivado correctamente' })
    @ApiResponse({ status: 404, description: 'Kit no encontrado' })
    @ApiResponse({ status: 403, description: 'No tiene permisos suficientes' })
    async remove(@Param('id') id: string) {
        return this.kitsService.remove(id);
    }

    /**
     * ✅ APLICAR KIT GUARDADO A UNA EJECUCIÓN
     * POST /kits/:id/aplicar/:ejecucionId
     * 
     * Crea automáticamente todos los checklists necesarios basados en el kit
     */
    @Post(':id/aplicar/:ejecucionId')
    @ApiOperation({
        summary: 'Aplicar kit guardado a una ejecución',
        description:
            'Crea automáticamente todos los checklists de verificación (herramientas, equipos, actividades) para la ejecución especificada',
    })
    @ApiParam({ name: 'id', description: 'UUID del kit a aplicar' })
    @ApiParam({ name: 'ejecucionId', description: 'UUID de la ejecución' })
    @ApiResponse({
        status: 200,
        description: 'Kit aplicado correctamente, checklists creados',
        schema: {
            example: {
                message: 'Kit aplicado a la ejecución correctamente',
                data: {
                    kitAplicado: 'Kit Inspección Líneas de Vida',
                    totalHerramientas: 6,
                    totalEquipos: 6,
                    totalActividades: 10,
                    itemsCreados: 22,
                    checklist: {
                        id: 'uuid',
                        nombre: 'Kit: Kit Inspección Líneas de Vida',
                        items: [],
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Kit o ejecución no encontrada' })
    async applyKitToExecution(
        @Param('id') kitId: string,
        @Param('ejecucionId') ejecucionId: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.kitsService.applyKitToExecution(kitId, ejecucionId, user.userId);
    }

    /**
     * ✅ APLICAR KIT PREDEFINIDO A UNA EJECUCIÓN
     * POST /kits/predefinidos/:tipo/aplicar/:ejecucionId
     * 
     * Usa los kits hardcoded para crear checklists organizados
     */
    @Post('predefinidos/:tipo/aplicar/:ejecucionId')
    @ApiOperation({
        summary: 'Aplicar kit predefinido a una ejecución',
        description:
            'Aplica un kit predefinido (LINEA_VIDA, CCTV, etc.) creando todos los checklists con emojis visuales',
    })
    @ApiParam({
        name: 'tipo',
        description: 'Tipo de kit predefinido',
        enum: ['LINEA_VIDA', 'CCTV', 'ELECTRICO', 'INSTRUMENTACION'],
    })
    @ApiParam({ name: 'ejecucionId', description: 'UUID de la ejecución' })
    @ApiResponse({
        status: 200,
        description: 'Kit predefinido aplicado correctamente',
        schema: {
            example: {
                message: 'Kit "Kit Inspección Líneas de Vida" aplicado correctamente',
                data: {
                    kitAplicado: 'Kit Inspección Líneas de Vida',
                    duracionEstimada: '4 horas',
                    totalHerramientas: 6,
                    totalEquipos: 6,
                    totalDocumentos: 4,
                    totalActividades: 10,
                    itemsCreados: 26,
                    checklist: {
                        id: 'uuid',
                        nombre: 'Kit Inspección Líneas de Vida',
                        items: [
                            {
                                nombre: '🔧 Calibrador pie de rey (Cant: 1)',
                                observaciones: '⚠️ CERTIFICACIÓN REQUERIDA',
                            },
                        ],
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Kit predefinido o ejecución no encontrada' })
    async applyPredefinedKitToExecution(
        @Param('tipo') tipo: string,
        @Param('ejecucionId') ejecucionId: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.kitsService.applyPredefinedKitToExecution(
            tipo.toUpperCase(),
            ejecucionId,
            user.userId,
        );
    }
}

