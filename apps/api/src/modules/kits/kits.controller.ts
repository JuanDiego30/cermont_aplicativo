/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KITS CONTROLLER - CERMONT APLICATIVO (REFACTORIZADO)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PROPÓSITO:
 * Gestión de Kits Típicos para planeación y ejecución de trabajos técnicos
 * 
 * FUNCIONALIDADES:
 * 1. CRUD de kits personalizados (BD)
 * 2. Consulta de kits predefinidos (hardcoded)
 * 3. Aplicación de kits a ejecuciones (genera checklists automáticos)
 * 4. Sincronización de kits predefinidos a BD
 * 
 * ENDPOINTS:
 * - GET    /kits                                      → Listar kits activos
 * - GET    /kits/:id                                  → Obtener kit específico
 * - POST   /kits                                      → Crear kit personalizado
 * - PUT    /kits/:id                                  → Actualizar kit
 * - PATCH  /kits/:id/estado                           → Cambiar estado
 * - DELETE /kits/:id                                  → Desactivar kit
 * - GET    /kits/predefinidos                         → Listar kits hardcoded
 * - GET    /kits/predefinidos/:tipo                   → Obtener kit predefinido
 * - POST   /kits/predefinidos/sync                    → Sincronizar a BD
 * - POST   /kits/:id/aplicar/:ejecucionId             → Aplicar kit guardado
 * - POST   /kits/predefinidos/:tipo/aplicar/:ejecucionId → Aplicar kit predefinido
 * 
 * SEGURIDAD:
 * - JWT requerido en todos los endpoints
 * - RBAC: admin/supervisor para escritura, todos para lectura
 * - Rate limiting por tipo de operación
 * - Validación de DTOs con class-validator
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    Logger,
    Req,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { KitsService } from './kits.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateKitDto, UpdateKitDto } from './dto/kit.dto';

