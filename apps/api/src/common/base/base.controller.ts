/**
 * @class BaseController
 * @description Abstract base controller with CRUD endpoints
 * @layer Infrastructure
 * 
 * Eliminates ~350 lines of duplicate controller code across modules.
 * Child classes only add domain-specific endpoints.
 */
import {
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { BaseService, PaginatedResult } from './base.service';
import { WhereClause, OrderByClause } from './base.repository';

/** Query parameters for list endpoints */
export interface ListQueryParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

/** Find options for service queries */
export interface FindOptions {
    where?: WhereClause;
    orderBy?: OrderByClause;
}

/**
 * Abstract controller with standard CRUD operations.
 * Extend this and add @Controller('route') decorator.
 */
export abstract class BaseController<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
    constructor(protected readonly service: BaseService<T, TCreate, TUpdate>) { }

    @Get()
    @ApiOperation({ summary: 'Listar todos los registros' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'pageSize', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    async findAll(@Query() query: ListQueryParams): Promise<PaginatedResult<T> | T[]> {
        const { page, pageSize, sortBy, sortOrder, search } = query;

        // Build options from query
        const options: FindOptions = {};

        if (sortBy) {
            options.orderBy = { [sortBy]: sortOrder || 'desc' };
        }

        if (search) {
            // Override in child class for specific search fields
            options.where = this.buildSearchFilter(search);
        }

        // If pagination params provided, use paginated result
        if (page || pageSize) {
            return await this.service.findAllPaginated(
                page || 1,
                pageSize || 10,
                options,
            );
        }

        return await this.service.findAll(options);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener registro por ID' })
    @ApiParam({ name: 'id', type: String })
    async findOne(@Param('id') id: string): Promise<T> {
        return await this.service.findByIdOrFail(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear nuevo registro' })
    async create(@Body() createDto: TCreate): Promise<T> {
        return await this.service.create(createDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar registro completo' })
    @ApiParam({ name: 'id', type: String })
    async update(
        @Param('id') id: string,
        @Body() updateDto: TUpdate,
    ): Promise<T> {
        return await this.service.update(id, updateDto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar registro parcialmente' })
    @ApiParam({ name: 'id', type: String })
    async partialUpdate(
        @Param('id') id: string,
        @Body() updateDto: Partial<TUpdate>,
    ): Promise<T> {
        return await this.service.update(id, updateDto as TUpdate);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar registro' })
    @ApiParam({ name: 'id', type: String })
    async remove(@Param('id') id: string): Promise<void> {
        await this.service.delete(id);
    }

    /**
     * Override in child class to implement search logic
     * Example: return { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
     */
    protected buildSearchFilter(search: string): WhereClause {
        return {};
    }
}