@ApiTags('Kits Típicos')
@Controller('kits')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class KitsController {
    private readonly logger = new Logger(KitsController.name);

    constructor(private readonly kitsService: KitsService) { }

    // ═══════════════════════════════════════════════════════════════════════
    // KITS GUARDADOS EN BD
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * ✅ LISTAR TODOS LOS KITS ACTIVOS
     */
    @Get()
    @Throttle({ default: { limit: 100, ttl: 60000 } })
    @ApiOperation({
        summary: 'Listar kits típicos activos',
        description: 'Obtiene todos los kits almacenados en BD que están activos',
    })
    @ApiResponse({ status: 200, description: 'Lista de kits obtenida' })
    async findAll() {
        const context = { action: 'LIST_KITS' };
        this.logger.log('Listando kits activos', context);

        try {
            return await this.kitsService.findAll();
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error listando kits', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    /**
     * ✅ OBTENER KIT POR ID
     */
    @Get(':id')
    @Throttle({ default: { limit: 100, ttl: 60000 } })
    @ApiOperation({ summary: 'Obtener kit por ID' })
    @ApiParam({ name: 'id', description: 'UUID del kit' })
    @ApiResponse({ status: 200, description: 'Kit obtenido' })
    @ApiResponse({ status: 404, description: 'Kit no encontrado' })
    async findOne(@Param('id') id: string) {
        const context = { action: 'GET_KIT', kitId: id };
        this.logger.log('Obteniendo kit', context);

        try {
            return await this.kitsService.findOne(id);
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error obteniendo kit', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    /**
     * ✅ CREAR KIT PERSONALIZADO
     */
    @Post()
    @Roles('admin', 'supervisor')
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear kit típico personalizado',
        description: 'Crea un nuevo kit adaptado a necesidades específicas',
    })
    @ApiBody({ type: CreateKitDto })
    @ApiResponse({ status: 201, description: 'Kit creado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
    async create(@Body() dto: CreateKitDto, @Req() req: any) {
        const context = {
            action: 'CREATE_KIT',
            userId: req.user?.userId,
            kitNombre: dto.nombre,
        };
        this.logger.log('Creando kit personalizado', context);

        try {
            const result = await this.kitsService.create(dto);

            this.logger.log('Kit creado exitosamente', {
                ...context,
                kitId: result.data?.id,
            });

            return result;
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error creando kit', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    /**
     * ✅ ACTUALIZAR KIT EXISTENTE
     */
    @Put(':id')
    @Roles('admin', 'supervisor')
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    @ApiOperation({ summary: 'Actualizar kit existente' })
    @ApiParam({ name: 'id', description: 'UUID del kit' })
    @ApiBody({ type: UpdateKitDto })
    @ApiResponse({ status: 200, description: 'Kit actualizado' })
    @ApiResponse({ status: 404, description: 'Kit no encontrado' })
    @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateKitDto,
        @Req() req: any,
    ) {
        const context = {
            action: 'UPDATE_KIT',
            kitId: id,
            userId: req.user?.userId,
        };
        this.logger.log('Actualizando kit', context);

        try {
            const result = await this.kitsService.update(id, dto);

            this.logger.log('Kit actualizado exitosamente', context);

            return result;
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error actualizando kit', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    /**
     * ✅ CAMBIAR ESTADO DE KIT
     */
    @Patch(':id/estado')
    @Roles('admin', 'supervisor')
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    @ApiOperation({
        summary: 'Cambiar estado de un kit',
        description: 'Activa o desactiva un kit sin eliminarlo',
    })
    @ApiParam({ name: 'id', description: 'UUID del kit' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                estado: {
                    type: 'string',
                    enum: ['activo', 'inactivo'],
                    example: 'inactivo',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Estado actualizado' })
    @ApiResponse({ status: 404, description: 'Kit no encontrado' })
    async changeEstado(
        @Param('id') id: string,
        @Body('estado') estado: string,
        @Req() req: any,
    ) {
        const context = {
            action: 'CHANGE_KIT_ESTADO',
            kitId: id,
            estado,
            userId: req.user?.userId,
        };
        this.logger.log('Cambiando estado de kit', context);

        try {
            const result = await this.kitsService.changeEstado(id, estado);

            this.logger.log('Estado de kit actualizado', context);

            return result;
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error cambiando estado de kit', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    /**
     * ✅ DESACTIVAR KIT (SOFT DELETE)
     */
    @Delete(':id')
    @Roles('admin')
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @ApiOperation({
        summary: 'Desactivar kit',
        description: 'Marca el kit como inactivo (no elimina físicamente)',
    })
    @ApiParam({ name: 'id', description: 'UUID del kit' })
    @ApiResponse({ status: 200, description: 'Kit desactivado' })
    @ApiResponse({ status: 404, description: 'Kit no encontrado' })
    @ApiResponse({ status: 403, description: 'Solo admin puede desactivar' })
    async remove(@Param('id') id: string, @Req() req: any) {
        const context = {
            action: 'DELETE_KIT',
            kitId: id,
            userId: req.user?.userId,
        };
        this.logger.log('Desactivando kit', context);

        try {
            const result = await this.kitsService.remove(id);

            this.logger.log('Kit desactivado exitosamente', context);

            return result;
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error desactivando kit', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // KITS PREDEFINIDOS (HARDCODED)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * ✅ LISTAR KITS PREDEFINIDOS
     */
    @Get('predefinidos')
    @Throttle({ default: { limit: 100, ttl: 60000 } })
    @ApiOperation({
        summary: 'Listar kits predefinidos',
        description: 'Obtiene los 4 kits hardcoded: LINEA_VIDA, CCTV, ELECTRICO, INSTRUMENTACION',
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
                        duracionEstimadaHoras: 4,
                    },
                ],
            },
        },
    })
    async getPredefinedKits() {
        this.logger.log('Obteniendo kits predefinidos');

        try {
            return await this.kitsService.getPredefinedKits();
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error obteniendo kits predefinidos', {
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    /**
     * ✅ OBTENER KIT PREDEFINIDO POR TIPO
     */
    @Get('predefinidos/:tipo')
    @Throttle({ default: { limit: 100, ttl: 60000 } })
    @ApiOperation({ summary: 'Obtener kit predefinido por tipo' })
    @ApiParam({
        name: 'tipo',
        description: 'Tipo de kit',
        enum: ['LINEA_VIDA', 'CCTV', 'ELECTRICO', 'INSTRUMENTACION'],
    })
    @ApiResponse({ status: 200, description: 'Kit predefinido obtenido' })
    @ApiResponse({ status: 404, description: 'Kit predefinido no encontrado' })
    async getPredefinedKit(@Param('tipo') tipo: string) {
        const context = { action: 'GET_PREDEFINED_KIT', tipo };
        this.logger.log('Obteniendo kit predefinido', context);

        try {
            return await this.kitsService.getPredefinedKit(tipo.toUpperCase());
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error obteniendo kit predefinido', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    /**
     * ✅ SINCRONIZAR KITS PREDEFINIDOS A BD
     */
    @Post('predefinidos/sync')
    @Roles('admin')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Sincronizar kits predefinidos a BD',
        description: 'Migra los kits hardcoded a la base de datos (solo admin)',
    })
    @ApiResponse({
        status: 200,
        description: 'Sincronización completada',
        schema: {
            example: {
                message: 'Sincronización completada',
                data: [
                    { tipo: 'LINEA_VIDA', status: 'created', id: 'uuid' },
                    { tipo: 'CCTV', status: 'exists', id: 'uuid' },
                ],
            },
        },
    })
    async syncPredefinedKits(@Req() req: any) {
        const context = { action: 'SYNC_PREDEFINED_KITS', userId: req.user?.userId };
        this.logger.log('Sincronizando kits predefinidos', context);

        try {
            const result = await this.kitsService.syncPredefinedKits();

            this.logger.log('Kits predefinidos sincronizados', {
                ...context,
                count: result.data?.length,
            });

            return result;
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error sincronizando kits predefinidos', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // APLICACIÓN DE KITS A EJECUCIONES
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * ✅ APLICAR KIT GUARDADO A EJECUCIÓN
     */
    @Post(':id/aplicar/:ejecucionId')
    @Throttle({ default: { limit: 30, ttl: 60000 } })
    @ApiOperation({
        summary: 'Aplicar kit guardado a ejecución',
        description: 'Crea automáticamente checklists basados en el kit',
    })
    @ApiParam({ name: 'id', description: 'UUID del kit' })
    @ApiParam({ name: 'ejecucionId', description: 'UUID de la ejecución' })
    @ApiResponse({
        status: 200,
        description: 'Kit aplicado correctamente',
        schema: {
            example: {
                message: 'Kit aplicado correctamente',
                data: {
                    kitAplicado: 'Kit Inspección',
                    totalHerramientas: 6,
                    totalEquipos: 6,
                    itemsCreados: 22,
                },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Kit o ejecución no encontrada' })
    async applyKitToExecution(
        @Param('id') kitId: string,
        @Param('ejecucionId') ejecucionId: string,
        @Req() req: any,
    ) {
        const context = {
            action: 'APPLY_KIT',
            kitId,
            ejecucionId,
            userId: req.user?.userId,
        };
        this.logger.log('Aplicando kit a ejecución', context);

        try {
            const result = await this.kitsService.applyKitToExecution(
                kitId,
                ejecucionId,
                req.user?.userId || 'system',
            );

            this.logger.log('Kit aplicado exitosamente', {
                ...context,
                itemsCreados: result.data?.itemsCreados,
            });

            return result;
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error aplicando kit', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }

    /**
     * ✅ APLICAR KIT PREDEFINIDO A EJECUCIÓN
     */
    @Post('predefinidos/:tipo/aplicar/:ejecucionId')
    @Throttle({ default: { limit: 30, ttl: 60000 } })
    @ApiOperation({
        summary: 'Aplicar kit predefinido a ejecución',
        description: 'Aplica kit hardcoded creando checklists con emojis',
    })
    @ApiParam({
        name: 'tipo',
        description: 'Tipo de kit',
        enum: ['LINEA_VIDA', 'CCTV', 'ELECTRICO', 'INSTRUMENTACION'],
    })
    @ApiParam({ name: 'ejecucionId', description: 'UUID de la ejecución' })
    @ApiResponse({
        status: 200,
        description: 'Kit predefinido aplicado',
        schema: {
            example: {
                message: 'Kit "LINEA_VIDA" aplicado correctamente',
                data: {
                    kitAplicado: 'Kit Inspección Líneas de Vida',
                    duracionEstimada: '4 horas',
                    itemsCreados: 26,
                },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Kit o ejecución no encontrada' })
    async applyPredefinedKitToExecution(
        @Param('tipo') tipo: string,
        @Param('ejecucionId') ejecucionId: string,
        @Req() req: any,
    ) {
        const context = {
            action: 'APPLY_PREDEFINED_KIT',
            tipo,
            ejecucionId,
            userId: req.user?.userId,
        };
        this.logger.log('Aplicando kit predefinido', context);

        try {
            const result = await this.kitsService.applyPredefinedKitToExecution(
                tipo.toUpperCase(),
                ejecucionId,
                req.user?.userId || 'system',
            );

            this.logger.log('Kit predefinido aplicado exitosamente', {
                ...context,
                itemsCreados: result.data?.itemsCreados,
            });

            return result;
        } catch (error) {
            const err = error as Error;
            this.logger.error('Error aplicando kit predefinido', {
                ...context,
                error: err.message,
                stack: err.stack,
            });
            throw error;
        }
    }
}
